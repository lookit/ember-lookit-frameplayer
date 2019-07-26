import Ember from 'ember';
import { observer } from '@ember/object';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule mixins
 */

/**
 * A mixin that can be used to add basic support for video recording to a particular experiment frame
 *
 * By default, the recorder will be installed when this frame loads, but recording
 * will not start automatically. To override either of these settings, set
 * the properties `doUseCamera` and/or `startRecordingAutomatically` in the consuming
 * frame.
 *
 * You will also need to set `sessionRecorderElement` if the recorder is to be housed other than
 * in an element identified by the ID `recorder`.
 *
 * The properties `recorder`, `sessionRecorderReady`, and
 * `sessionVideoId` become available to the consuming frame. The recorder object has fields
 * that give information about its state: `hasWebCam`, 'hasCamAccess`, `recording`,
 * `connected`, and `micChecked` - for details, see services/video-recorder.js. These
 * can be accessed from the consuming frame as e.g. `this.get('recorder').get('hasWebCam')`.
 *
 * If starting recording automatically, the function `whenPossibleToRecord` will be called
 * once recording is possible, and will start recording. If you want to do other things
 * at this point, like proceeding to a test trial, you can override this function in your
 * frame.
 *
 * See 'methods' for the functions you can use on a frame that extends VideoRecord.
 *
 * Events recorded in a frame that extends VideoRecord will automatically have additional
 * fields sessionVideoId (video filename), pipeId (temporary filename initially assigned by
 * the recording service),
 * and streamTime (when in the video they happened, in s).
 *
 * Setting up the camera is handled in didInsertElement, and making sure recording is
 * stopped is handled in willDestroyElement (Ember hooks that fire during the component
 * lifecycle). It is very important (in general, but especially when using this mixin)
 * that you call `this._super(...arguments);` in any functions where your frame overrides
 * hooks like this, so that the mixin's functions get called too!
 *
 *
 * @class SessionRecordMixin
 */

/**
 * When recorder detects a change in camera access
 *
 * @event hasCamAccess
 * @param {Boolean} hasCamAccess
 */

/**
 * When recorder detects a change in video stream connection status
 *
 * @event videoStreamConnection
 * @param {String} status status of video stream connection, e.g.
 * 'NetConnection.Connect.Success' if successful
 */

/**
 * Just before stopping webcam video capture
 *
 * @event stoppingCapture
 */

export default Ember.Mixin.create({

    /**
     * The recorder object, accessible to the consuming frame. Includes properties
     * recorder.nWebcams, recorder.hasCamAccess, recorder.micChecked, recorder.connected.
     * @property {VideoRecorder} sessionRecorder
     */
    sessionRecorder: Ember.computed.alias('session.recorder'),
    sessionRecordingInProgress: Ember.computed.alias('session.recordingInProgress'),

    /**
     * A video ID to use for the current recording. Format is
     * `videoStream_<experimentId>_multiframe-<frameIdOfFirstFrame>_<sessionId>_timestampMS_RRR`
     * where RRR are random numeric digits.
     *
     * @property {String} sessionVideoId
     */
    sessionVideoId: Ember.computed.alias('session.videoId'),

    sessionRecorderService: Ember.inject.service('video-recorder'), // equiv to passing 'video-recorder'

    /**
     * JQuery ID to identify the recorder element.
     * @property {String} [sessionRecorderElement='#recorder']
     */
    sessionRecorderElement: 'sessionRecorder',

    startSessionRecording: false,
    endSessionRecording: false,

    /**
     * Whether recorder has been set up yet. Automatically set when doing setup.
     * @property {Boolean} sessionRecorderReady
     */
    sessionRecorderReady: false,

    /**
     * Whether to do audio-only (vs also video) recording. Can be overridden by consuming frame.
     * @property {Number} sessionAudioOnly
     * @default 0
     */
    sessionAudioOnly: 0,

    _generateSessionVideoId() {
        return [
            'videoStream',
            this.get('experiment.id'),
            'multiframe-' + this.get('id'),
            this.get('session.id'),
            +Date.now(), // Timestamp in ms
            Math.floor(Math.random() * 1000)
        ].join('_');
    },

    /**
     * Extend any base time event capture with information about the recorded video
     * @method makeTimeEvent
     * @param eventName
     * @param extra
     * @return {Object} Event data object
     */
      makeTimeEvent(eventName, extra) {
         // If there is a current session recording, add some extra info
         let base = this._super(eventName, extra);
         if (this.get('sessionRecorder') && this.get('sessionRecordingInProgress')) {
             Ember.assign(base, {
                 sessionVideoId: this.get('sessionVideoId'),
                 sessionPipeId: this.get('sessionRecorder').get('pipeVideoName'),
                 sessionStreamTime: this.get('sessionRecorder').getTime()
             });
         }

         return base;
     },

    /**
     * Set up a video recorder instance
     * @method setupRecorder
     * @param {Node} element A DOM node representing where to mount the recorder
     * @return {Promise} A promise representing the result of installing the recorder
     */
    setupSessionRecorder(element) {

        const maxRecordingLength = 100000000;
        const autosave = 1;
        const sessionVideoId = this._generateSessionVideoId();
        this.get('session').set('videoId', sessionVideoId);
        const sessionRecorder = this.get('sessionRecorderService').start(sessionVideoId, element);
        const pipeLoc = Ember.getOwner(this).resolveRegistration('config:environment').pipeLoc;
        const pipeEnv = Ember.getOwner(this).resolveRegistration('config:environment').pipeEnv;
        const installPromise = sessionRecorder.install(sessionVideoId, pipeLoc, pipeEnv,
          maxRecordingLength, autosave, this.get('sessionAudioOnly'));

        // Track specific events for all frames that use  VideoRecorder
        var _this = this;
        sessionRecorder.on('onCamAccess', (recId, hasAccess) => {   // eslint-disable-line no-unused-vars
            if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
                _this.send('setTimeEvent', 'sessionRecorder.hasCamAccess', {
                    hasCamAccess: hasAccess
                });
            }
        });
        sessionRecorder.on('onConnectionStatus', (recId, status) => {   // eslint-disable-line no-unused-vars
            if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
                _this.send('setTimeEvent', 'videoStreamConnection', {
                    status: status
                });
            }
        });
        _this.get('session').set('recorder', sessionRecorder);
        return installPromise;
    },

    /**
     * Start recording
     * @method startSessionRecorder
     * @return Promise Resolves when recording has started
     */
    startSessionRecorder() {
        const sessionRecorder = this.get('sessionRecorder');
        if (sessionRecorder) {
            return sessionRecorder.record().then(() => {
                this.send('setTimeEvent', 'startRecording');
            });
        } else {
            return Ember.RSVP.resolve();
        }
    },

    /**
     * Stop the recording
     * @method stopSessionRecorder
     * @return Promise A promise that resolves when upload is complete
     */
    stopSessionRecorder() {
        const sessionRecorder = this.get('sessionRecorder');
        if (sessionRecorder && sessionRecorder.get('recording')) {
            this.send('setTimeEvent', 'stoppingCapture');
            return sessionRecorder.stop();
        } else {
            return Ember.RSVP.resolve(1);
        }
    },

    /**
     * Destroy recorder and stop accessing webcam
     * @method destroyRecorder
     */
    destroyRecorder() {
        const sessionRecorder = this.get('sessionRecorder');
        if (sessionRecorder) {
            if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
                this.send('setTimeEvent', 'destroyingRecorder');
            }
            sessionRecorder.destroy();
        }
    },

    willDestroyElement() {
        var _this = this;
        if (_this.get('endSessionRecording') && _this.get('sessionRecorder')) {
            _this.stopSessionRecorder().finally(() => {
                _this.get('session').set('recordingInProgress', false);
                _this.destroyRecorder();
            });
        }
        _this._super(...arguments);
    },

    didInsertElement() {
        if (this.get('startSessionRecording')) {
            var _this = this;

            this.setupSessionRecorder($('#' + this.get('sessionRecorderElement'))).then(() => {
                /**
                 * When video recorder has been installed
                 *
                 * @event sessionRecorderReady
                 */
                _this.send('setTimeEvent', 'sessionRecorderReady');
                _this.get('session').set('recordingInProgress', true);
                _this.set('sessionRecorderReady', true);
                _this.whenPossibleToRecordSession(); // make sure this fires
            });
        }
        this._super(...arguments);
    },

    /**
     * Observer that starts recording once recorder is ready. Override to do additional
     * stuff at this point!
     * @method whenPossibleToRecord
     */
    whenPossibleToRecordSession: observer('sessionRecorder.hasCamAccess', 'sessionRecorderReady', function() {
        if (this.get('startSessionRecording')) {
            var _this = this;
            if (this.get('sessionRecorder.hasCamAccess') && this.get('sessionRecorderReady')) {
                this.startSessionRecorder().then(() => {
                    _this.set('sessionRecorderReady', false);
                });
            }
        }
    }),

    /**
     * Hide the recorder from display. Useful if you would like to keep recording without extra UI elements to
     *   distract the user.
     * @method hideRecorder
     */
    hideSessionRecorder() {
        $(this.get('sessionRecorderElement')).parent().addClass('video-recorder-hidden');
    },

    /**
     * Show the recorder to the user. Useful if you want to temporarily show a hidden recorder- eg to let the user fix
     *   a problem with video capture settings
     * @method showRecorder
     */
    showSessionRecorder() {
        $(this.get('sessionRecorderElement')).parent().removeClass('video-recorder-hidden');
    }

});
