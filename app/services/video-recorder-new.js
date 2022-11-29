import Ember from 'ember';
//import S3 from './s3';

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
        console.log('video recorder service: get user media');
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
    videoName: '',

    started: Ember.computed.alias('_started').readOnly(),
    startTime: Ember.computed.alias('_startTime').readOnly(),
    hasCamAccess: false,
    nWebcams: Ember.computed.alias('_nWebcams').readOnly(), // number of webcams available for recording
    nMics: Ember.computed.alias('_nMics').readOnly(), // number of microphones available for recording
    recording: Ember.computed.alias('_recording').readOnly(),
    hasCreatedRecording: Ember.computed.alias('_hasCreatedRecording').readOnly(),
    micChecked: Ember.computed.alias('_micChecked'),

    connected: false,
    uploadTimeout: null, // timer counting from attempt to stop until we should just resolve the stopPromise
    maxUploadTimeMs: 5000,
    maxRecordingTime: null,
    audioOnly: null, // TO DO: if 1, record audio only
    autosave: null, // TO DO: if 1, trigger saving when recorder stops
    checkMic: null,

    _started: false,
    _startTime: null,
    _camAccess: false,
    _recording: false,
    _recorderReady: false,
    _hasCreatedRecording: false,
    _nWebcams: 0,
    _nMics: 0,
    _minVolume: 0.1, // Volume required to pass mic check
    _micChecked: false, // Has the microphone ever exceeded minVolume?
    _recordPromise: null,
    _stopTimeout: null,
    _stopPromise: null,
    _isuploaded: false, // TO DO
    _processorNode: null,
    _lastState: null,
    _blobs: [],

    recorder: null, // The actual recorder object

    // RecordRTC does not natively support the states/event-related callbacks below,
    // these are from Pipe and we're not changing the names for combatibility reasons.
    // RecordRTC API: https://github.com/muaz-khan/RecordRTC#api
    // We can also access the internal web audio API recording object (MediaStreamRecorder) and use that directly
    hooks: [
        'onRecordingStarted', // triggered after the resolution of RecordRTC startRecording promise (TO DO: should fire on change to 'recording' state?)
        'onCamAccess', // triggered by resolution of get user media promise
        'onReadyToRecord',
        'onUploadDone', // TO DO - related to connection to AWS server
        'userHasCamMic', // set after the resolution of the get user media promise
        'onConnectionStatus', // TO DO - related to connection to AWS server
        'onMicActivityLevel', // triggered via Audio Worklet Processor (until micChecked is true)
        'btPlayPressed', // TO DO - use RecordRTC state change?
        'btRecordPressed', // TO DO - use RecordRTC state change?
        'btStopRecordingPressed', // TO DO - use RecordRTC state change?
        'btPausePressed', // TO DO - use RecordRTC state change?
        'onPlaybackComplete', // TO DO
        'onConnectionClosed', // TO DO - related to connection to AWS server
        'onSaveOk', // TO DO - related to connection to AWS server
        'onStateChanged',
        'onRecordingStopped',
        'ondataavailable'
    ],

    /**
     * Install a recorder onto the page and optionally begin recording immediately.
     *
     * @method install
     * @param videoFilename desired filename for video 
     * @param maxRecordingTime recording length limit in s [100000000]
     * @param autosave whether to autosave - 1 or 0 [1] // TO DO
     * @param audioOnly whether to do audio only recording - 1 or 0 [0] // TO DO
     * @param checkMic boolean, whether a mic check must be passed before resolving the install promise
     * @return {Promise} Resolves when widget successfully installed and started
     */

    install(videoFilename = '', maxRecordingTime = 100000000, autosave = 1, audioOnly = 0, checkMic = false) {
        console.log('video recorder service: install');
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

            /* var pipeConfig = {
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
            }; */
            var _this = this;
            const recordRtcConfig = {
                type: 'video', // audio, video, canvas, gif
                mimeType: 'video/webm',  // TO DO: audio/webm if audio only?
                // TO DO: not sure about these codecs?
                // video/webm;codecs=vp9
                // video/webm;codecs=vp8
                // video/webm;codecs=h264
                //recorderType: MediaStreamRecorder,
                disableLogs: false,
                timeSlice: 1000, 
                ondataavailable: function(blob) {
                    if (_this._ondataavailable) {
                        _this._ondataavailable.call(_this, blob);
                    }
                },
                //checkForInactiveTracks: false, // auto stop recording if camera stops
                //onTimeStamp: function(timestamp) {}, // if timeSlice is given
                //bitsPerSecond: 128000, // audio and video
                //audioBitsPerSecond: 128000,
                //videoBitsPerSecond: 128000,
                //frameInterval: 90, // used by CanvasRecorder and WhammyRecorder
                // if you are recording multiple streams into single file
                // previewStream helps you see what is being recorded
                //previewStream: function(stream) {},
                // used by CanvasRecorder and WhammyRecorder
                //video: HTMLVideoElement,
                // used by CanvasRecorder and WhammyRecorder
                //canvas: {
                //    width: 640,
                //    height: 480
                //},
                // used by StereoAudioRecorder, range is 22050 to 96000.
                //sampleRate: 96000,
                // used by StereoAudioRecorder, range is 22050 to 96000. This forces 16khz recording:
                //desiredSampRate: 16000,
                // used by StereoAudioRecorder, legal values are (256, 512, 1024, 2048, 4096, 8192, 16384).
                //bufferSize: 16384, 
                //numberOfAudioChannels: 2, // used by StereoAudioRecorder: 1 or 2
                //frameRate: 30, // used by WebAssemblyRecorder
                //bitrate: 128000, // used by WebAssemblyRecorder
                // used by MultiStreamRecorder to access HTMLCanvasElement
                //elementClass: 'multi-streams-mixer'
            }; 

            this.set('_started', true);

            function afterGettingUserMedia(stream) {
                if (_this.get('_recording')) {
                    return null;
                } else {
                    console.log('video recorder service: get user media callback fired');
                    // add video element in divId to display video stream
                    let vidElement = document.createElement('video');
                    vidElement.controls = false;
                    vidElement.autoplay = true;
                    vidElement.muted = true;
                    vidElement.style.width = "100%";
                    vidElement.srcObject = stream;
                    let vidDivId = _this.get('divId');
                    let vidDiv = document.getElementById(vidDivId);
                    vidDiv.appendChild(vidElement);
                    // create RecordRTC recorder
                    let thisRecorder = new RecordRTCPromisesHandler(stream, recordRtcConfig);
                    _this.set('recorder', thisRecorder);
                    _this.set('stream', stream);
                    _this.set('maxRecordingTime', maxRecordingTime)
                    _this.set('videoName', videoFilename);
                    _this.set('audioOnly', audioOnly);
                    _this.set('autosave', autosave);

                    // Filename doesn't have an extension.
                    //_this.set('s3', new S3(`${videoFilename}.webm`));
                    
                    // set up hooks
                    _this.get('hooks').forEach(function(hookName) {
                        // At the time the hook is actually called, look up the appropriate
                        // functions both from here and that might be added later.
                        thisRecorder[hookName] = function(...args) {
                            if (_this.get('_' + hookName)) { // 'Native' hook defined here
                                _this['_' + hookName].apply(_this, args);
                            }
                            if (_this.hasOwnProperty(hookName)) { // Some hooks added later via 'on'
                                _this[hookName].apply(_this, args);
                            }
                        }
                    });
                    // set user has cam mic value
                    _this.set('_userHasCamMic', true);
                    // set cam access value and trigger on cam access hook
                    //_this.set('_camAccess', true);
                    if (_this.get('onCamAccess')) {
                        let id = _this.get('recorderId');
                        _this.get('onCamAccess').call(_this, id, true); // recId, hasAccess
                    }
                    return stream;
                }
            }

            const setupMicCheck = (stream) => {
                if (stream !== null) {
                    console.log('setup mic check fired');
                    if (checkMic) {
                        let audioContext = new AudioContext();
                        let microphone = audioContext.createMediaStreamSource(stream);
                        audioContext.audioWorklet.addModule('assets/mic-check-processor.js').then(() => {
                            const processorNode = new AudioWorkletNode(audioContext, 'mic-check-processor');
                            this.set('_processorNode', processorNode);
                            microphone.connect(processorNode).connect(audioContext.destination);
                            var _this = this;
                            processorNode.port.onmessage = (event) => {
                                // handle message from the processor: event.data
                                if (_this.get('recorder').onMicActivityLevel) {
                                    if ('data' in event && 'volume' in event.data) {
                                        let id = _this.get('recorderId');
                                        _this.get('recorder').onMicActivityLevel.call(_this, id, event.data.volume);
                                    }
                                } else {
                                    return false;
                                }
                            }
                            resolve(); // resolve the install promise after mic check has been set up
                        });
                    } else {
                        this._completeMicCheck();
                        resolve(); // skip mic check and resolve the install promise
                    }
                } else {
                    reject();
                }
            };

            const catch_install_error = (err) => {
                console.error(`${err.name}: ${err.message}`);
                console.trace();
                return reject();
            }

            navigator.mediaDevices.getUserMedia({audio: {noiseSuppression: true}, video: {width: 1280, height: 720, frameRate: 30}})
                .then(afterGettingUserMedia)
                .then(setupMicCheck)
                .catch(catch_install_error);

        });
    },

    /**
     * Start recording a video, and allow the state of the recording to be accessed for later usage
     *
     * @method record
     * @return {Promise}
     */
    record() {
        console.log('video recorder service: record');
        if (!this.get('started')) {
            throw new Error('Must call install before record');
        }
        //let count = 0;
        var _this = this;
        _this.set('_isuploaded', false);
        // let id = window.setInterval(() => {
        //     if (++count > 50) { // stop trying - failure (5s)
        //         if (_this.get('onCamAccess')) {
        //             _this.get('onCamAccess').call(_this, false);
        //         }
        //         return window.clearInterval(id), _this.get('_recordPromise').reject();
        //     }
        //     if (!_this.get('recorder') || !(_this.get('recorder').record)) {
        //         return null;
        //     }
        //     _this.get('recorder').record();

        //     // Giving the "record" method a few seconds seems to increase the reliability of hooks firing.
        //     setTimeout(function () {
        //         window.clearInterval(id); // stop trying - success
        //     }, 3000);

        //     return null;
        // }, 100); // try every 100ms
        if (!_this.get('recorder') || !(_this.get('recorder').startRecording)) {
            return null;
        }
        
        //await _this.get('s3').createUpload();

        _this.get('recorder').startRecording()
            .then(()=> {
                _this.set('_startTime', performance.now());  // TO DO: better way to get start time?
                _this.get('recorder').onRecordingStarted.call(_this); 
                if (_this.get('maxRecordingTime') !== null) { // TO DO: right way to check?
                    // TO DO: should this be a promise? 
                    _this.set('_stopTimeout', window.setTimeout(function() {
                        console.warn('reached max recording time');
                        _this.stop();
                    }, _this.get('maxRecordingTime')*1000));
                }
            })
            .catch((err) => {
                console.error(`${err.name}: ${err.message}`);
            });

        return new RSVP.Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
            console.log('video recorder service: record promise');
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
        if (recorder && this._started && this._startTime) {
            let ts = Math.round(performance.now() - this._startTime);
            console.log('time: ' + ts);
            return ts; 
        }
        return null;
    },

    /**
     * Stop recording and save the video to the server
     * @method stop
     * @return {Promise}
     */
    stop(maxUploadTimeMs = 5000) {
        console.log('video recorder service: stop');
        
        if (this.get('_stopTimeout') !== null) {
            window.clearTimeout(this.get('_stopTimeout'));
        }
        var _this = this;
        var _stopPromise = new RSVP.Promise((resolve, reject) => {
            console.log('video recorder service: stop promise');
            // If we don't end up uploading within 5 seconds, call reject
            _this.set('uploadTimeout', window.setTimeout(function () {
                console.warn('waiting for upload timed out');
                window.clearTimeout(_this.get('uploadTimeout'));
                reject();
            }, maxUploadTimeMs));
            if (!_this.get('_isuploaded')) {
                _this.set('_stopPromise', {
                    resolve: resolve,
                    reject: reject
                });
            }
        });
        var recorder = this.get('recorder');
        if (recorder) {
            try {
                recorder.stopRecording();
                //await this.get('s3').completeUpload();
                _this.get('recorder').onRecordingStopped.call(_this); 
                this._onUploadDone(this.get('recorderId')); // clears the upload timeout, sets isuploaded to true, resolves stop promise
            } catch (e) {
                console.log('error stopping video: ', e);
            }
        }
        return _stopPromise;
    },

    /**
     * Pause the recording
     *
     * @method pause
     * @return {Promise}
     */
    pause() {
        this.get('recorder').getState().then((curr_state) => {
            return new RSVP.Promise((resolve, reject) => {
                if (curr_state == "recording") {
                    this.get('recorder').pauseRecording()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            console.error(`Error pausing recorder: ${err.name}: ${err.message}`);
                            console.trace();
                            reject();
                        });
                } else {
                    resolve();
                }
            });
        })
    },

    /**
     * Resume the recording
     *
     * @method resume
     * @return {Promise}
     */
    resume() {
        this.get('recorder').getState().then((curr_state) => {
            return new RSVP.Promise((resolve, reject) => {
                if (curr_state == "paused") {
                    this.get('recorder').resumeRecording()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            console.error(`Error pausing recorder: ${err.name}: ${err.message}`);
                            console.trace();
                            reject();
                        });
                } else {
                    resolve();
                }
            });
        })
    },

    /**
     * Destroy video recorder
     *
     * @method destroy
     */
    destroy() {
        console.log('video recorder service: destroy');
        console.log(`Destroying the videoRecorder: ${this.get('divId')}`);
        $(`#${this.get('divId')}-container`).remove();
        if (this.get('recorder') && this.get('recorder').destroy) {
            this.get('recorder').destroy();
        }
        this.set('_recording', false);
        // reset to initial values: user has cam mic, cam access, mic checked?
        this.set('_userHasCamMic', false);
        this.set('_camAccess', false);
        this.set('_blobs', []);
    },

    on(hookName, func) {
        if (this.get('hooks').indexOf(hookName) === -1) {
            throw `Invalid event ${hookName}`;
        }
        this.set(hookName, func);
    },

    // private helper function
    _completeMicCheck() {
        console.log('mic check complete');
        this.set('_micChecked', true);
        // Remove the handler so we're not running this every single mic sample from now on
        this.set('_onMicActivityLevel', null);
        // This would remove the handler from the actual recorder, but we might have
        // something added by a consuming frame via the 'on' fn
        this.get('recorder').onMicActivityLevel = null; //function (recorderId, currentActivityLevel) {}; // eslint-disable-line no-unused-vars
        if (this.get('_processorNode') !== null) {
            this.get('_processorNode').port.postMessage({micChecked: true});
        }
    },

    // Begin webcam hooks (names are a carryover from Pipe)
    _onRecordingStarted(recorderId) { // eslint-disable-line no-unused-vars
        console.log('video recorder service: on recording started fired');
        this.set('_recording', true);
        this.set('_hasCreatedRecording', true);
        if (this.get('_recordPromise')) {
            this.get('_recordPromise').resolve(this);
        }
    },

    // Once recording finishes uploading, resolve call to stop
    _onUploadDone(recorderId, streamName, streamDuration, audioCodec, videoCodec, fileType, audioOnly, location) { // eslint-disable-line no-unused-vars
        console.log('video recorder service: on upload done fired');
        window.clearTimeout(this.get('uploadTimeout'));
        this.set('_isuploaded', true);
        if (this.get('_stopPromise')) {
            console.log('Upload completed for file: ' + streamName);
            this.get('_stopPromise').resolve(this);
        }
    },

    _onCamAccess(recorderId, allowed) { // eslint-disable-line no-unused-vars
        console.log('video recorder service: on cam access fired');
        this.set('hasCamAccess', allowed);
    },

    _onReadyToRecord(recorderId, recorderType) { // eslint-disable-line no-unused-vars
        console.log('video recorder service: on ready to record fired');
        this.set('_recorderReady', true);
    },

    _userHasCamMic(recorderId, camNumber, micNumber) { // eslint-disable-line no-unused-vars
        console.log('video recorder service: user has cam mic fired');
        this.set('_nWebcams', camNumber);
        this.set('_nMics', micNumber);
    },

    _onConnectionStatus(recorderId, status) { // eslint-disable-line no-unused-vars
        console.log('video recorder service: on connection status fired');
        this.set('connected', status === 'connected');
    },

    _onMicActivityLevel(recorderId, currentActivityLevel) { // eslint-disable-line no-unused-vars
        console.log('video recorder service: on mic activity level fired');
        if (currentActivityLevel > this.get('_minVolume')) {
            this._completeMicCheck();
        }
    },

    // Additional hooks available:
    //  btRecordPressed = function (recorderId) {};
    //  btPlayPressed(recorderId)
    //  btStopRecordingPressed = function (recorderId) {};
    //  btPausePressed = function (recorderId) {};
    //  onPlaybackComplete = function (recorderId) {};
    //  onConnectionClosed = function (recorderId) {};
    //  onSaveOk = function (recorderId, streamName, streamDuration, cameraName, micName, audioCodec, videoCodec, filetype, videoId, audioOnly, location) {};

    // RecordRTC event-related callbacks - only used to trigger pre-existing states/callbacks (to maintain compatibility with Pipe version)
    _onStateChanged(state) {
        console.log('recorder state change: ', state);
        // RecordRTC states: inactive, recording, stopped, paused
        // don't check for stopped state here - RecordRTC has a separate callback onRecordingStopped
        if (state == "recording") {
            let recorderId = this.get('recorderId');
            this.set('_recording', true);
            this.get('recorder')._onRecordingStarted(recorderId);
        } else {
            this.set('_recording', false);
        }
    },

    _onRecordingStopped() {
        console.log('video recorder service: recorder stopped callback');
        this.set('_recording', false);
        try {
            const vidBlob = new Blob(this._blobs);
            const vidName = this.get('videoName');
            // TO DO: this is just a local save for testing
            invokeSaveAsDialog(vidBlob, vidName+'.webm');  // eslint-disable-line no-undef
            this._onUploadDone(this.get('recorderId'), vidName);  // clears the upload timeout, sets isuploaded to true, resolves stop promise
        } catch(err) {
            console.error('error saving video: ', err);
            if (this.get('_stopPromise')) {
                this.get('_stopPromise').reject();
            }
        }
    },

    _ondataavailable(blob) {
        //this.get('s3').onDataAvailable(blob);
        this._blobs.push(blob);
    }

    // End webcam hooks
});

export default VideoRecorder;

export { LOOKIT_PREFERRED_DEVICES };
