import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import isColor from '../../utils/is-color';
import { audioAssetOptions, videoAssetOptions } from '../../mixins/expand-assets';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Video display frame. This may be used for displaying videos to older children or parents, as well as for
 * typical looking measures trials or as brief filler in between test trials.
 *
 * (Note: this frame replaced the previous exp-lookit-video frame, which is now called
 *  {{#crossLink "Exp-lookit-composite-video-trial"}}{{/crossLink}}.)
 *
 * This is very customizable: you can...
 *   - position the video wherever you want on the screen, including specifying that it should fill the screen (while maintaining aspect ratio)
 *   - choose the background color
 *   - optionally specify audio that should play along with the video
 *   - have the frame proceed automatically (`autoProceed`), or enable a Next button when the user can move on
 *   - allow parents to press a key to pause the video (and then either restart when they un-pause, or move on to the next frame)
 *
 * Video (and audio if provided) start as soon as any recording begins, or right away if there is no recording starting.
 *
 * If the user pauses using the `pauseKey`, or if the user leaves fullscreen mode, the study will be paused.
 * While paused, the video/audio are stopped and not displayed, and instead a looping `pauseVideo` and text are displayed.
 *
 * There are several ways you can specify how long the trial should last. The frame will continue until
 * ALL of the following are true:
 *   - the video has been played all the way through `requireVideoCount` times
 *   - the audio has been played all the way through `requireAudioCount` times
 *   - `requiredDuration` seconds have elapsed since beginning the video
 *
 * You do not need to use all of these - for instance, to play the video one time and then proceed, set
 * `requireVideoCount` to 1 and the others to 0. You can also specify whether the audio and video should loop (beyond
 * any replaying required to reach the required counts).
 *
 * This frame is displayed fullscreen; if the frame before it is not, that frame
 * needs to include a manual "next" button so that there's a user interaction
 * event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
 * without a user event.)
 *
 * Example usage: (Note - this is a bit of an odd example with both audio ('peekaboo') and audio embedded in the video.
 * In general you would probably only want one or the other!)

```json
 "play-video-twice": {
            "kind": "exp-lookit-video",
            "audio": {
                "loop": false,
                "source": "peekaboo"
            },
            "video": {
                "top": 10,
                "left": 25,
                "loop": true,
                "width": 50,
                "source": "cropped_apple"
            },
            "backgroundColor": "white",
            "autoProceed": true,
            "parentTextBlock": {
                "text": "If your child needs a break, just press X to pause!"
            },
            "requiredDuration": 0,
            "requireAudioCount": 0,
            "requireVideoCount": 2,
            "restartAfterPause": true,
            "pauseKey": "x",
            "pauseKeyDescription": "X",
            "pauseAudio": "pause",
            "pauseVideo": "attentiongrabber",
            "pauseText": "(You'll have a moment to turn around again.)",
            "unpauseAudio": "return_after_pause",
            "doRecording": true,
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "audioTypes": [
                "ogg",
                "mp3"
            ],
            "videoTypes": [
                "webm",
                "mp4"
            ]
        },

* ```
* @class Exp-lookit-video
* @extends Exp-frame-base
* @uses Full-screen
* @uses Video-record
* @uses Expand-assets
*/

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord, ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-video',

    displayFullscreen: true, // force fullscreen for all uses of this component
    fsButtonID: 'fsButton',

    assetsToExpand: {
        'audio': [
            'audio/source',
            'pauseAudio',
            'unpauseAudio'
        ],
        'video': [
            'pauseVideo',
            'video/source'
        ],
        'image': [
        ]
    },

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    testTimer: null, // reference to timer counting how long video has been playing, if time-based limit

    testVideoTimesPlayed: 0, // how many times the test video has been played (including current)
    testAudioTimesPlayed: 0, // how many times the test audio has been played (including current)
    satisfiedDuration: false, // whether we have completed the requiredDuration

    skip: false,
    hasBeenPaused: false,
    isPaused: false,
    hasParentText: true,
    unpausing: false,

    maximizeVideoArea: false,

    frameSchemaProperties: {
        /**
         * Object describing the video to show.
         *
         * @property {Object} video
         *   @param {String} source The location of the main video to play. This can be either
         *      an array of {'src': 'https://...', 'type': '...'} objects (e.g. providing both
         *      webm and mp4 versions at specified URLS) or a single string relative to baseDir/<EXT>/.
         *   @param {Number} left left margin, as percentage of screen width. If not provided,
         *     the image is centered horizontally.
         *   @param {Number} width image width, as percentage of screen width. Note:
         *     in general only provide one of width and height; the other will be adjusted to
         *     preserve the video aspect ratio.
         *   @param {Number} top top margin, as percentage of video area height (i.e. whole screen,
         *     unless parent text or next button are shown). If not provided,
         *     the image is centered vertically.
         *   @param {Number} height image height, as percentage of video area height. Note:
         *     in general only provide one of width and height; the other will be adjusted to
         *     preserve the video aspect ratio.
         *   @param {String} position use 'fill' to fill the screen as much as possible while
         *     preserving aspect ratio. This overrides left/width/top/height values if given.
         *   @param {Boolean} loop whether the video should loop, even after any requireTestVideoCount
         *     is satisfied
         */
        video: {
            type: 'object',
            properties: {
                'source': {
                    anyOf: videoAssetOptions
                },
                'left': {
                    type: 'number'
                },
                'width': {
                    type: 'number'
                },
                'top': {
                    type: 'number'
                },
                'height': {
                    type: 'number'
                },
                'position': {
                    type: 'string',
                    enum: ['fill', '']
                },
                'loop': {
                    type: 'boolean'
                }
            }
        },
        /**
         * Object describing the audio file to play along with video (optional)
         *
         * @property {Object} audio
         * @default {'source': '', loop: false}
         * @param {String} source Location of the audio file to play.
         *   This can either be an array of {src: 'url', type: 'MIMEtype'} objects, e.g.
         *   listing equivalent .mp3 and .ogg files, or can be a single string `filename`
         *   which will be expanded based on `baseDir` and `audioTypes` values (see `audioTypes`).
         * @param {Boolean} loop whether the audio should loop, even after any requireTestAudioCount
         *     is satisfied
         */
        audio: {
            type: 'object',
            description: 'Audio to play along with video',
            properties: {
                'source': {
                    anyOf: audioAssetOptions
                },
                'loop': {
                    type: 'boolean'
                }
            },
            default: {}
        },

        /**
         * Whether to proceed automatically when video is complete / requiredDuration is
         * achieved, vs. enabling a next button at that point.
         * If true, the frame auto-advances after ALL of the following happen
         * (a) the requiredDuration (if any) is achieved, counting from the video starting
         * (b) the video is played requireVideoCount times
         * (c) the audio is played requireAudioCount times
         * If false: a next button is displayed. It becomes possible to press 'next'
         * only once the conditions above are met.
         *
         * @property {Boolean} autoProceed
         * @default true
         */
        autoProceed: {
            type: 'boolean',
            description: 'Whether to proceed automatically after audio (and hide replay/next buttons)',
            default: true
        },

        /**
         * Color of background. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
         * for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
         * rgb hex values (e.g. '#800080' - include the '#'). We recommend a light background if you need to
         * see children's eyes.
         *
         * @property {String} backgroundColor
         * @default 'white'
         */
        backgroundColor: {
            type: 'string',
            description: 'Color of background',
            default: 'white'
        },

        /**
        Array of objects specifying attention-grabber video src and type, as for sources. The attention-grabber video is shown (looping) during the announcement phase and when the study is paused.
        @property {Array} pauseVideo
            @param {String} src
            @param {String} type
        @default []
        */
        pauseVideo: {
            anyOf: videoAssetOptions,
            description: 'List of objects specifying attention-grabber video src and type',
            default: []
        },

        /**
         Key to pause the trial. Use an empty string, '', to not allow pausing using the keyboard. You can look up the names of keys at
         https://keycode.info. Default is the space bar (' ').
         @property {string} pauseKey
         @default ' '
         */
        pauseKey: {
            type: 'string',
            description: 'Key that will pause study (use \'\' to not allow pausing during video)',
            default: ' '
        },

        /**
         Parent-facing description of the key to pause the study. This is just used to display text
         "Press {pauseKeyDescription} to resume" when the study is paused.
         @property {string} pauseKeyDescription
         @default 'space'
         */
        pauseKeyDescription: {
            type: 'string',
            description: 'Parent-facing description of the key to pause the study',
            default: 'space'
        },


        /**
         Whether to restart this frame upon unpausing, vs moving on to the next frame
         @property {Array} restartAfterPause
         @default true
         */
        restartAfterPause: {
            type: 'boolean',
            description: 'Whether to restart this frame upon unpausing, vs moving on to the next frame',
            default: true
        },

        /**
        Duration to require before proceeding, if any. Set if you want a time-based limit. E.g., setting requiredDuration to 20 means that the first 20 seconds of the video will be played, with shorter videos looping until they get to 20s. Leave out or set to 0 to play the video through to the end a set number of times instead.
        @property {Number} requiredDuration
        @default 0
        */
        requiredDuration: {
            type: 'number',
            description: 'Minimum trial duration to require (from start of video), in seconds',
            default: 0,
            minimum: 0
        },

        /**
        Number of times to play test video before moving on.
        @property {Number} requireVideoCount
        @default 1
        */
        requireVideoCount: {
            type: 'number',
            description: 'Number of times to play test video',
            default: 1
        },

        /**
         Number of times to play test audio before moving on.
         @property {Number} requireAudioCount
         @default 1
         */
        requireAudioCount: {
            type: 'number',
            description: 'Number of times to play test audio',
            default: 0
        },

        /**
        Whether to do any video recording during this frame. Default true. Set to false for e.g. last frame where just doing an announcement.
        @property {Boolean} doRecording
        @default true
        */
        doRecording: {
            type: 'boolean',
            description: 'Whether to do video recording',
            default: true
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * audio played upon pausing study
         *
         * @property {Object[]} pauseAudio
         * @default []
         */
        pauseAudio: {
            anyOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for audio played when pausing study',
            default: []
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * audio played upon unpausing study
         *
         * @property {Object[]} unpauseAudio
         * @default []
         */
        unpauseAudio: {
            anyOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for audio played when unpausing study',
            default: []
        },
        /**
         * Text to show under "Study paused / Press space to resume" when study is paused.
         * Default: (You'll have a moment to turn around again.)
         *
         * @property {String} pauseText
         * @default []
         */
        pauseText: {
            type: 'string',
            description: 'Text to show under Study paused when study is paused.',
            default: "(You'll have a moment to turn around again.)"
        },
        /**
         * Text block to display to parent.  (Each field is optional)
         *
         * @property {Object} parentTextBlock
         *   @param {String} title title to display
         *   @param {String} text paragraph of text
         *   @param {Object} css object specifying any css properties
         *      to apply to this section, and their values - e.g.
         *      {'color': 'gray', 'font-size': 'large'}
         */
        parentTextBlock: {
            type: 'object',
            properties: {
                title: {
                    type: 'string'
                },
                text: {
                    type: 'string'
                },
                css: {
                    type: 'object',
                    default: {}
                }
            },
            default: {}
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {
                /**
                * Source of video  shown during this trial. Just stores first URL if multiple formats are offered.
                * @attribute videoShown
                * @type string
                */
                videoShown: {
                    type: 'string',
                    default: ''
                },
                videoId: {
                    type: 'string'
                },
                /**
                 * Whether the video was paused at any point during the trial
                 * @attribute hasBeenPaused
                 * @type boolean
                 */
                hasBeenPaused: {
                    type: 'boolean'
                }
            }
        }
    },

    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            if (!this.get('isPaused')) {
                this.togglePauseStudy(true);
            }
        }
    },

    actions: {

        videoStarted() {
            /**
             * When video begins playing (recorded each time video starts if played through more than once)
             *
             * @event videoStarted
             */
            if (this.get('isDestroying') || this.get('isDestroyed')) {
                return;
            }

            this.send('setTimeEvent', 'videoStarted');
            if (this.get('testVideoTimesPlayed') === 0) {
                window.clearInterval(this.get('testTimer'));
                if (this.get('requiredDuration')) {
                    this.set('testTimer', window.setTimeout(() => {
                        this.set('satisfiedDuration', true);
                        if (this.isReadyToFinish()) {
                            this.readyToFinish();
                        }
                    }, this.get('requiredDuration') * 1000));
                } else {
                    this.set('satisfiedDuration', true);
                    if (this.isReadyToFinish()) {
                        this.readyToFinish();
                    }
                }
                if ($('#player-audio').length) {
                    $('#player-audio')[0].play();
                }
            }
        },

        videoStopped() {
            if (this.get('isDestroying') || this.get('isDestroyed')) {
                return;
            }
            /**
             * When video completes playback (recorded each time if played more than once)
             *
             * @event videoStopped
             */
            this.send('setTimeEvent', 'videoStopped');
            this.set('testVideoTimesPlayed', this.get('testVideoTimesPlayed') + 1);
            if (this.isReadyToFinish()) {
                this.readyToFinish();
            }
            // Restart the video if it's supposed to loop OR if it's supposed to play another time
            if ($('#player-video').length && (this.get('video.loop') || (this.get('testVideoTimesPlayed') < this.get('requireVideoCount')))) {
                $('#player-video')[0].currentTime = 0;
                $('#player-video')[0].play();
            }
        },

        audioStarted() {
            if (this.get('isDestroying') || this.get('isDestroyed')) {
                return;
            }
            /**
             * When audio begins playing (recorded each time video starts if played through more than once)
             *
             * @event audioStarted
             */
            this.send('setTimeEvent', 'audioStarted');
        },

        audioStopped() {
            if (this.get('isDestroying') || this.get('isDestroyed')) {
                return;
            }
            /**
             * When audio completes playback (recorded each time if played more than once)
             *
             * @event audioStopped
             */
            this.send('setTimeEvent', 'audioStopped');
            this.set('testAudioTimesPlayed', this.get('testAudioTimesPlayed') + 1);
            if (this.isReadyToFinish()) { // in case this was the last criterion for being done
                this.readyToFinish();
            }
            // Restart the video if it's supposed to loop OR if it's supposed to play another time
            if ($('#player-audio').length && (this.get('audio.loop') || (this.get('testAudioTimesPlayed') < this.get('requireAudioCount')))) {
                $('#player-audio')[0].currentTime = 0;
                $('#player-audio')[0].play();
            }
        },

        finish() {
            // Call this something separate from next because stopRecorder promise needs
            // to call next AFTER recording is stopped and we don't want this to have
            // already been destroyed at that point.

            // Pause audio/video so we don't trigger started/stopped handlers while destroying
            $('audio, video').each(function() {
                this.pause();
            });
            /**
             * When trial is complete and begins cleanup (may then wait for video upload)
             *
             * @event trialCompleted
             */
            this.send('setTimeEvent', 'trialCompleted');
            window.clearInterval(this.get('testTimer'));
            this.set('testVideoTimesPlayed', 0);
            this.set('testAudioTimesPlayed', 0);
            this.set('satisfiedDuration', false);
            var _this = this;
            if (this.get('doRecording')) {
                this.set('doingTest', false);
                $('#waitForVideo').html('uploading video...').show();
                this.stopRecorder().then(() => {
                    _this.set('stoppedRecording', true);
                    _this.send('next');
                }, () => {
                    _this.send('next');
                });
            } else {
                _this.send('next');
            }
        },

        unpauseStudy() {
            this.set('unpausing', false);
            /**
             * When trial is unpaused (actually proceeding to beginning or next frame)
             *
             * @event unpauseTrial
             */
            this.send('setTimeEvent', 'unpauseTrial');
            if (this.get('restartAfterPause')) {
                this.isReadyToFinish(); // enable Next button if appropriate
                this.startVideo();
            } else {
                this.send('finish');
            }
        }
    },

    isReadyToFinish() {
        let ready = (this.get('testVideoTimesPlayed') >= this.get('requireVideoCount')) &&
            (this.get('testAudioTimesPlayed') >= this.get('requireAudioCount')) &&
            (this.get('satisfiedDuration'));
        $('#nextbutton').prop('disabled', !ready);
        return ready;
    },

    readyToFinish() {
        if (this.get('autoProceed')) {
            this.send('finish');
        } else {
            /**
             * When all requirements for this frame are completed and next button is enabled (only recorded if
             * autoProceed is false)
             *
             * @event nextButtonEnabled
             */
            this.send('setTimeEvent', 'nextButtonEnabled');
            $('#nextbutton').prop('disabled', false);
        }
    },

    startVideo() {
        // Set doingTest to true, which displays test video in template; once that actually starts
        // it will trigger the videoStarted action
        this.set('doingTest', true);
    },

    togglePauseStudy(pause) { // only called in FS mode
        try {
            this.set('hasBeenPaused', true);
        } catch (_) {
            return;
        }
        var wasPaused = this.get('isPaused');

        // Currently paused: restart
        if (!pause && wasPaused) {
            this.set('unpausing', true);
            this.set('isPaused', false);
            // Start the unpausing audio.
            if (this.get('unpauseAudio_parsed', []).length) {
                $('#unpause-audio')[0].currentTime = 0;
                $('#unpause-audio')[0].play().catch(() => {
                    this.send('unpauseStudy');
                });
            } else {
                this.send('unpauseStudy');
            }

        } else if (pause || !wasPaused) { // Not currently paused: pause
            window.clearInterval(this.get('testTimer'));
            if ($('#unpause-audio').length) {
                $('#unpause-audio')[0].pause();
            }
            this.set('testVideoTimesPlayed', 0);
            this.set('testAudioTimesPlayed', 0);
            this.set('satisfiedDuration', false);
            $('#nextbutton').prop('disabled', true); // disable Next while paused
            /**
             * When trial is paused
             *
             * @event pauseTrial
             */
            this.send('setTimeEvent', 'pauseTrial');
            this.set('doingTest', false);
            this.set('isPaused', true);
            if ($('#pause-audio').length && $('#pause-audio')[0].paused) {
                $('#pause-audio')[0].currentTime = 0;
                $('#pause-audio')[0].play();
            }
        }
    },

    didInsertElement() {
        this._super(...arguments);


        $(document).on('keyup.pauser', (e) => {
            if (this.checkFullscreen()) {
                if (this.get('pauseKey') && e.key === this.get('pauseKey')) { // space: pause/unpause study
                    this.togglePauseStudy();
                }
            }
        });
        $('#nextbutton').prop('disabled', true);

        // Store which video actually gets played for convenience when analyzing data
        let video = this.get('video_parsed', {});
        if (video.source.length) {
            this.set('videoShown', video.source[0].src);
        } else {
            this.set('videoShown', '');
        }

        // Apply user-provided CSS to parent text block
        let hasParentText = Object.keys(this.get('parentTextBlock')).length;
        this.set('hasParentText', hasParentText);
        if (hasParentText) {
            var parentTextBlock = this.get('parentTextBlock') || {};
            var css = parentTextBlock.css || {};
            $('#parenttext').css(css);
        }
        this.set('maximizeVideoArea', this.get('autoProceed') && !hasParentText);

        // Apply user-provided CSS to video
        if (!video.position) {
            $('#test-video').css({
                'left': `${video.left}%`,
                'width': `${video.width}%`,
                'top': `${video.top}%`,
                'height': `${video.height}%`
            });
        }

        // Apply background color
        if (isColor(this.get('backgroundColor'))) {
            $('div.exp-lookit-video').css('background-color', this.get('backgroundColor'));
        } else {
            console.warn('Invalid background color provided; not applying.');
        }

        if (!this.get('doRecording') && !this.get('startSessionRecording') && !this.get('isPaused')) {
            this.startVideo();
        }
    },

    willDestroyElement() { // remove event handler
        $(document).off('keyup.pauser');
        window.clearInterval(this.get('testTimer'));
        this._super(...arguments);
    },

    // Hook for starting recording
    onRecordingStarted() {
        if (!this.get('isPaused')) {
            this.startVideo();
        }
        $('#waitForVideo').hide();
    },

    // Hook for starting session recorder
    onSessionRecordingStarted() {
        if (!this.get('isPaused')) {
            this.startVideo();
        }
        $('#waitForVideo').hide();
    }
});
