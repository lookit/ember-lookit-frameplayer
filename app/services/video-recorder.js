import Ember from 'ember';

/**
 * @module exp-player
 * @submodule services
 */

let {
    $,
    RSVP
} = Ember;

/**
 * An instance of a video recorder tied to or used by one specific page. A given experiment may use more than one
 *   video recorder depending on the number of video capture frames.
 * @class VideoRecorderObject
 */
const VideoRecorder = Ember.Object.extend({
    manager: null,

    element: null,

    divId: 'lookit-video-recorder',
    recorderId: '',
    pipeVideoName: '',
    videoId: '',

    started: Ember.computed.alias('_started').readOnly(),
    hasCamAccess: false,
    nWebcams: Ember.computed.alias('_nWebcams').readOnly(), // number of webcams available for recording
    nMics: Ember.computed.alias('_nMics').readOnly(), // number of microphones available for recording
    recording: Ember.computed.alias('_recording').readOnly(),
    hasCreatedRecording: Ember.computed.alias('_hasCreatedRecording').readOnly(),
    connected: false,
    uploadTimeout: null, // timer counting from attempt to stop until we should just
    //resolve the stopPromise

    _started: false,
    _camAccess: false,
    _recording: false,
    _recorderReady: false,
    _hasCreatedRecording: false,
    _nWebcams: 0,
    _nMics: 0,

    _recordPromise: null,
    _stopPromise: null,

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

        let origDivId = this.get('divId');
        console.log(origDivId);

        this.set('divId', `${this.get('divId')}-${this.get('recorderId')}`);
        console.log(this.get('divId'));

        var $element = $(this.get('element'));
        let hidden = this.get('hidden');
        if (hidden) {
            $element = $('body');
        }
        console.log($element);

        let divId = this.get('divId');
        let videoId = this.get('videoId');

        var $container = $('<div>', {
            id: `${divId}-container`,
            'data-videoid': videoId,
            css: {
                height: '100%'
            }
        });
        this.set('$container', $container);
        $container.append($('<div>', {id: divId, class: origDivId}));
        $element.append($container);

        return new RSVP.Promise((resolve, reject) => { // eslint-disable-line no-unused-vars

            var pipeConfig = {
                qualityurl: 'avq/480p.xml',
                showMenu: 0, // hide recording button menu
                sis: 1, // skip initial screen
                asv: autosave, // autosave recordings
                st: 0, // don't show timer
                mv: 0, // don't mirror video for display
                dpv: 1, // disable pre-recorded video on mobile
                ao: audioOnly, // not audio-only
                dup: 0, // don't allow file uploads
                payload: videoFilename, // data used by webhook to rename video
                accountHash:  pipeKey,
                eid:  pipeEnv, // environment ID for pipe account
                mrt:  maxRecordingTime,
                size:  { // just display size when showing to user. We override css.
                    width: 320,
                    height: 240
                }
            };

            this.set('_started', true);
            var _this = this;
            PipeSDK.insert(divId, pipeConfig, function(myRecorderObject) {
                _this.set('recorder', PipeSDK.getRecorderById(divId));
                _this.get('hooks').forEach(hookName => {
                    // At the time the hook is actually called, look up the appropriate
                    // functions both from here and that might be added later.
                    myRecorderObject[hookName] = function(...args) {
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
            window.clearInterval(id); // stop trying - success
            return null;
        }, 100); // try every 100ms

        return new Ember.RSVP.Promise((resolve, reject) => {
            _this.set('_recordPromise', {
                resolve,
                reject
            });
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
    stop() {
        function sleep(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }

        // Force at least 3 seconds of video to be recorded to ensure upload is called.
        // Not thoroughly tested that this is still necessary w webRTC recorder.
        var timeLeft = 3 - this.getTime();
        if (this.get('hasCamAccess') && (timeLeft > 0)) {
            // sleep time expects milliseconds
            return sleep(timeLeft * 1000).then(() => this.stop());
        } else {
            var recorder = this.get('recorder');
            if (recorder) {
                Ember.run.next(this, () => {
                    try {
                        recorder.stopVideo();
                    } catch (e) {
                        // TODO: Under some conditions there is no stopVideo method- can we do a better job of
                        //  identifying genuine errors?
                    }
                    this.set('_recording', false);
                });
            }

            var _this = this;

            // If we don't end up uploading within 10 seconds, call reject
            this.set('uploadTimeout', window.setTimeout(function() {
                    window.clearTimeout(_this.get('uploadTimeout'));
                    _this.get('_stopPromise').reject();
                }, 10000));

            var _stopPromise = new Ember.RSVP.Promise((resolve, reject) => {
                this.set('_stopPromise', {
                    resolve: resolve,
                    reject: reject
                });
            });
            return _stopPromise;
        }
    },

    /**
     * Destroy video recorder and remove from list of recorders. Use this to remove
     * the video recorder when destroying a frame.
     *
     * @method destroy
     */
    destroy() {
        this.get('manager').destroy(this);
    },

    /**
     * Uninstall the video recorder from the page
     *
     * @method uninstall
     */
    uninstall() {
        console.log(`Destroying the videoRecorder: ${this.get('divId')}`);
        $(`#${this.get('divId')}-container`).remove();
        if (this.get('recorder') && this.get('recorder').remove) {
            this.get('recorder').remove();
        }
        this.set('_recording', false);
    },

    finish() {
        return new Ember.RSVP.Promise((resolve) => {
            // todo
            resolve();
        });
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

    _onUploadDone(recorderId, streamName, streamDuration, audioCodec, videoCodec, fileType, audioOnly, location) { // eslint-disable-line no-unused-vars
        //this.destroy();
        window.clearTimeout(this.get('uploadTimeout'));
        if (this.get('_stopPromise')) {
            console.log('Resolving stop promise...');
            console.log(streamName);
            this.get('_stopPromise').resolve();
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
        console.log('onConnectionStatus');
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

/**
 * A service designed to facilitate video recording by providing helper methods and managing multiple recorder objects
 *  Using a persistent service is intended to ensure we destroy recorder elements when the video is done uploading,
 *  rather than just when the user exits the frame
 *
 * @class videoRecorder
 */
export default Ember.Service.extend({
    _recorders: {},

    //Initial setup of the service
    //init() {
    //    Might ideally load pipe.js only here, if using this service, but wait for load
    //    see https://api.jquery.com/jquery.getscript/
    //    $.cachedScript( 'https://cdn.addpipe.com/2.0/pipe.js' );
    //},

    //Insert the recorder
    start(videoId, element) {
        if (typeof (videoId) !== 'string') {
            throw new Error('videoId must be a string');
        }
        var props = {recorderId: (new Date().getTime() + ''), element: element, manager: this};
        let handle = new VideoRecorder(props);
        this.set(`_recorders.${props.recorderId}`, handle);
        console.log('created new video recorder ' + props.recorderId);
        return handle;
    },

    destroy(recorder) {
        var recorders = this.get('_recorders');
        delete recorders[recorder.get('recorderId')];
        this.set('_recorders', recorders);
        recorder.uninstall();
    },

    destroyAll() {
        for (let rec in PipeSDK.recorders) {
            rec.remove();
        }
    }

});
