import Ember from 'ember';
import { observer } from '@ember/object';
import VideoRecorder from '../services/video-recorder';

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
 * A mixin that can be used to add basic support for video recording to a particular experiment frame
 *
 * You will also need to set `sessionRecorderElement` if the recorder is to be housed other than
 * in an element identified by the ID `sessionRecorder`.
 *
 * The properties `sessionRecorder`, `sessionRecorderReady`, and
 * `sessionVideoId` become available to the consuming frame. The recorder object has fields
 * that give information about its state: `hasWebCam`, 'hasCamAccess`, `recording`,
 * `connected`, and `micChecked` - for details, see services/video-recorder.js. These
 * can be accessed from the consuming frame as e.g. `this.get('recorder').get('hasWebCam')`.
 *
 * If starting recording, the function `onSessionRecordingStarted` will be called
 * once recording begins. If you want to do other things at this point, like proceeding
 * to a test trial, you can add this hook in your frame.
 *
 * See 'methods' for the functions you can use on a frame that extends SessionRecord.
 *
 * Events recorded in a frame that extends SessionRecord will automatically have additional
 * fields sessionVideoId (video filename), and streamTime (when in the video they happened, in s).
 *
 * @class Session-record
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

    /*
     * The recorder object, accessible to the consuming frame. Includes properties
     * recorder.nWebcams, recorder.hasCamAccess, recorder.micChecked, recorder.connected.
     */
    sessionRecorder: Ember.computed.alias('session.recorder'),
    sessionRecordingInProgress: Ember.computed.alias('session.recordingInProgress'),

    /* A video ID to use for the current recording. Format is
     * `videoStream_<experimentId>_multiframe-<frameIdOfFirstFrame>_<sessionId>_timestampMS_RRR`
     * where RRR are random numeric digits.
     */
    sessionVideoId: Ember.computed.alias('session.videoId'),

    // JQuery ID to identify the recorder element.
    sessionRecorderElement: 'sessionRecorder',

    /**
     * Whether to start a session (multi-frame) recording as soon as possible upon loading this frame. This allows you to conduct video recording across multiple frames, simply specifying which frame to start and end on. Individual frames may also provide frame-specific recording capabilities; it is best NOT to conduct both a multiframe 'session' recording and frame-specific recording simultaneously as multiple video streams will eat up bandwidth. If you decide to use session recording, turn off recording for any frames that would otherwise record. There can be multiple session recordings in an experiment, e.g. from frames 1-3 and 5-10.
     * @property {Boolean} startSessionRecording
     * @default false
     */
    startSessionRecording: false,

    /**
     * Maximum time allowed for whole-session video upload before proceeding, in seconds.
     * Can be overridden by researcher, based on tradeoff between making families wait and
     * losing data.
     * @property {Number} sessionMaxUploadSeconds
     * @default 10
     */
    sessionMaxUploadSeconds: 10,

    /**
     * Whether to end any session (multi-frame) recording at the end of this frame.
     * @property {Boolean} endSessionRecording
     * @default false
     */
    endSessionRecording: false,

    // Whether recorder has been set up yet. Automatically set when doing setup.
    sessionRecorderReady: false,

    /**
     * Whether to do check the mic input during recorder set up (before the install promise is resolved). 
     * Defaults to false and can be overridden by consuming frame.
     * @property {Boolean} checkMic
     * @default false
     */
    checkMic: false,

    /** 
     * Private flag that is set when the async record method is first called 
     * to prevent record from being called multiple times
    */
    _starting: false,

    /**
     * Private flag that is set when the async stopRecording method is first called
     * to prevent record from being called multiple times
    */
    _stopping: false,

    _generateSessionVideoId() {
        return [
            'videoStream',
            this.get('experiment.id'),
            this.get('id') + '-multiframe',
            this.get('session.id'),
            +Date.now(), // Timestamp in ms
            Math.floor(Math.random() * 1000)
        ].join('_');
    },

    /**
     * Set up a video recorder instance
     * @method setupRecorder
     * @param {Node} element A DOM node representing where to mount the recorder
     * @return {Promise} A promise representing the result of installing the recorder
     */
    setupSessionRecorder(recorderElementId) {
        var $sessionRecorderElement = $('<div>', {
            id: recorderElementId,
            class: 'video-recorder-hidden'
        });
        // Make sure to append to the player's parent so that this doesn't get removed
        // (which won't prevent recording, but WILL prevent receiving events!)
        $('#' + this.get('elementId')).parent().append($sessionRecorderElement);
        var $element = $('#' + recorderElementId);

        const maxRecordingLength = 7200;
        const sessionVideoId = this._generateSessionVideoId();
        this.get('session').set('videoId', sessionVideoId);
        const sessionRecorder = new VideoRecorder({element: $element});
        const s3vars = Ember.getOwner(this).resolveRegistration('config:environment').awsRecording;
        const installPromise = sessionRecorder.install(sessionVideoId, 
            maxRecordingLength, this.get('checkMic'), s3vars);

        // Track specific events for all frames that use VideoRecorder
        var _this = this;
        sessionRecorder.on('onCamAccess', (recId, hasAccess) => {   // eslint-disable-line no-unused-vars
            _this.get('sessionRecorder').set('hasCamAccess', hasAccess);
            if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
                _this.send('setTimeEvent', 'sessionRecorder.hasCamAccess', {
                    hasCamAccess: hasAccess,
                    sessionVideoId: sessionVideoId,
                });
            }
        });
        sessionRecorder.on('onConnectionStatus', (recId, status) => {   // eslint-disable-line no-unused-vars
            if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
                _this.send('setTimeEvent', 'videoStreamConnection', {
                    status: status,
                    sessionVideoId: sessionVideoId
                });
                _this.notifyPropertyChange('whenPossibleToRecordSession');
            }
        });
        this.set('sessionRecorder', sessionRecorder);
        this.send('setTimeEvent', 'setupSessionVideoRecorder', {
            sessionVideoId: sessionVideoId,
        });
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
            var _this = this;
            return sessionRecorder.record()
                .then(() => {
                    /**
                     * When session video recorder has begun recording
                     *
                     * @event startSessionRecording
                     */
                    _this.send('setTimeEvent', 'startSessionRecording');
                })
                .catch((err) => {
                    this.send('setTimeEvent', 'errorStartingSessionRecording', {
                        error: err.message
                    });
                    console.error(`Error starting session recording for file: ${_this.get('session').get('videoId')}\n${err.name}: ${err.message}`);
                    throw new Error(`Error starting session recording for file: ${_this.get('session').get('videoId')}\n${err.name}: ${err.message}`)
                });
        } else {
            return Ember.RSVP.reject(new Error('Must call setupSessionRecorder before startSessionRecorder'));
        }
    },

    /**
     * Stop recording
     * @method stopSessionRecorder
     * @return Promise Resolves when recording has been uploaded or timed out
     */
    stopSessionRecorder() {
        const sessionRecorder = this.get('sessionRecorder');
        if (sessionRecorder && this.get('session').get('recordingInProgress') && !(this.get('_stopping'))) {
            this.set('_stopping', true);
            /**
             * When session video recorder is stopped (upload may continue afterwards)
             *
             * @event stopSessionRecording
             */
            this.get('session').set('recordingInProgress',false);
            this.send('setTimeEvent', 'stopSessionRecording', {
                sessionVideoId: this.get('session').get('videoId')
            });
            return sessionRecorder.stop(this.get('sessionMaxUploadSeconds') * 1000)
                .then(() => {
                    this.set('_stopping', false);
                    this.send('setTimeEvent', 'uploadComplete', {
                        sessionVideoId: this.get('session').get('videoId')
                    });
                })
                .catch((e) => {
                    this.set('_stopping', false);
                    // This block catches upload timeouts and any other errors related to stopping the recorder or uploading the data.
                    // This session recorder stop promise rejection will not cause the experiment to stop with an error,
                    // because the code waiting on this promise is in a "finally" block (rather than "then").
                    if (e.message == 'uploadTimedout') {
                        this.send('setTimeEvent', 'sessionRecordingUploadTimedout', {
                            sessionVideoId: this.get('session').get('videoId')
                        });
                    } else {
                        this.send('setTimeEvent', 'errorStoppingSessionRecording', {
                            error: e.message,
                            sessionVideoId: this.get('session').get('videoId')
                        });
                        throw new Error(`Error stopping session recorder and uploading: ${e}`);
                    }
                });
        } else {
            // reject the promise because the recorder is in one of the following states:
            // - doesn't exist, or is not recording, or has been destroyed
            // - exists and is recording, but is already in the process of stopping and uploading
            return Ember.RSVP.reject(new Error(`Unable to stop recorder for ${this.get('session').get('videoId')}. Maybe it does not exist, is not recording, has been destroyed, or is already stopping.`));
        }
    },

    /**
     * Destroy recorder and stop accessing webcam
     * @method destroySessionRecorder
     */
    destroySessionRecorder() {
        const recorder = this.get('sessionRecorder');
        if (recorder) {
            if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
                this.send('setTimeEvent', 'destroyingRecorder', {
                    sessionVideoId: this.get('session').get('videoId')
                });
            }
            recorder.destroy();
            $(`#${this.get('sessionRecorderElement')}`).remove();
        }
    },

    didInsertElement() {
        if (this.get('startSessionRecording')) {
            var _this = this;

            this.setupSessionRecorder(this.get('sessionRecorderElement')).then(() => {
                /**
                 * When session video recorder has been installed
                 *
                 * @event sessionRecorderReady
                 */
                _this.send('setTimeEvent', 'sessionRecorderReady', {
                    sessionVideoId: this.get('session').get('videoId')
                });
                _this.get('session').set('recordingInProgress', true);
                _this.set('sessionRecorderReady', true);
                _this.whenPossibleToRecordSessionObserver(); // make sure this fires
            });
        }
        this._super(...arguments);
    },

    // Note: if leaving this component via 'next', that handles actually stopping the
    // session recorder if needed and calling next once complete. This provides a
    // fallback to stop if leaving via closing the window, etc. and also handles
    // actually destroying the recorder any time the component is destroyed.
    willDestroyElement() {
        var _this = this;
        if (this.get('sessionRecorder') && this.get('endSessionRecording') && this.get('sessionRecorder').recording) {
            if (!(this.get('session').get('recordingInProgress'))) {
                this.destroySessionRecorder();
            } else {
                this.stopSessionRecorder().finally(() => {
                    _this.destroySessionRecorder();
                });
            }
        }
        this._super(...arguments);
    },

    /**
     * Function called when session recording is started automatically. Override to do
     * frame-specific actions at this point (e.g., beginning a test trial).
     *
     * @method onSessionRecordingStarted
     */
    onSessionRecordingStarted() {
    },

    /**
     * Observer that starts recording once session recorder is ready.
     * @method whenPossibleToRecordSessionObserver
     */
    whenPossibleToRecordSessionObserver: observer('sessionRecorder.hasCamAccess', 'sessionRecorderReady', function() {
        if (this.get('sessionRecorder.hasCamAccess') && this.get('sessionRecorderReady') && this.get('startSessionRecording') && this.get('sessionRecorder') && !(this.get('sessionRecorder').recording) && !(this.get('_starting'))) {
            this.set('_starting', true);
            var _this = this;
            this.startSessionRecorder().then(() => {
                _this.send('setTimeEvent', 'startedSessionRecording');
                _this.onSessionRecordingStarted();
            });
        }
    })

});
