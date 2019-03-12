import Ember from 'ember';

/**
 * @module exp-player
 * @submodule services
 */

let {
    $,
    RSVP
} = Ember;

// List of hooks and internal flash widget recorder methods:
//    https://addpipe.com/docs#javascript-events-api
//    New events available in HTML5: onRecorderInit, onRecorderReady, onConnectionClosed,
//     onMicActivityLevel, onSaveOk
const HOOKS = ['onRecordingStarted',
                'onCamAccess',
                'onRecorderReady',
                'onUploadDone',
                'userHasCamMic',
                'onConnectionStatus',
                'onMicActivityLevel'];

const ATTRIBUTES = {
    align: 'middle',
    id: 'hdfvr-content',
    name: 'VideoRecorder'
};

const MIN_VOLUME = 1;

const FLASHVARS = {
    recorderId: '123',
    qualityurl: 'avq/480p.xml',
    showMenu: 'false', // show recording button menu. Yes, STRING "true"/"false" sigh.
    mrt: 100000000, // max recording time in seconds (don't use)
    sis: 1, // skip initial screen
    asv: 1, // autosave recordings
    st: 0, // don't show timer
    mv: 0,
    dpv: 0,
    ao: 0, // audio-only
    dup: 0 // allow file uploads
};

/**
 * An instance of a video recorder tied to or used by one specific page. A given experiment may use more than one
 *   video recorder depending on the number of video capture frames.
 * @class VideoRecorderObject
 */
const VideoRecorder = Ember.Object.extend({
    manager: null,

    height: 'auto',
    width: '100%',
    element: null,

    attributes: {},
    flashVars: {},

    divId: Ember.computed.alias('attributes.id'),
    videoId: Ember.computed.alias('flashVars.userId'),
    recorderId: Ember.computed.alias('flashVars.recorderId'),
    pipeVideoName: '',

    started: Ember.computed.alias('_started').readOnly(),
    hasCamAccess: false,
    hasWebCam: false,
    recording: Ember.computed.alias('_recording').readOnly(),
    flashReady: Ember.computed.alias('_recorderReady').readOnly(),
    connected: false,
    uploadTimeout: null, // timer counting from attempt to stop until we should just
    //resolve the stopPromise

    debug: false,
    _started: false,
    _camAccess: false,
    _recording: false,
    _recorderReady: false,

    _recordPromise: null,
    _stopPromise: null,

    micChecked: false,

    recorder: Ember.computed(function () {
        return document.VideoRecorder;
    }).volatile(),

    /**
     * Install a recorder onto the page and optionally begin recording immediately.
     *
     * @method install
     * @param record
     * @return {Promise} Indicate whether widget was successfully installed and started
     */

    install({record: record} = {record: false}, videoFilename = '', pipeKey = '', pipeEnv = 1, maxRecordingTime = 100000000) {

        let origDivId = this.get('divId');

        this.set('divId', `${this.get('divId')}-${this.get('recorderId')}`);

        var $element = $(this.get('element'));
        let hidden = this.get('hidden');
        if (hidden) {
            $element = $('body');
        }

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
        $container.append($('<div>', {id: origDivId}));
        $element.append($container);

        return new RSVP.Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
            window.size = { // just display size when showing to user. We override css.
                width: 320,
                height: 240
            };

            // Include videoId as payload and make flashvars available globally for Pipe.
            var fv = Ember.copy(FLASHVARS, true);
            fv.payload = videoFilename;
            fv.accountHash = pipeKey;
            fv.eid = pipeEnv;
            fv.mrt = maxRecordingTime;
            window.flashvars = fv;

            // TODO: can we put this elsewhere instead of loading here?
            $.getScript('https://cdn.addpipe.com/1.3/pipe.js');

            this.set('_started', true);

            if (record) {
                return this.record();
            } else {
                return resolve();
            }
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
     * the video recorder when destroying a frame, if not triggered via upload.
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
        //removePipeRecorder(); // TODO: this may affect ALL recorders, not just this one.
        $(`#${this.get('divId')}-container`).remove();
        this.set('_recording', false);
    },

    finish() {
        return new Ember.RSVP.Promise((resolve) => {
            // todo
            resolve();
        });
    },

    on(eName, func) {
        if (HOOKS.indexOf(eName) === -1 && eName !== 'onCamAccessConfirm') {
            throw `Invalid event ${eName}`;
        }
        this.set(eName, func);
    },

    // Begin Flash hooks
    _onRecordingStarted(recorderId) { // eslint-disable-line no-unused-vars
        this.set('_recording', true);
        this.set('pipeVideoName', this.get('recorder').getStreamName());
        if (this.get('_recordPromise')) {
            this.get('_recordPromise').resolve(this);
        }
    },

    _onUploadDone(streamName, streamDuration, userId, recorderId) { // eslint-disable-line no-unused-vars
        //this.destroy();
        window.clearTimeout(this.get('uploadTimeout'));
        if (this.get('_stopPromise')) {
            console.log('Resolving stop promise...');
            console.log(streamName);
            this.get('_stopPromise').resolve();
        }
    },

    _onCamAccess(allowed, recorderId) { // eslint-disable-line no-unused-vars
        console.log('onCamAccess: ' + recorderId);
        this.set('hasCamAccess', allowed);
    },

    _onRecorderReady(recorderId, recorderType) { // eslint-disable-line no-unused-vars
        this.set('_recorderReady', true);
    },

    _userHasCamMic(camNumber, micNumber, recorderId) { // eslint-disable-line no-unused-vars
        this.set('hasWebCam', Boolean(camNumber));
    },

    _onConnectionStatus(status, recorderId) { // eslint-disable-line no-unused-vars
        if (status === 'connected') {
            this.set('connected', true);
        } else {
            this.set('connected', false);
        }
    },

    _onMicActivityLevel(recorderId, currentActivityLevel) { // eslint-disable-line no-unused-vars
        if (currentActivityLevel > MIN_VOLUME) {
            this.set('micChecked', true);
        }
    }
    // End Flash hooks
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

    //Initial setup, installs webcam hooks into the page
    init() {
        var runHandler = function (recorder, hookName, args) {
            if (recorder.get('debug')) {
                console.log(hookName, args);
            }
            if (recorder.get('_' + hookName)) {
                recorder.get('_' + hookName).apply(recorder, args);
            }
            if (recorder.get(hookName)) {
                recorder.get(hookName).apply(recorder, args);
            }
        };

        HOOKS.forEach(hookName => {
            var _this = this;
            window[hookName] = function () {
                var args = Array.prototype.slice.call(arguments);
                var recorder;
                var recorderIdPositions = {
                    'onUploadDone': 3,
                    'userHasCamMic': 2,
                    'onCamAccess': 1,
                    'onConnectionStatus': 1,
                    'onSaveOk': 5
                };
                var recorderIdPos = recorderIdPositions[hookName] || 0;
                var recorderId = args[recorderIdPos];

                // Make sure this recorder ID is actually in _recorders;
                // otherwise fails by returning all of _recorders in this case.
                if (_this._recorders.hasOwnProperty(recorderId)) {
                    recorder = _this.get(`_recorders.${recorderId}`);
                }
                if (!recorder) {
                    Object.keys(_this.get('_recorders')).forEach((id) => {
                        recorder = _this.get(`_recorders.${id}`);
                        runHandler(recorder, hookName, args);
                    });
                } else {
                    runHandler(recorder, hookName, args);
                }
            };
        });
    },

    //Insert the recorder
    start(videoId, element, settings = {}) {
        if (typeof (videoId) !== 'string') {
            throw new Error('videoId must be a string');
        }
        var defaults = {
            config: false,
            hidden: false
        };
        Ember.assign(defaults, settings);

        var props = {
            flashVars: Ember.copy(FLASHVARS, true),
            attributes: Ember.copy(ATTRIBUTES, true),
            manager: this
        };
        props.flashVars.recorderId = (new Date().getTime() + '');
        props.element = element;
        props.hidden = defaults.hidden;
        let handle = new VideoRecorder(props);
        this.set(`_recorders.${props.flashVars.recorderId}`, handle);
        console.log('created new video recorder ' + props.flashVars.recorderId);
        return handle;
    },
    destroy(recorder) {
        var recorders = this.get('_recorders');
        delete recorders[recorder.get('recorderId')];
        this.set('_recorders', recorders);
        recorder.uninstall();
    }
});
