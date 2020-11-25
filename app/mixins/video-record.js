import Ember from 'ember';
import { observer } from '@ember/object';
import VideoRecorder from '../services/video-recorder';
import { colorSpecToRgbaArray, isColor, textColorForBackground } from '../utils/is-color';
import { expFormat } from '../helpers/exp-format';
import { mergeObjectOfArrays } from "../utils/replace-values";

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
 * A mixin that can be used to add basic support for video recording across frames
 *
 * By default, the recorder will be installed when this frame loads, but recording
 * will not start automatically. To override either of these settings, set
 * the properties `doUseCamera` and/or `startRecordingAutomatically` in the consuming
 * frame.
 *
 * You will also need to set `recorderElement` if the recorder is to be housed other than
 * in an element identified by the ID `recorder`.
 *
 * The properties `recorder`, `videoList`, `stoppedRecording`, `recorderReady`, and
 * `videoId` become available to the consuming frame. The recorder object has fields
 * that give information about its state: `hasWebCam`, 'hasCamAccess`, `recording`,
 * `connected`, and `micChecked` - for details, see services/video-recorder.js. These
 * can be accessed from the consuming frame as e.g. `this.get('recorder').get('hasWebCam')`.
 *
 * If starting recording automatically,  the function `onRecordingStarted` will be called
 * once recording begins. If you want to do other things at this point, like proceeding
 * to a test trial, you can add this hook in your frame.
 *
 * See 'methods' for the functions you can use on a frame that extends VideoRecord.
 *
 * Events recorded in a frame that extends VideoRecord will automatically have additional
 * fields videoId (video filename), pipeId (temporary filename initially assigned by
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
 * @class Video-record
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
     * @property {VideoRecorder} recorder
     * @private
     */
    recorder: null,

    /**
     * A list of all video IDs used in this mixin (a new one is created for each recording).
     * Accessible to consuming frame.
     * @property {List} videoList
     * @private
     */
    videoList: null,

    /**
     * Whether recording is stopped already, meaning it doesn't need to be re-stopped when
     * destroying frame. This should be set to true by the consuming frame when video is
     * stopped.
     * @property {Boolean} stoppedRecording
     * @private
     */
    stoppedRecording: false,

    /**
     * JQuery string to identify the recorder element.
     * @property {String} recorderElement
     * @default '#recorder'
     * @private
     */
    recorderElement: '#recorder',

    /**
     * Whether recorder has been set up yet. Automatically set when doing setup.
     * Accessible to consuming frame.
     * @property {Boolean} recorderReady
     * @private
     */
    recorderReady: false,

    /**
     * Maximum recording length in seconds. Can be overridden by consuming frame.
     * @property {Number} maxRecordingLength
     * @default 7200
     */
    maxRecordingLength: 7200,

    /**
     * Maximum time allowed for video upload before proceeding, in seconds.
     * Can be overridden by researcher, based on tradeoff between making families wait and
     * losing data.
     * @property {Number} maxUploadSeconds
     * @default 5
     */
    maxUploadSeconds: 5,

    /**
     * Whether to autosave recordings. Can be overridden by consuming frame.
     * TODO: eventually use this to set up non-recording option for previewing
     * @property {Number} autosave
     * @default 1
     * @private
     */
    autosave: 1,

    /**
     * Whether to do audio-only (vs also video) recording. Can be overridden by consuming frame.
     * @property {Number} audioOnly
     * @default 0
     */
    audioOnly: 0,

    /**
     * Whether to use the camera in this frame. Consuming frame should set this property
     * to override if needed.
     * @property {Boolean} doUseCamera
     * @default true
     */
    doUseCamera: true,

    /**
     * Whether to start recording ASAP (only applies if doUseCamera). Consuming frame
     * should set to override if needed.
     * @property {Boolean} startRecordingAutomatically
     * @default false
     */
    startRecordingAutomatically: false,

    /**
     * A video ID to use for the current recording. Format is
     * `videoStream_<experimentId>_<frameId>_<sessionId>_timestampMS_RRR`
     * where RRR are random numeric digits.
     *
     * @property {String} videoId
     * @private
     */
    videoId: '',

    /**
     * Whether to initially show a message saying to wait until recording starts, covering the entire frame.
     * This prevents participants from seeing any stimuli before recording begins. Only used if recording is being
     * started immediately.
     * @property {Boolean} showWaitForRecordingMessage
     * @default true
     */
    showWaitForRecordingMessage: true,

    /**
     * [Only used if showWaitForRecordingMessage is true] Text to display while waiting for recording to begin.
     * @property {Boolean} waitForRecordingMessage
     * @default 'Please wait... <br><br> starting webcam recording'
     */
    waitForRecordingMessage: 'Please wait... <br><br> starting webcam recording',

    /**
     * [Only used if showWaitForRecordingMessage is true] Background color of screen while waiting for recording to
     * begin. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
     * for acceptable syntax: can use either color names ('blue', 'red', 'green', etc.), or
     * rgb hex values (e.g. '#800080' - include the '#'). The text on top of this will be either black or white
     * depending on which will have higher contrast.
     * @property {Boolean} waitForRecordingMessageColor
     * @default 'white'
     */
    waitForRecordingMessageColor: 'white',

    /**
     * Whether to stop media and hide stimuli with a message saying to wait for video upload when stopping recording.
     * Do NOT set this to true if end of recording does not correspond to end of the frame (e.g. during consent or
     * observation frames) since it will hide everything upon stopping the recording!
     * @property {Boolean} showWaitForUploadMessage
     * @default true
     */
    showWaitForUploadMessage: false,

    /**
     * [Only used if showWaitForUploadMessage is true] Text to display while waiting for recording to begin.
     * @property {Boolean} waitForUploadMessage
     * @default 'Please wait... <br><br> uploading video'
     */
    waitForUploadMessage: 'Please wait... <br><br> uploading video',

    /**
     * [Only used if showWaitForUploadMessage is true] Background color of screen while waiting for recording to
     * upload. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
     * for acceptable syntax: can use either color names ('blue', 'red', 'green', etc.), or
     * rgb hex values (e.g. '#800080' - include the '#'). The text on top of this will be either black or white
     * depending on which will have higher contrast.
     * @property {String} waitForUploadMessageColor
     * @default 'white'
     */
    waitForUploadMessageColor: 'white',

    /**
     * [Only used if showWaitForUploadMessage and/or showWaitForRecordingMessage are true] Image to display along with
     * any wait-for-recording or wait-for-upload message. Either waitForWebcamImage or waitForWebcamVideo can be
     * specified. This can be either a full URL ('https://...') or just a filename, which will be assumed to be
     * inside ``baseDir/img/`` if this frame otherwise supports use of ``baseDir``.
     * @property {String} waitForWebcamImage
     * @default ''
     */
    waitForWebcamImage: '',

    /**
     * [Only used if showWaitForUploadMessage and/or showWaitForRecordingMessage are true] Video to display along with
     * any wait-for-recording or wait-for-upload message (looping). Either waitForWebcamImage or waitForWebcamVideo can be
     * specified. This can be either an array of ``{'src': 'https://...', 'type': '...'}`` objects (e.g. providing both
     * webm and mp4 versions at specified URLS) or a single string relative to ``baseDir/<EXT>/`` if this frame otherwise
     * supports use of ``baseDir``.
     * @property {String} waitForWebcamVideo
     * @default ''
     */
    waitForWebcamVideo: '',


    _generateVideoId() {
        return [
            'videoStream',
            this.get('experiment.id'),
            this.get('id'), // parser enforces that id is composed of a-z, A-Z, -, ., [space]
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
        // All frames using this mixin will add streamTime to every server event
        let base = this._super(eventName, extra);
        Ember.assign(base, {
            streamTime: this.get('recorder') ? this.get('recorder').getTime() : null
        });
        return base;
    },

    /**
     * Set up a video recorder instance
     * @method setupRecorder
     * @param {Node} element A DOM node representing where to mount the recorder
     * @return {Promise} A promise representing the result of installing the recorder
     */
    setupRecorder(element) {
        const videoId = this._generateVideoId();
        this.set('videoId', videoId);
        const recorder = new VideoRecorder({element: element});
        const pipeLoc = Ember.getOwner(this).resolveRegistration('config:environment').pipeLoc;
        const pipeEnv = Ember.getOwner(this).resolveRegistration('config:environment').pipeEnv;
        const installPromise = recorder.install(this.get('videoId'), pipeLoc, pipeEnv,
            this.get('maxRecordingLength'), this.get('autosave'), this.get('audioOnly'));

        // Track specific events for all frames that use  VideoRecorder
        var _this = this;
        recorder.on('onCamAccess', (recId, hasAccess) => {   // eslint-disable-line no-unused-vars
            if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
                _this.send('setTimeEvent', 'recorder.hasCamAccess', {
                    hasCamAccess: hasAccess
                });
            }
        });
        recorder.on('onConnectionStatus', (recId, status) => {   // eslint-disable-line no-unused-vars
            if (!(_this.get('isDestroyed') || _this.get('isDestroying'))) {
                _this.send('setTimeEvent', 'videoStreamConnection', {
                    status: status
                });
            }
        });
        this.set('recorder', recorder);
        this.send('setTimeEvent', 'setupVideoRecorder', {
            videoId: videoId
        });
        return installPromise;
    },

    /**
     * Start recording
     * @method startRecorder
     * @return Promise Resolves when recording has started
     */
    startRecorder() {
        const recorder = this.get('recorder');
        if (recorder) {
            return recorder.record().then(() => {
                this.send('setTimeEvent', 'startRecording', {
                    pipeId: recorder.get('pipeVideoName')
                });
                if (this.get('videoList') == null) {
                    this.set('videoList', [this.get('videoId')]);
                } else {
                    this.set('videoList', this.get('videoList').concat([this.get('videoId')]));
                }
            });
        } else {
            return Ember.RSVP.resolve();
        }
    },

    /**
     * Stop the recording
     * @method stopRecorder
     * @return Promise A promise that resolves when upload is complete
     */
    stopRecorder() {
        const recorder = this.get('recorder');
        if (recorder && recorder.get('recording')) {
            this.send('setTimeEvent', 'stoppingCapture');
            if (this.get('showWaitForUploadMessage')) {
                // TODO: consider adding progress bar
                $( "video audio" ).each(function() {
                    this.pause();
                });

                let colorSpec = this.get('waitForUploadMessageColor');
                if (!isColor(colorSpec)) {
                    console.warn(`Invalid background color waitForRecordingUploadColor (${colorSpec}) provided; using default instead.`);
                    colorSpec = 'white';
                }
                let colorSpecRGBA = colorSpecToRgbaArray(colorSpec);
                $('.video-record-mixin-wait-for-video').css('background-color', colorSpec);
                $('.video-record-mixin-wait-for-video-text').css('color', textColorForBackground(colorSpecRGBA));
                $('.video-record-mixin-wait-for-video-text').html(`${expFormat(this.get('waitForUploadMessage'))}`);
                $('.video-record-mixin-wait-for-video').show();

            }
            return recorder.stop(this.get('maxUploadSeconds') * 1000);
        } else {
            return Ember.RSVP.reject(1);
        }
    },

    /**
     * Destroy recorder and stop accessing webcam
     * @method destroyRecorder
     */
    destroyRecorder() {
        const recorder = this.get('recorder');
        if (recorder) {
            if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
                this.send('setTimeEvent', 'destroyingRecorder');
            }
            recorder.destroy();
        }
    },

    willDestroyElement() {
        var _this = this;
        if (_this.get('recorder')) {
            window.clearTimeout(_this.get('recorder').get('uploadTimeout'));
            if (_this.get('stoppedRecording', true)) {
                _this.destroyRecorder();
            } else {
                _this.stopRecorder().then(() => {
                    _this.set('stoppedRecording', true);
                    _this.destroyRecorder();
                }, () => {
                    _this.destroyRecorder();
                });
            }
        }
        _this._super(...arguments);
    },

    didReceiveAttrs() {
        let assets = this.get('assetsToExpand') ? this.get('assetsToExpand') : {};
        let additionalAssetsToExpand = {
            image: ['waitForUploadImage'],
            video: ['waitForUploadVideo']
        };
        this.set('assetsToExpand', mergeObjectOfArrays(assets, additionalAssetsToExpand));
        this._super(...arguments);
    },

    didInsertElement() {
        // Give any active session recorder precedence over individual-frame recording
        if (this.get('sessionRecorder') && this.get('session').get('recordingInProgress') && this.get('doUseCamera')) {
            console.warn('Recording on this frame was specified, but session recording is already active. Not making frame recording.');
            this.set('doUseCamera', false);
        }

        if (this.get('doUseCamera')) {

            // If showing a wait-for-recording or wait-for-upload message, set it up now.
            if ((this.get('showWaitForRecordingMessage') && this.get('startRecordingAutomatically')) || this.get('showWaitForUploadMessage')) {
                let $waitForVideoCover = $('<div></div>');
                $waitForVideoCover.addClass('video-record-mixin-wait-for-video'); // for easily referencing later to show/hide

                // Set the background color of the cover
                let colorSpec = this.get('waitForRecordingMessageColor');
                if (!isColor(colorSpec)) {
                    console.warn(`Invalid background color waitForRecordingMessageColor (${colorSpec}) provided; using default instead.`);
                    colorSpec = 'white';
                }
                let colorSpecRGBA = colorSpecToRgbaArray(colorSpec);
                $waitForVideoCover.css('background-color', colorSpec);

                // Add the image, if any
                if (this.get('waitForUploadImage')) {
                    let imageSource = this.get('waitForUploadImage_parsed') ? this.get('waitForUploadImage_parsed') : this.get('waitForUploadImage');
                    $waitForVideoCover.append($(`<img src='${imageSource}' class='video-record-mixin-image'>`));
                }

                // Add the video, if any
                if (this.get('waitForUploadVideo')) {
                    let $videoElement = $('<video loop autoplay="autoplay" class="video-record-mixin-image"></video>');
                    let videoSources = this.get('waitForUploadVideo_parsed') ? this.get('waitForUploadVideo_parsed') : this.get('waitForUploadVideo');
                    $.each(videoSources, function (idx, source) {
                        $videoElement.append(`<source src=${source.src} type=${source.type}>`);
                    });
                    $waitForVideoCover.append($videoElement);
                }

                // Add the text and set its color so it'll be visible against the background
                let $waitForVideoText = $(`<div>${expFormat(this.get('waitForRecordingMessage'))}</div>`);
                $waitForVideoText.addClass('video-record-mixin-wait-for-video-text');
                $waitForVideoText.css('color', textColorForBackground(colorSpecRGBA));
                $waitForVideoCover.append($waitForVideoText);

                $('div.lookit-frame').append($waitForVideoCover);

                if (this.get('showWaitForRecordingMessage') && this.get('startRecordingAutomatically')) {
                    $waitForVideoCover.css('display', 'block');
                }
            }

            var _this = this;
            this.setupRecorder(this.$(this.get('recorderElement'))).then(() => {
                /**
                 * When video recorder has been installed
                 *
                 * @event recorderReady
                 */
                _this.send('setTimeEvent', 'recorderReady');
                _this.set('recorderReady', true);
                _this.whenPossibleToRecordObserver(); // make sure this fires
            });
        }
        this._super(...arguments);
    },

    /**
     * Function called when frame recording is started automatically. Override to do
     * frame-specific actions at this point (e.g., beginning a test trial).
     *
     * @method onRecordingStarted
     */
    onRecordingStarted() {
    },

    /**
     * Observer that starts recording once recorder is ready.
     * @method whenPossibleToRecordObserver
     */
    whenPossibleToRecordObserver: observer('recorder.hasCamAccess', 'recorderReady', function() {
        if (this.get('doUseCamera') && this.get('startRecordingAutomatically')) {
            var _this = this;
            if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
                this.startRecorder().then(() => {
                    _this.set('recorderReady', false);
                    $('.video-record-mixin-wait-for-video').hide();
                    _this.onRecordingStarted();
                });
            }
        }
    }),

    /**
     * Hide the recorder from display. Useful if you would like to keep recording without extra UI elements to
     *   distract the user.
     * @method hideRecorder
     */
    hideRecorder() {
        $(this.get('recorderElement')).parent().addClass('video-recorder-hidden');
    },

    /**
     * Show the recorder to the user. Useful if you want to temporarily show a hidden recorder- eg to let the user fix
     *   a problem with video capture settings
     * @method showRecorder
     */
    showRecorder() {
        $(this.get('recorderElement')).parent().removeClass('video-recorder-hidden');
    },

    init() {
        this._super(...arguments);
        this.set('videoList', []);
    }

});
