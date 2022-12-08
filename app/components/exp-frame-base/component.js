import Ember from 'ember';
import Ajv from 'ajv';

//import config from 'ember-get-config';
import FullScreen from '../../mixins/full-screen';
import SessionRecord from '../../mixins/session-record';

/**
 * @module exp-player
 * @submodule frames
 */

/** An abstract component to extend when defining new Lookit frames
 *
 * This provides common base behavior for all experiment frames.
 *
 * As a user you will almost never need to insert a component into a template directly - the platform should handle that
 *  by automatically inserting an <a href="../classes/Exp-player.html" class="crosslink">exp-player</a> component when your experiment starts.
 *
 * @example
 {{
      component currentFrameTemplate
        frameIndex=frameIndex
        frameConfig=currentFrameConfig
        frameContext=currentFrameContext

        session=session
        experiment=experiment

        next=(action 'next')
        exit=(action 'exit')
        setLanguage=(action 'setLanguage')
        previous=(action 'previous')
        saveHandler=(action 'saveFrame')
        extra=extra
    }}``
 *
 * @class ExpFrameBase
     * @param generateProperties{String} - Function to generate additional properties for this frame (like {"kind": "exp-lookit-text"})
     * at the time the frame is initialized. Allows behavior of study to depend on what has
     * happened so far (e.g., answers on a form or to previous test trials).
     * Must be a valid Javascript function, returning an object, provided as
     * a string.
     *
     *
     * Arguments that will be provided are: `expData`, `sequence`, `child`, `pastSessions`, `conditions`.
     *
     *
     * `expData`, `sequence`, and `conditions` are the same data as would be found in the session data shown
     * on the Lookit experimenter interface under 'Individual Responses', except that
     * they will only contain information up to this point in the study.
     *
     *
     * `expData` is an object consisting of `frameId`: `frameData` pairs; the data associated
     * with a particular frame depends on the frame kind.
     *
     *
     * `sequence` is an ordered list of frameIds, corresponding to the keys in `expData`.
     *
     *
     * `conditions` is an object representing the data stored by any randomizer frames;
     * keys are `frameId`s for randomizer frames and data stored depends on the randomizer
     * used.
     *
     *
     * `child` is an object that has the following properties - use child.get(propertyName)
     * to access:
     * - `additionalInformation`: String; additional information field from child form
     * - `ageAtBirth`: String; child's gestational age at birth in weeks. Possible values are
     *   "24" through "39", "na" (not sure or prefer not to answer),
     * "<24" (under 24 weeks), and "40>" (40 or more weeks).
     * - `birthday`: Date object
     * - `gender`: "f" (female), "m" (male), "o" (other), or "na" (prefer not to answer)
     * - `givenName`: String, child's given name/nickname
     * - `id`: String, child UUID
     * - `languageList`: String, space-separated list of languages child is exposed to
     * (2-letter codes)
     * - `conditionList`: String, space-separated list of conditions/characteristics
     * of child from registration form, as used in criteria expression, e.g.
     * "autism_spectrum_disorder deaf multiple_birth"
     *
     *
     * `pastSessions` is a list of previous response objects for this child and this study,
     * ordered starting from most recent (at index 0 is this session!). Each has properties
     * (access as pastSessions[i].get(propertyName)):
     * - `completed`: Boolean, whether they submitted an exit survey
     * - `completedConsentFrame`: Boolean, whether they got through at least a consent frame
     * - `conditions`: Object representing any conditions assigned by randomizer frames
     * - `createdOn`: Date object
     * - `expData`: Object consisting of frameId: frameData pairs
     * - `globalEventTimings`: list of any events stored outside of individual frames - currently
     *   just used for attempts to leave the study early
     * - `sequence`: ordered list of frameIds, corresponding to keys in expData
     * - `isPreview`: Boolean, whether this is from a preview session (possible in the event
     *   this is an experimenter's account)
     *
     *
     * Example:
     * ```
     * function(expData, sequence, child, pastSessions, conditions) {
     *     return {
     *        'blocks':
     *             [
     *                 {
     *                     'text': 'Name: ' + child.get('givenName')
     *                 },
     *                 {
     *                     'text': 'Frame number: ' + sequence.length
     *                 },
     *                 {
     *                     'text': 'N past sessions: ' + pastSessions.length
     *                 }
     *             ]
     *       };
     *   }
     * ```
     *
     *
     *  (This example is split across lines for readability; when added to JSON it would need
     *  to be on one line.)

 *
 * @uses Full-screen
 * @uses Session-record
 */
let ExpFrameBase = Ember.Component.extend(FullScreen, SessionRecord, {
    toast: Ember.inject.service(),
    // {String} the unique identifier for the _instance_
    id: null,
    kind: null,

    classNames: ['lookit-frame'],

    extra: {},

    mergedProperties: ['frameSchemaProperties'],
    concatenatedProperties: ['frameSchemaRequired'],

    frameSchemaRequired: [],
    frameSchemaProperties: { // Configuration parameters, which can be auto-populated from the experiment structure JSON
    },

    meta: { // Configuration for all fields available on the component/template
        data: { // Controls what and how parameters are serialized and sent to the server. Ideally there should be a validation mechanism.
            type: 'object',
            properties: {}
        }
    },
    // {Number} the current exp-player frameIndex
    frameIndex: null,
    frameConfig: null,
    frameContext: null,
    frameType: 'DEFAULT',
    eventTimings: null,

    /**
     * Function to generate additional properties for this frame (like {"kind": "exp-lookit-text"})
     * at the time the frame is initialized. Allows behavior of study to depend on what has
     * happened so far (e.g., answers on a form or to previous test trials).
     * Must be a valid Javascript function, returning an object, provided as
     * a string.
     *
     *
     * Arguments that will be provided are: `expData`, `sequence`, `child`, `pastSessions`, `conditions`.
     *
     *
     * `expData`, `sequence`, and `conditions` are the same data as would be found in the session data shown
     * on the Lookit experimenter interface under 'Individual Responses', except that
     * they will only contain information up to this point in the study.
     *
     *
     * `expData` is an object consisting of `frameId`: `frameData` pairs; the data associated
     * with a particular frame depends on the frame kind.
     *
     *
     * `sequence` is an ordered list of frameIds, corresponding to the keys in `expData`.
     *
     *
     * `conditions` is an object representing the data stored by any randomizer frames;
     * keys are `frameId`s for randomizer frames and data stored depends on the randomizer
     * used.
     *
     *
     * `child` is an object that has the following properties - use child.get(propertyName)
     * to access:
     * - `additionalInformation`: String; additional information field from child form
     * - `ageAtBirth`: String; child's gestational age at birth in weeks. Possible values are
     *   "24" through "39", "na" (not sure or prefer not to answer),
     * "<24" (under 24 weeks), and "40>" (40 or more weeks).
     * - `birthday`: Date object
     * - `gender`: "f" (female), "m" (male), "o" (other), or "na" (prefer not to answer)
     * - `givenName`: String, child's given name/nickname
     * - `id`: String, child UUID
     * - `languageList`: String, space-separated list of languages child is exposed to
     * (2-letter codes)
     * - `conditionList`: String, space-separated list of conditions/characteristics
     * of child from registration form, as used in criteria expression, e.g.
     * "autism_spectrum_disorder deaf multiple_birth"
     *
     *
     * `pastSessions` is a list of previous response objects for this child and this study,
     * ordered starting from most recent (at index 0 is this session!). Each has properties
     * (access as pastSessions[i].get(propertyName)):
     * - `completed`: Boolean, whether they submitted an exit survey
     * - `completedConsentFrame`: Boolean, whether they got through at least a consent frame
     * - `conditions`: Object representing any conditions assigned by randomizer frames
     * - `createdOn`: Date object
     * - `expData`: Object consisting of frameId: frameData pairs
     * - `globalEventTimings`: list of any events stored outside of individual frames - currently
     *   just used for attempts to leave the study early
     * - `sequence`: ordered list of frameIds, corresponding to keys in expData
     * - `isPreview`: Boolean, whether this is from a preview session (possible in the event
     *   this is an experimenter's account)
     *
     *
     * Example:
     * ```
     * function(expData, sequence, child, pastSessions, conditions) {
     *     return {
     *        'blocks':
     *             [
     *                 {
     *                     'text': 'Name: ' + child.get('givenName')
     *                 },
     *                 {
     *                     'text': 'Frame number: ' + sequence.length
     *                 },
     *                 {
     *                     'text': 'N past sessions: ' + pastSessions.length
     *                 }
     *             ]
     *       };
     *   }
     * ```
     *
     *
     *  (This example is split across lines for readability; when added to JSON it would need
     *  to be on one line.)
     *
     * @property {String} generateProperties
     * @default null
     */
    generateProperties: null,
    generatedProperties: null,
    _generatePropertiesFn: null,

    /**
     * Function to select which frame index to go to when using the 'next' action on this
     * frame. Allows flexible looping / short-circuiting based on what has happened so far
     * in the study (e.g., once the child answers N questions correctly, move on to next
     * segment). Must be a valid Javascript function, returning a number from 0 through
     * frames.length - 1, provided as a string.
     *
     *
     * Arguments that will be provided are:
     * `frames`, `frameIndex`, `expData`, `sequence`, `child`, `pastSessions`
     *
     *
     * `frames` is an ordered list of frame configurations for this study; each element
     * is an object corresponding directly to a frame you defined in the
     * JSON document for this study (but with any randomizer frames resolved into the
     * particular frames that will be used this time).
     *
     *
     * `frameIndex` is the index in `frames` of the current frame
     *
     *
     * `expData` is an object consisting of `frameId`: `frameData` pairs; the data associated
     * with a particular frame depends on the frame kind.
     *
     *
     * `sequence` is an ordered list of frameIds, corresponding to the keys in `expData`.
     *
     *
     * `child` is an object that has the following properties - use child.get(propertyName)
     * to access:
     * - `additionalInformation`: String; additional information field from child form
     * - `ageAtBirth`: String; child's gestational age at birth in weeks. Possible values are
     *   "24" through "39", "na" (not sure or prefer not to answer),
     * "<24" (under 24 weeks), and "40>" (40 or more weeks).
     * - `birthday`: timestamp in format "Mon Apr 10 2017 20:00:00 GMT-0400 (Eastern Daylight Time)"
     * - `gender`: "f" (female), "m" (male), "o" (other), or "na" (prefer not to answer)
     * - `givenName`: String, child's given name/nickname
     * - `id`: String, child UUID
     *
     *
     * `pastSessions` is a list of previous response objects for this child and this study,
     * ordered starting from most recent (at index 0 is this session!). Each has properties
     * (access as pastSessions[i].get(propertyName)):
     * - `completed`: Boolean, whether they submitted an exit survey
     * - `completedConsentFrame`: Boolean, whether they got through at least a consent frame
     * - `conditions`: Object representing any conditions assigned by randomizer frames
     * - `createdOn`: timestamp in format "Thu Apr 18 2019 12:33:26 GMT-0400 (Eastern Daylight Time)"
     * - `expData`: Object consisting of frameId: frameData pairs
     * - `globalEventTimings`: list of any events stored outside of individual frames - currently
     *   just used for attempts to leave the study early
     * - `sequence`: ordered list of frameIds, corresponding to keys in expData
     *
     *
     * Example that just sends us to the last frame of the study no matter what:
     * ``"function(frames, frameIndex, frameData, expData, sequence, child, pastSessions) {return frames.length - 1;}"```
     *
     *
     * @property {String} selectNextFrame
     * @default null
     */
    selectNextFrame: null,
    _selectNextFrameFn: null,

    /**
     * An object containing values for any parameters (variables) to use in this frame.
     * Any property VALUES in this frame that match any of the property NAMES in `parameters`
     * will be replaced by the corresponding parameter value. For example, suppose your frame
     * is:
     *
```
{
    'kind': 'FRAME_KIND',
    'parameters': {
        'FRAME_KIND': 'exp-lookit-text'
    }
}
```
     *
     * Then the frame `kind` will be `exp-lookit-text`. This may be useful if you need
     * to repeat values for different frame properties, especially if your frame is actually
     * a randomizer or group. You may use parameters nested within objects (at any depth) or
     * within lists.
     *
     * You can also use selectors to randomly sample from or permute
     * a list defined in `parameters`. Suppose `STIMLIST` is defined in
     * `parameters`, e.g. a list of potential stimuli. Rather than just using `STIMLIST`
     * as a value in your frames, you can also:
     *
     * * Select the Nth element (0-indexed) of the value of `STIMLIST`: (Will cause error if `N >= THELIST.length`)
```
    'parameterName': 'STIMLIST#N'
```
     * * Select (uniformly) a random element of the value of `STIMLIST`:
```
    'parameterName': 'STIMLIST#RAND'
```
    * * Set `parameterName` to a random permutation of the value of `STIMLIST`:
```
    'parameterName': 'STIMLIST#PERM'
```
    * * Select the next element in a random permutation of the value of `STIMLIST`, which is used across all
    * substitutions in this randomizer. This allows you, for instance, to provide a list
    * of possible images in your `parameterSet`, and use a different one each frame with the
    * subset/order randomized per participant. If more `STIMLIST#UNIQ` parameters than
    * elements of `STIMLIST` are used, we loop back around to the start of the permutation
    * generated for this randomizer.
```
    'parameterName': 'STIMLIST#UNIQ'
```
     *
     * @property {Object[]} parameters
     * @default {}
     */
    parameters: {},

    session: null,

    frameStartTimestamp: null, // keep track of when frame started to store duration

    // see https://github.com/emberjs/ember.js/issues/3908. Moved
    // to init because we were losing the first event per instance of a frame
    // when it was in didReceiveAttrs.
    setTimings: Ember.on('init', function () {
        this.set('eventTimings', []);
    }),

    loadData: function (frameData) { // eslint-disable-line no-unused-vars
        return null;
    },

    didReceiveAttrs: function () {
        this._super(...arguments);

        if (!this.get('frameConfig')) {
            return;
        }

        let currentFrameIndex = this.get('frameIndex', null);

        let defaultParams = this.setupParams(true);
        Object.keys(defaultParams).forEach((key) => {
            this.set(key, defaultParams[key]);
        });

        if (!this.get('id')) {
            this.set('id', `${this.get('kind')}-${currentFrameIndex}`);
        }

        // Finalize the frame ID! Handle case where due to navigation, frameId already exists in the sequence.
        let sequence = this.get('session').get('sequence');
        let origId = this.get('id');
        if (sequence.includes(origId)) {
            // Get stub: This ID with any -repeat-N removed
            let repeatedFramePattern = /-repeat-(\d+)$/;
            let stub = origId;
            if (repeatedFramePattern.test(origId)) {
                stub = origId.replace(repeatedFramePattern, '');
            }
            // Find lowest N where stub-repeat-N doesn't already exist
            let framePatternString = `^${stub}-repeat-(?<repeat>\\d+)$`;
            let thisFramePattern = new RegExp(framePatternString);
            let existingRepeatIndices = [];
            sequence.forEach(function (frId) {
                let match = frId.match(thisFramePattern);
                if (match) {
                    existingRepeatIndices.push(match.groups.repeat);
                }
            });
            // Call this frame stub-repeat-N+1
            let repeatIndex = existingRepeatIndices.length ? Math.max(...existingRepeatIndices) + 1 : 1;
            this.set('id', stub + '-repeat-' + repeatIndex);
        }

        let session = this.get('session');
        let expData = session ? session.get('expData') : null;

        // Use the provided generateProperties fn, if any, to generate properties for this
        // frame on-the-fly based on expData, sequence, child, & pastSessions.
        if (this.get('generateProperties')) { // Only if generateProperties is non-empty
            try {
                this.set('_generatePropertiesFn', Function('return ' + this.get('generateProperties'))());
            } catch (error) {
                console.error(error);
                throw new Error('generateProperties provided for this frame, but cannot be evaluated.');
            }
            if (typeof (this.get('_generatePropertiesFn')) === 'function') {
                let sequence = session ? session.get('sequence', null) : null;
                let child = session ? session.get('child', null) : null;
                let conditions = session ? session.get('conditions', {}) : {};
                let frameContext = this.get('frameContext');
                let pastSessions = frameContext ? frameContext.pastSessions : null;
                let generatedParams = this._generatePropertiesFn(expData, sequence, child, pastSessions, conditions);
                if (typeof (generatedParams) === 'object') {
                    this.set('generatedProperties', generatedParams);
                    Object.keys(generatedParams).forEach((key) => {
                        this.set(key, generatedParams[key]);
                    });
                } else {
                    throw new Error('generateProperties function provided for this frame, but did not return an object');
                }
            } else {
                throw new Error('generateProperties provided for this frame, but does not evaluate to a function');
            }
        }

        // Use the provided selectNextFrame fn, if any, to determine which frame should come
        // next.
        if (this.get('selectNextFrame')) { // Only if selectNextFrame is non-empty
            try {
                this.set('_selectNextFrameFn', Function('return ' + this.get('selectNextFrame'))());
            } catch (error) {
                console.error(error);
                throw new Error('selectNextFrame provided for this frame, but cannot be evaluated.');
            }
            if (!(typeof (this.get('_selectNextFrameFn')) === 'function')) {
                throw new Error('selectNextFrame provided for this frame, but does not evaluate to a function');
            }
        }

        // After adding any generated properties, check that all required fields are set
        if (this.get('frameSchemaProperties').hasOwnProperty('required')) {
            var requiredFields = this.get('frameSchemaProperties.required', []);
            requiredFields.forEach((key) => {
                if (!this.hasOwnProperty(key) || this.get(key) === undefined) {
                    // Don't actually throw an error here because the frame may actually still function and that's probably good
                    console.error(`Missing required parameter '${key}' for frame of kind '${this.get('kind')}'.`);
                }
            });
        }

        // Use JSON schema validator to check that all values are within specified constraints
        var ajv = new Ajv({
            allErrors: true,
            verbose: true
        });
        var frameSchema = {type: 'object', properties: this.get('frameSchemaProperties')};
        try {
            var validate = ajv.compile(frameSchema);
            var valid = validate(this);
            if (!valid) {
                console.warn('Invalid: ' + ajv.errorsText(validate.errors));
            }
        }
        catch (error) {
            console.error(`Failed to compile frameSchemaProperties to use for validating researcher usage of frame type '${this.get('kind')}.`);
        }

        // Set the language (do this after generating properties to allow use of a generated language property)
        if (this.get('language')) {
            try {
                this.sendAction('setLanguage', this.get('language'));
            } catch (error) {
                console.error(`Failed to set language to ISO code ${this.get('language')}`);
            }
        }

        this.set('_oldFrameIndex', currentFrameIndex);
    },

    // Internal save logic
    _save() {
        var frameId = `${this.get('id')}`;  // don't prepend frameindex, done by parser
        // When exiting frame, save the data to the base player using the provided saveHandler
        const payload = this.serializeContent();
        return this.attrs.saveHandler(frameId, payload);
    },

    // Display error messages related to save failures
    displayError(error) { // eslint-disable-line no-unused-vars
        // If the save failure was a server error, warn the user. This error should never disappear.
        // Note: errors are not visible in FS mode, which is generally the desired behavior so as not to silently
        // bias infant looking time towards right.
        const msg = 'Please check your internet connection and (in another tab or window) that you are still logged in to Lookit. If another error like this still shows up as you continue, please contact lookit-tech@mit.edu to let us know!';
        this.get('toast').error(msg, 'Error: Could not save data', {timeOut: 0, extendedTimeOut: 0});
    },

    setupParams(clean) {
        // Add config properties and data to be serialized as instance parameters (overriding with values explicitly passed in)
        var params = this.get('frameConfig');

        var defaultParams = {};
        Object.keys(this.get('frameSchemaProperties') || {}).forEach((key) => {
            defaultParams[key] = this.get(`frameSchemaProperties.${key}.default`);
        });

        Object.keys(this.get('meta.data').properties || {}).forEach((key) => {
            if (this[key] && this[key].isDescriptor) {
                return;
            }
            var value = !clean ? this.get(key) : undefined;
            if (typeof value === 'undefined') {
                // Make deep copy of the default value (to avoid subtle reference errors from reusing mutable containers)
                defaultParams[key] = Ember.copy(this.get(`frameSchemaProperties.${key}.default`), true);
            } else {
                defaultParams[key] = value;
            }
        });

        // Need to explicitly set defaults for non-meta properties here, otherwise defaults
        // do not overwrite previous properties when no value is provided on the next
        // frame.
        defaultParams.generateProperties = null;
        defaultParams.generatedProperties = null;
        defaultParams.selectNextFrame = null;
        defaultParams.parameters = null;
        Ember.assign(defaultParams, params);

        return defaultParams;
    },

    _translate(text) {
        return this.get('parentView').get('intl').lookup(text);
    },

    /**
     * Any properties generated via a custom generateProperties function provided to this
     * frame (e.g., a score you computed to decide on feedback). In general will be null.
     * @attribute generatedProperties
     */

    /**
     * Duration between frame being inserted and call to `next`
     * @attribute frameDuration
     */

    /**
     * Type of frame: EXIT (exit survey), CONSENT (consent or assent frame), or DEFAULT
     * (anything else)
     * @attribute frameType
     */

    /**
     * Ordered list of events captured during this frame (oldest to newest). Each event is
     * represented as an object with at least the properties
     * `{'eventType': EVENTNAME, 'timestamp': TIMESTAMP}`.
     * See Events tab for details of events that might be captured.
     * @attribute eventTimings
     */

    /**
     * Each frame that extends ExpFrameBase will send at least an array `eventTimings`,
     * a frame type, and any generateProperties back to the server upon completion.
     * Individual frames may define additional properties that are sent.
     *
     * @param {Array} eventTimings
     * @method serializeContent
     * @return {Object}
     */
    serializeContent() {
        // Serialize selected parameters for this frame, plus eventTiming data
        var serialized = this.getProperties(Object.keys(this.get('meta.data.properties') || {}));
        serialized.generatedProperties = this.get('generatedProperties');
        serialized.eventTimings = this.get('eventTimings');
        serialized.frameType = this.get('frameType');
        try {
            serialized.frameDuration = (new Date().getTime() - this.get('frameStartTimestamp'))/1000;
        } catch(e){
            serialized.frameDuration = null;
        }
        return serialized;
    },

    /**
     * Create the time event payload for a particular frame / event. This can be overridden to add fields to every
     *  event sent by a particular frame
     * @method makeTimeEvent
     * @param {String} eventName
     * @param {Object} [extra] An object with additional properties to be sent to the server
     * @return {Object} Event type, time, and any additional metadata provided
     */
    makeTimeEvent(eventName, extra) {
        const curTime = new Date();
        const eventData = {
            eventType: `${this.get('kind', 'unknown-frame')}:${eventName}`,
            timestamp: curTime.toISOString()
        };
        Ember.assign(eventData, extra);
        // Add some extra info if there's session recording ongoing
        if (this.get('sessionRecorder') && this.get('sessionRecordingInProgress')) {
            Ember.assign(eventData, {
                sessionStreamTime: this.get('sessionRecorder').getTime()
            });
        }
        return eventData;

    },

    setSessionCompleted() {
        this.get('session').set('completed', true);
    },

    actions: {
        setTimeEvent(eventName, extra) {
            let eventData = this.makeTimeEvent(eventName, extra);
            console.log(`Timing event captured for ${eventName}`, eventData);
            // Copy timing event into a single dict for this component instance
            let timings = this.get('eventTimings');
            timings.push(eventData);
            this.set('eventTimings', timings);
        },

        save() {
            // Show an error if saving fails
            this._save().catch(err => this.displayError(err));
        },

        next() {

            this.send('setTimeEvent', 'nextFrame');

            // Determine which frame to go to next
            var iNextFrame = -1;
            if (this._selectNextFrameFn) {
                var session = this.get('session');
                var expData = session ? session.get('expData') : null;
                var sequence = session ? session.get('sequence', null) : null;
                var child = session ? session.get('child', null) : null;
                var frameContext = this.get('frameContext');
                var pastSessions = frameContext ? frameContext.pastSessions : null;
                var frames = this.get('parentView').get('frames');
                var frameIndex = this.get('frameIndex');
                var frameData = this.serializeContent(); // note - may not have saved to expData yet at time of call

                iNextFrame = this._selectNextFrameFn(frames, frameIndex, frameData, expData, sequence, child, pastSessions);
                if (!(typeof (iNextFrame) === 'number')) {
                    throw new Error('selectNextFrame function provided for this frame, but did not return a number');
                }
            }

            // Note: this will allow participant to proceed even if saving fails. The
            // reason not to execute 'next' within this._save().then() is that an action
            // executed as a promise doesn't count as a 'user interaction' event, so
            // we wouldn't be able to enter FS mode upon starting the next frame. Given
            // that the user is likely to have limited ability to FIX a save error, and the
            // only thing they'll really be able to do is try again anyway, preventing
            // them from continuing is unnecessarily disruptive.
            // 3/5/2021: It actually appears to be ok to enter FS from within the .finally() clause of a promise,
            // but we still don't want to hold up moving to the next frame for the ~1s until saving succeeds.
            this.send('save');

            if (this.get('endSessionRecording') && this.get('sessionRecorder')) {
                let _this = this;
                if (!(this.get('session').get('recordingInProgress'))) {
                    _this.sendAction('next', iNextFrame);
                } else {
                    this.get('session').set('recordingInProgress', false);
                    this.stopSessionRecorder().finally(() => {
                        _this.sendAction('next', iNextFrame);
                    });
                }
            } else {
                this.sendAction('next', iNextFrame);
            }

        },

        goToFrameIndex(frameIndex) {

            // Note: this will allow participant to proceed even if saving fails as in next()
            this.send('save');
            this.set('_oldFrameIndex', -1); // Pretend no old frame index so we treat this as "clean" during didReceiveAttrs


            if (this.get('endSessionRecording') && this.get('sessionRecorder')) {
                let _this = this;
                if (!(this.get('session').get('recordingInProgress'))) {
                    _this.sendAction('next', frameIndex);
                } else {
                    this.get('session').set('recordingInProgress', false);
                    this.stopSessionRecorder().finally(() => {
                        _this.sendAction('next', frameIndex);
                    });
                }
            } else {
                this.sendAction('next', frameIndex);
            }
        },

        previous() {
            /**
             * Move to previous frame
             *
             * @event previousFrame
             */
            this.send('setTimeEvent', 'previousFrame');
            this.send('save');
            this.sendAction('previous');
        },

        exit() {
            this.sendAction('exit');
        }
    },

    didInsertElement() {
        // Add different classes depending on whether fullscreen mode is
        // being triggered as part of standard frame operation or as an override to a frame
        // that is not typically fullscreen. In latter case, keep formatting as close to
        // before as possible, to enable forms etc. to work ok in fullscreen mode

        Ember.$('*').removeClass('player-fullscreen');
        Ember.$('*').removeClass('player-fullscreen-override');
        Ember.$('#application-parse-error-text').hide();
        this.set('frameStartTimestamp', new Date().getTime());
        var $element = Ember.$(`#${this.get('fullScreenElementId')}`);
        if (this.get('displayFullscreenOverride') && !this.get('displayFullscreen')) {
            $element.addClass('player-fullscreen-override');
        } else {
            $element.addClass('player-fullscreen');
        }
        // Set to non-fullscreen (or FS if overriding) immediately, except for frames displayed fullscreen.
        // Note: if this is defined the same way in full-screen.js, it gets called twice
        // for reasons I don't yet understand.
        if (this.get('displayFullscreenOverride') || this.get('displayFullscreen')) {
            this.showFullscreen();
        } else {
            this.exitFullscreen();
        }
        this._super(...arguments);
    }
});

export default ExpFrameBase;
