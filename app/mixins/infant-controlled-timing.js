import Ember from 'ember';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule mixins
 */

/**
 *
 * Reference for DEVELOPERS of new frames only!
 *
 * Mixin to allow parent to control frame progression by holding down a key when the child is not looking.
 * Enables "infant-controlled" study designs via parent live-coding of infant looking behavior.
 *
 * To add this behavior to an existing frame:
 *
 * 1) Call `this.startParentControl()` at the point you want looking time to start being measured.
 *    The parent will only be able to end the trial using the endTrialKey during the parent control period. Lookaway
 *    time will only accumulate and lookaways will only be able to end the trial during the parent control period.
 *    However, lookaways will be recorded as events throughout the frame. If the child is already looking away before
 *    the parent control period begins, lookaway time will begin accumulating only after the first look.
 *
 * 2) Call `this.endParentControl()` at the point you want the parent not to be able to control frame progression anymore.
 *    For instance, if hiding stimuli and stopping recording after completing the frame, or if pausing the frame.
 *
 * 3) If you need to be able to pause and re-start the frame, call `this.endParentControl()` when pausing and
 *    `this.startParentControl()` when re-starting. Note that startParentControl will start a "fresh" looking time
 *    measurement: looking and lookaway time will both be 0, the child will not be assumed to have already looked, etc.
 *
 * 4) Define a function `onLookawayCriterion` that says what should happen when the parent presses the endTrialKey or the
 *    child reaches the lookaway criterion. E.g., this might typically move to the next frame. If needed you can access
 *    `this.get('trialEndReason')` (either 'parentEnded' or 'lookaway') to distinguish between these two possibilities.
 *
 * 5) If it is possible for the frame to end by other mechanisms than the trialEndKey or reaching the lookaway criterion,
 *    then when that happens: set the `trialEndReason` accordingly (e.g., `this.set('trialEndReason', 'ceiling')`) and
 *    call `this.setTrialEndTime()` to calculate a total looking time based on the parent's coding
 *
 * 6) So that your frame will capture information about looking time and the reason the trial ended, and make that
 *    available to the researcher, add the following to your frame's `meta.data.properties`:
 *    ```
      totalLookingTime: {
          type: 'number'
      },
      trialEndReason: {
          type: 'string'
      }
      ```
 *
 *
 *
 * @class Infant-controlled-timing
 */


var infantControlledTimingMixin = Ember.Mixin.create({

    frameSchemaProperties: {
        /**
         * Type of lookaway criterion. Must be either
         * 'total' (to count total lookaway time) or 'continuous' (to count only continuous lookaway time).
         * Whichever criterion type is used, only lookaways after the first look to the screen are considered.
         *
         * @property {String} lookawayType
         * @default 'total'
         */
        lookawayType: {
            type: 'string',
            enum: ['total', 'continuous'],
            default: 'total',
            description: 'Type of lookaway criterion - count total lookaway time or continuous lookaway time'
        },

        /**
         * Lookaway threshold in seconds. How long does the child need to look away before the trial ends? Depending on
         * the lookawayType, this will refer either to the total amount of time the child has looked away since their
         * first look to the screen, or to the length of a single continuous lookaway.
         *
         * @property {String} lookawayThreshold
         * @default 2
         */
        lookawayThreshold: {
            type: 'number',
            default: 2,
            description: 'Number of seconds baby can look away (total or at once, depending on lookawayType) before trial ends'
        },

        /**
         Key parent should press to indicate the child is looking away. If a key is provided, then the trial will
         end if the child looks away looks long enough per the lookawayType and lookawayThreshold. You can also use
         'mouse' to indicate that mouse down/up should be used in place of key down/up events. Use an empty string,
         '', to not record any lookaways for this trial. You can look up the names of keys at https://keycode.info.
         Default is 'w'.
         @property {string} lookawayKey
         @default 'w'
         */
        lookawayKey: {
            type: 'string',
            default: 'p'
        },

        /**
         Key parent should press to manually move on to next trial. This allows you to have parents control the study
         by giving instructions like "press q when the child looks away for at least a few seconds" instead of "hold down
         w whenever the child isn't looking."  Use an empty string, '', to not allow this function
         for this trial. You can look up the names of keys at https://keycode.info. Default is 'q'.
         @property {string} endTrialKey
         @default 'q'
         */
        endTrialKey: {
            type: 'string',
            default: 'q'
        },

        /**
         Type of audio to play during parent-coded lookaways - 'tone' (A 220), 'noise' (pink noise), or 'none'. These
         tones are available at https://www.mit.edu/~kimscott/placeholderstimuli/ if you want to use them in
         instructions.
         @property {string} lookawayTone
         @default 'noise'
         */
        lookawayTone: {
            type: 'string',
            enum: ['tone', 'noise', 'none'],
            default: 'noise',
            description: 'Type of audio to play during parent-coded lookaways'
        },

        /**
         Volume of lookaway tone
         @property {string} lookawayToneVolume
         @default 0.25
         */
        lookawayToneVolume: {
            type: 'number',
            default: .25,
            description: 'Volume of lookaway tone, as fraction of full volume (1 = full volume, 0 = silent)'
        }
    },

    /**
     * Total looking time during this frame, in seconds.
     * Looking time is calculated as the total time spent looking between:
     * (1) The start of the parent control period, or the first look during that period if the child is not looking initially
     * and
     * (2) The end of the trial due to the parent pushing the end trial key, the child reaching the lookaway criterion,
     * or the frame being completed without either of these happening (e.g., a video is played N times or an image is
     * shown for N seconds).
     * All time spent looking away, per parent coding, is excluded, regardless of the duration of the lookaway.
     *
     * This value will be null if the trial is not completed by any of the above mechanisms, for instance because
     * the parent ends the study early during this frame.
     *
     * @attribute totalLookingTime
     * @type number
     */
    totalLookingTime: null,
    /**
     * What caused the trial to end: 'lookaway' (the child reached the lookaway threshold), 'parentEnded' (the parent
     * pressed the endTrialKey), or 'ceiling' (the frame ended without either of those happening).
     *
     * This value will be null if the trial is not completed by any of the above mechanisms, for instance because
     * the parent ends the study early during this frame.
     *
     * @attribute trialEndReason
     * @type string
     */
    trialEndReason: null, // Reason trial ended: lookaway, parentEnded, ceiling....

    _trialStartTime: null,
    _trialEndTime: null,

    _totalLookaway: 0, // Total lookaway time in ms
    _lastLookawayStart: null,
    _isLooking: true,

    _endTrialDueToLookawayTimer: null,

    _controlPeriodStarted: false,
    _anyLookDuringControlPeriod: false,

    _recordLookawayStart() {
        this.set('_lastLookawayStart', new Date());
        /**
         * When parent records a lookaway starting. This will be triggered at the start of this frame if the parent
         * is already holding down the lookawayKey, and otherwise only when the key is newly pressed down. Lookaways
         * are recorded regardless of whether the parent control period has started.
         *
         * @event lookawayStart
         */
        this.send('setTimeEvent', 'lookawayStart');
        // If parent control period has started, set trial to end after lookawayThreshold seconds (continuous mode)
        // or after the remaining lookaway time needed to reach lookawayThreshold seconds (total mode).
        // This timer will be cancelled when the lookaway ends if it has not been called yet.
        if (this.get('_controlPeriodStarted')) {
            let delay = (this.get('lookawayType') === 'total') ? this.get('lookawayThreshold') * 1000 - this.get('_totalLookaway') : this.get('lookawayThreshold') * 1000;
            let _this = this;
            this.set('_endTrialDueToLookawayTimer', window.setTimeout(() => {
                /**
                 * When trial ends due to lookaway criterion being reached.
                 *
                 * @event lookawayEndedTrial
                 */
                this.send('setTimeEvent', 'lookawayEndedTrial');
                this.set('trialEndReason', 'lookaway');
                this.setTrialEndTime();
                _this.onLookawayCriterion();
            }, delay));
        }
        let $lookawayTone = $('audio#lookawayTone');
        if ($lookawayTone.length) {
            $lookawayTone[0].play();
        }
    },

    _recordLookawayEnd() {
        // Cancel the timer to end the trial if the lookaway was too long
        window.clearInterval(this.get('_endTrialDueToLookawayTimer'));
        /**
         * When parent records a lookaway ending. This will NOT be triggered at the start of this frame if the parent
         * is not holding down the lookawayKey, only when the key is actually released. Lookaways
         * are recorded regardless of whether the parent control period has started.
         *
         * @event lookawayEnd
         */
        this.send('setTimeEvent', 'lookawayEnd');
        // If the parent-controlled segment has begun, track lookaway time...
        if (this.get('_controlPeriodStarted')) {
            // Increment the total lookaway time if the child has already looked at least once during the control period
            if (this.get('_anyLookDuringControlPeriod')) {
                this.set('_totalLookaway', this.get('_totalLookaway') + (new Date() - this.get('_lastLookawayStart')));
            } else { // Otherwise record that the child has looked, and we'll be ready the next time a lookaway starts.
                this.set('_trialStartTime', new Date());
                this.set('_anyLookDuringControlPeriod', true);
            }
        }
        let $lookawayTone = $('audio#lookawayTone');
        if ($lookawayTone.length) {
            $lookawayTone[0].pause();
        }
    },

    setTrialEndTime() {
        let now = new Date();
        this.set('_trialEndTime', now);
        // To get total looking time could also just take last look end - trial start - total lookaway; but actually
        // updating total lookaway time allows us to use/access totalLookaway more easily in the future
        if (!this.get('_isLooking')) {
            this.set('_totalLookaway', this.get('_totalLookaway') + (now - this.get('_lastLookawayStart')));
            // Just to avoid double-adding lookaway time in case e.g. recordLookawayEnd is called after this
            this.set('_lastLookawayStart', now);
        }
        this.set('totalLookingTime', ((this.get('_trialEndTime') - this.get('_trialStartTime')) - this.get('_totalLookaway')) / 1000);
    },

    /**
     Hook called when session recording is started automatically. Override to do
     frame-specific actions at this point (e.g., beginning a test trial).

     @method onSessionRecordingStarted
     */
    onLookawayCriterion() {

    },

    /**
     * Begin period of parent control of trial progression. After calling startParentControl(), we wait for the first
     * infant look to the screen (this may be immediate because infant is already looking. After that, whenever infant
     * look-away time reaches criterion (either due to long enough continuous lookaway, or due to cumulative time
     * looking away) we will call onLookawayCriterion().
     *
     * If startParentControl is called multiple times, each time it's called it starts a "fresh" interval of parent
     * control - i.e. no stored lookaway time, and no assumption the child has previously looked.
     *
     * @method startParentControl
     */
    startParentControl() {
        this.set('_totalLookaway', 0);
        this.set('_anyLookDuringControlPeriod', this.get('_isLooking'));
        this.set('_trialStartTime', new Date());
        this.set('_controlPeriodStarted', true);
        /**
         * When interval of parent control of trial begins - i.e., lookaways begin counting up to threshold.
         * Lookaway events are recorded throughout, but do not count towards ending trial until parent control period
         * begins.
         *
         * @event parentControlPeriodStart
         */
        this.send('setTimeEvent', 'parentControlPeriodStart');

        $(document).on('keyup.parentEndTrial', (e) => {
            if (this.checkFullscreen()) {
                if (this.get('endTrialKey') && e.key === this.get('endTrialKey')) {
                    /**
                     * When trial ends due to parent pressing key to end trial
                     *
                     * @event parentEndedTrial
                     */
                    this.send('setTimeEvent', 'parentEndedTrial');
                    this.set('trialEndReason', 'parentEnded');
                    this.setTrialEndTime();
                    this.onLookawayCriterion();
                }
            }
        });
    },

    /**
     * End period of parent control of trial progression, for instance because trial is paused. Looks to/away will
     * still be logged as events but trial will not end based on parent input.
     *
     * @method endParentControl
     */
    endParentControl() {
        this.set('_controlPeriodStarted', false);
        /**
         * When interval of parent control of trial ends - i.e., lookaways cannot lead to ending trial, parent cannot
         * press key to end trial.
         *
         * @event parentControlPeriodEnd
         */
        this.send('setTimeEvent', 'parentControlPeriodEnd');
        $(document).off('keyup.parentEndTrial');
    },

    didInsertElement() {
        this.set('_isLooking', true); // Default assumption is child is looking; hold down key for lookaway.
        this.set('_totalLookaway', 0);
        this.set('_lastLookawayStart', new Date()); // Just to make sure there's definitely a valid value
        let lookawayOffEvent = (this.get('lookawayKey') === 'mouse') ? 'mouseup.lookaway' : 'keyup.lookaway';
        let lookawayOnEvent = (this.get('lookawayKey') === 'mouse') ? 'mousedown.lookaway' : 'keydown.lookaway';
        $(document).on(lookawayOffEvent, (e) => {
            if (this.get('lookawayKey') === 'mouse' || (this.get('lookawayKey') && e.key === this.get('lookawayKey'))) {
                if (!this.get('_isLooking')) {
                    this.set('_isLooking', true);
                    this._recordLookawayEnd();
                }
            }
        });
        $(document).on(lookawayOnEvent, (e) => {
            if (this.get('lookawayKey') === 'mouse' || (this.get('lookawayKey') && e.key === this.get('lookawayKey'))) {
                if (this.get('_isLooking')) { // Holding down key generates a sequence of keydown events
                    this.set('_isLooking', false);
                    this._recordLookawayStart();
                }
            }
        });

        try {
            let useLookawayTone = this.get('lookawayTone') !== 'none';
            if (useLookawayTone) {
                const baseDir = 'https://www.mit.edu/~kimscott/placeholderstimuli/';
                let audioElement = $('<audio id="lookawayTone" loop></audio>');
                $(`<source src='${baseDir}mp3/${this.get('lookawayTone')}.mp3' type='audio/mp3'>`).appendTo(audioElement);
                $(`<source src='${baseDir}ogg/${this.get('lookawayTone')}.ogg' type='audio/ogg'>`).appendTo(audioElement);
                $('#experiment-player > div > div').append(audioElement);
                $('audio#lookawayTone')[0].volume = this.get('lookawayToneVolume');
            }
        } catch (e) {
            console.error(`Error setting lookaway tone: ${e}`);
        }

        this._super(...arguments);
    },

    willDestroyElement() { // remove event handler
        $(document).off('keyup.lookaway');
        $(document).off('keydown.lookaway');
        $(document).off('mouseup.lookaway');
        $(document).off('mousedown.lookaway');
        $(document).off('keyup.parentEndTrial');
        window.clearInterval(this.get('testTimer'));
        this._super(...arguments);
    },


});

export default infantControlledTimingMixin;
