import Ember from 'ember';

/* OMIT FROM YUIDOC *
 * @module exp-player
 * @submodule services
 */

let {
    $,
    RSVP
} = Ember;

var LOOKIT_PREFERRED_DEVICES = {
    'cam': null,
    'mic': null
};

// Deal with Firefox issue where, after selecting camera/mic to share and saying to
// 'remember' settings, the default cam/mic are used each time getUserMedia is called.
// This does NOT fix persisting selections across multiple Lookit sessions, but will
// persist it through the session (one page load). (To forcibly fix selection, can
// revoke & refresh page).
// Override getUserMedia function to insert our preference on camera and mic, and to set
// that preference the first time getUserMedia is called successfully. We do this rather than
// editing https://cdn.addpipe.com/2.0/pipe.js and hosting our own copy so we don't have to
// maintain across changes to Pipe.
// Only override newer navigator.mediaDevices.getUserMedia rather than also
// navigator.getUserMedia, as the latter will only be used by Pipe if the newer one is not
// available, in which case probably bigger problems than this one.
navigator.mediaDevices.getUserMedia = (function (origGetUserMedia) {
    return function () {
        // Add preferred mic and camera, if already stored, to any other constraints being
        // passed to getUserMedia
        var constraints = arguments[0];
        if (constraints.hasOwnProperty('audio') && LOOKIT_PREFERRED_DEVICES.mic) {
            constraints.audio.deviceId = LOOKIT_PREFERRED_DEVICES.mic;
        }
        if (constraints.hasOwnProperty('video') && LOOKIT_PREFERRED_DEVICES.cam) {
            constraints.video.deviceId = LOOKIT_PREFERRED_DEVICES.cam;
        }
        return origGetUserMedia.apply(this, arguments).then(function (stream) {
            // Set the preferred cam/mic IDs the first time we get a stream
            try {
                var audioTracks = stream.getAudioTracks();
                var videoTracks = stream.getVideoTracks();
                if (!LOOKIT_PREFERRED_DEVICES.mic && audioTracks) {
                    var thisAudioLabel = audioTracks[0].label;
                    navigator.mediaDevices.enumerateDevices()
                        .then(function (devices) {
                            devices.forEach(function (device) {
                                if (device.kind == 'audioinput' && device.label == thisAudioLabel) {
                                    LOOKIT_PREFERRED_DEVICES.mic = device.deviceId;
                                }
                            });
                        });
                }
                if (!LOOKIT_PREFERRED_DEVICES.cam && videoTracks) {
                    var thisVideoLabel = videoTracks[0].label;
                    navigator.mediaDevices.enumerateDevices()
                        .then(function (devices) {
                            devices.forEach(function (device) {
                                if (device.kind == 'videoinput' && device.label == thisVideoLabel) {
                                    LOOKIT_PREFERRED_DEVICES.cam = device.deviceId;
                                }
                            });
                        });
                }
            } catch (error) {
                console.error('Error setting preferred mic/camera: ' + error);
            }
            return stream;
        });
    };
})(navigator.mediaDevices.getUserMedia);

/**
 * An instance of a video recorder tied to or used by one specific page. A given experiment may use more than one
 *   video recorder depending on the number of video capture frames.
 * @class video-recorder
 */
const VideoRecorder = Ember.Object.extend({

    element: null,

    divId: 'lookit-video-recorder',
    recorderId: (new Date().getTime() + ''),
    pipeVideoName: '',

    started: Ember.computed.alias('_started').readOnly(),
    hasCamAccess: false,
    nWebcams: Ember.computed.alias('_nWebcams').readOnly(), // number of webcams available for recording
    nMics: Ember.computed.alias('_nMics').readOnly(), // number of microphones available for recording
    recording: Ember.computed.alias('_recording').readOnly(),
    hasCreatedRecording: Ember.computed.alias('_hasCreatedRecording').readOnly(),
    connected: false,
    uploadTimeout: null, // timer counting from attempt to stop until we should just
    //resolve the stopPromise
    maxUploadTimeMs: 5000,

    _started: false,
    _camAccess: false,
    _recording: false,
    _recorderReady: false,
    _hasCreatedRecording: false,
    _nWebcams: 0,
    _nMics: 0,

    _recordPromise: null,
    _stopPromise: null,
    _isuploaded: false,

    recorder: null, // The actual recorder object, also stored in PipeSDK.recorders obj

    // List of webcam hooks that should be added to recorder
    // See https://addpipe.com/docs#javascript-events-api
    hooks: ['onRecordingStarted',
        'onCamAccess',
        'onReadyToRecord',
        'onUploadDone',
        'userHasCamMic',
        'onConnectionStatus',
        'onMicActivityLevel',
        'btPlayPressed',
        'btRecordPressed',
        'btStopRecordingPressed',
        'btPausePressed',
        'onPlaybackComplete',
        'onConnectionClosed',
        'onSaveOk'
    ],

    minVolume: 1, // Volume required to pass mic check
    micChecked: false, // Has the microphone ever exceeded minVolume?

    /**
     * Install a recorder onto the page and optionally begin recording immediately.
     *
     * @method install
     * @param videoFilename desired filename for video (will be set after saving with Pipe name) ['']
     * @param pipeKey Pipe account hash ['']
     * @param pipeEnv which Pipe environment [1]
     * @param maxRecordingTime recording length limit in s [100000000]
     * @param autosave whether to autosave - 1 or 0 [1]
     * @param audioOnly whether to do audio only recording - 1 or 0 [0]
     * @return {Promise} Resolves when widget successfully installed and started
     */

    install(videoFilename = '', pipeKey = '', pipeEnv = 1, maxRecordingTime = 100000000, autosave = 1, audioOnly = 0) {

        console.log('video recorder install, pipe env: ', pipeEnv);

        let origDivId = this.get('divId');

        this.set('divId', `${this.get('divId')}-${this.get('recorderId')}`);

        var $element = $(this.get('element'));

        let divId = this.get('divId');

        var $container = $('<div>', {
            id: `${divId}-container`,
            css: {
                height: '100%'
            }
        });
        this.set('$container', $container);
        $container.append($('<div>', { id: divId, class: origDivId }));
        $element.append($container);

        return new RSVP.Promise((resolve, reject) => { // eslint-disable-line no-unused-vars

            var pipeConfig = {
                qualityurl: 'https://d3l7d0ho3mojk5.cloudfront.net/pipe/720p.xml',
                showMenu: 0, // hide recording button menu
                sis: 1, // skip initial screen
                asv: autosave, // autosave recordings
                st: 0, // don't show timer
                mv: 0, // don't mirror video for display
                dpv: 1, // disable pre-recorded video on mobile
                ao: audioOnly, // not audio-only
                dup: 0, // don't allow file uploads
                payload: videoFilename, // data used by webhook to rename video
                accountHash: pipeKey,
                eid: pipeEnv, // environment ID for pipe account
                mrt: maxRecordingTime,
                size: { // just display size when showing to user. We override css.
                    width: 320,
                    height: 240
                }
            };

            this.set('_started', true);
            var _this = this;
            PipeSDK.insert(divId, pipeConfig, function (myRecorderObject) {
                _this.set('recorder', PipeSDK.getRecorderById(divId));
                _this.get('hooks').forEach(hookName => {
                    // At the time the hook is actually called, look up the appropriate
                    // functions both from here and that might be added later.
                    myRecorderObject[hookName] = function (...args) {
                        if (_this.get('_' + hookName)) { // 'Native' hook defined here
                            _this['_' + hookName].apply(_this, args);
                        }
                        if (_this.hasOwnProperty(hookName)) { // Some hook added later via 'on'
                            _this[hookName].apply(_this, args);
                        }
                    };
                });
            });

            return resolve();

        });
    },

    /**
     * Start recording a video, and allow the state of the recording to be accessed for later usage
     *
     * @method record
     * @return {Promise}
     */
    record() {
        if (!this.get('started')) {
            throw new Error('Must call start before record');
        }
        let count = 0;
        var _this = this;
        this.set('_isuploaded', false);
        let id = window.setInterval(() => {
            if (++count > 50) { // stop trying - failure (5s)
                if (_this.get('onCamAccess')) {
                    _this.get('onCamAccess').call(_this, false);
                }
                return window.clearInterval(id), _this.get('_recordPromise').reject();
            }
            if (!_this.get('recorder') || !(_this.get('recorder').record)) {
                return null;
            }
            _this.get('recorder').record();

            // Giving the "record" method a few seconds seems to increase the reliability of hooks firing.
            setTimeout(function () {
                window.clearInterval(id); // stop trying - success
            }, 3000);

            return null;
        }, 100); // try every 100ms

        return new Ember.RSVP.Promise((resolve, reject) => {
            if (_this.get('recording')) {
                resolve(this);
            } else {
                _this.set('_recordPromise', {
                    resolve,
                    reject
                });
            }
        });
    },

    /**
     * Get a timestamp based on the current recording position. Useful to ensure that tracked timing events
     *  line up with the video.
     * @method getTime
     * @return {Date|null}
     */
    getTime() {
        let recorder = this.get('recorder');
        if (recorder && recorder.getStreamTime) {
            return parseFloat(recorder.getStreamTime());
        }
        return null;
    },

    /**
     * Stop recording and save the video to the server
     * @method stop
     */
    stop(maxUploadTimeMs = 5000) {
        var recorder = this.get('recorder');
        if (recorder) {
            try {
                recorder.stopVideo();
            } catch (e) {
                console.log('error stopping video');
            }
        }
        this.set('_recording', false);

        var _this = this;
        var _stopPromise = new Ember.RSVP.Promise((resolve, reject) => {
            // If we don't end up uploading within 5 seconds, call reject
            _this.set('uploadTimeout', window.setTimeout(function () {
                console.warn('waiting for upload timed out');
                window.clearTimeout(_this.get('uploadTimeout'));
                reject();
            }, maxUploadTimeMs));
            if (_this.get('_isuploaded')) {
                window.clearTimeout(_this.get('uploadTimeout'));
                resolve(_this);
            } else {
                _this.set('_stopPromise', {
                    resolve: resolve,
                    reject: reject
                });
            }
        });
        return _stopPromise;
    },

    /**
     * Destroy video recorder
     *
     * @method destroy
     */
    destroy() {
        console.log(`Destroying the videoRecorder: ${this.get('divId')}`);
        $(`#${this.get('divId')}-container`).remove();
        if (this.get('recorder') && this.get('recorder').remove) {
            this.get('recorder').remove();
        }
        this.set('_recording', false);
    },

    on(hookName, func) {
        if (this.get('hooks').indexOf(hookName) === -1) {
            throw `Invalid event ${hookName}`;
        }
        this.set(hookName, func);
    },

    // Begin webcam hooks
    _onRecordingStarted(recorderId) { // eslint-disable-line no-unused-vars
        this.set('_recording', true);
        this.set('_hasCreatedRecording', true);
        this.set('pipeVideoName', this.get('recorder').getStreamName());
        if (this.get('_recordPromise')) {
            this.get('_recordPromise').resolve(this);
        }
    },

    // Once recording finishes uploading, resolve call to stop
    _onUploadDone(recorderId, streamName, streamDuration, audioCodec, videoCodec, fileType, audioOnly, location) { // eslint-disable-line no-unused-vars
        window.clearTimeout(this.get('uploadTimeout'));
        this.set('_isuploaded', true);
        if (this.get('_stopPromise')) {
            console.log('Upload completed for file: ' + streamName);
            this.get('_stopPromise').resolve(this);
        }
    },

    _onCamAccess(recorderId, allowed) { // eslint-disable-line no-unused-vars
        console.log('onCamAccess: ' + recorderId);
        this.set('hasCamAccess', allowed);
    },

    _onReadyToRecord(recorderId, recorderType) { // eslint-disable-line no-unused-vars
        this.set('_recorderReady', true);
    },

    _userHasCamMic(recorderId, camNumber, micNumber) { // eslint-disable-line no-unused-vars
        this.set('_nWebcams', camNumber);
        this.set('_nMics', micNumber);
    },

    _onConnectionStatus(recorderId, status) { // eslint-disable-line no-unused-vars
        this.set('connected', status === 'connected');
    },

    _onMicActivityLevel(recorderId, currentActivityLevel) { // eslint-disable-line no-unused-vars
        if (currentActivityLevel > this.get('minVolume')) {
            this.set('micChecked', true);
            // Remove the handler so we're not running this every single mic sample from now on
            this.set('_onMicActivityLevel', null);
            // This would remove the handler from the actual recorder, but we might have
            // something added by a consuming frame via the 'on' fn
            //this.get('recorder').onMicActivityLevel = function (recorderId, currentActivityLevel) {};
        }
    }

    // Additional hooks available:
    //  btRecordPressed = function (recorderId) {};
    //  btPlayPressed(recorderId)
    //  btStopRecordingPressed = function (recorderId) {};
    //  btPausePressed = function (recorderId) {};
    //  onPlaybackComplete = function (recorderId) {};
    //  onConnectionClosed = function (recorderId) {};
    //  onSaveOk = function (recorderId, streamName, streamDuration, cameraName, micName, audioCodec, videoCodec, filetype, videoId, audioOnly, location) {};

    // End webcam hooks
});

export default VideoRecorder;

export { LOOKIT_PREFERRED_DEVICES };
