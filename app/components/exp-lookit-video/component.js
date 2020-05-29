import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets, {imageAssetOptions} from '../../mixins/expand-assets';
import { audioAssetOptions, videoAssetOptions } from '../../mixins/expand-assets';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
* TODO
*
* Composite video display for typical looking measures trials (e.g. preferential looking,
* looking time).
 * video:
 *   source
 *   loop
 *   position
*
*
* The video in sources and audio in musicSources (optional) are played until either: testLength seconds have elapsed (with video looping if needed), or the video has been played testCount times. If testLength is set, it overrides testCount - for example if testCount is 1 and testLength is 30, a 10-second video will be played 3 times. If the participant pauses the study during the test phase, then after restarting the trial, the video in altSources will be used again (defaulting to the same video if altSources is not provided). To skip this phase, do not provide sources.
*
* This frame is displayed fullscreen; if the frame before it is not, that frame
* needs to include a manual "next" button so that there's a user interaction
* event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
* without a user event.)
*
* Example usage:

```json
        "sample-intermodal-trial-2": {
            "kind": "exp-lookit-video",
            "isLast": false,
            "baseDir": "https://s3.amazonaws.com/lookitcontents/intermodal/",
            "sources": "sbs_ramp_down_up_apple_c1_b1_NN",
            "testCount": 2,
            "audioTypes": [
                "ogg",
                "mp3"
            ],
            "pauseAudio": "pause",
            "videoTypes": [
                "webm",
                "mp4"
            ],
            "attnSources": "attentiongrabber",
            "introSources": "cropped_book",
            "musicSources": "music_02",
            "unpauseAudio": "return_after_pause"
        }

* ```
* @class Exp-lookit-composite-video-trial
* @extends Exp-frame-base
* @uses Full-screen
* @uses Media-reload
* @uses Video-record
* @uses Expand-assets
*/

export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, VideoRecord, ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-video',

    displayFullscreen: true, // force fullscreen for all uses of this component
    fsButtonID: 'fsButton',

    assetsToExpand: {
        'audio': [
            'musicSources',
            'pauseAudio',
            'unpauseAudio'
        ],
        'video': [
            'attnSources',
            'video/source'
        ],
        'image': [
        ]
    },

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    testTimer: null, // reference to timer counting how long video has been playing, if time-based limit

    testVideosTimesPlayed: 0, // how many times the test video has been played, if count-based limit

    skip: false,
    hasBeenPaused: false,
    isPaused: false,

    maximizeVideoArea: Ember.computed.alias('autoProceed'),

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
                }
            }
        },
        /**
         * Whether to proceed automatically when video is complete / testLength is
         * achieved, vs. enabling a next button at that point.
         * If true, the frame auto-advances after ALL of the following happen
         * (a) the testLength (if any) is achieved, counting from the video starting
         * (b) the video is played testCount times
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
        Array of objects specifying attention-grabber video src and type, as for sources. The attention-grabber video is shown (looping) during the announcement phase and when the study is paused.
        @property {Array} attnSources
            @param {String} src
            @param {String} type
        @default []
        */
        attnSources: {
            anyOf: videoAssetOptions,
            description: 'List of objects specifying attention-grabber video src and type',
            default: []
        },

        /**
        List of objects specifying music audio src and type.
        If empty, no music is played.
        @param musicSources
        @property {Array} musicSources
            @param {String} src
            @param {String} type
        @default []
        */
        musicSources: {
            anyOf: audioAssetOptions,
            description: 'List of objects specifying music audio src and type',
            default: ''
        },

        /**
        Length to loop test videos, in seconds. Set if you want a time-based limit. E.g., setting testLength to 20 means that the first 20 seconds of the video will be played, with shorter videos looping until they get to 20s. Leave out or set to 0 to play the video through to the end a set number of times instead. If a testLength is set, it overrides any value set in testCount.
        @property {Number} testLength
        @default 0
        */
        testLength: {
            type: 'number',
            description: 'Length to play test video for, in seconds',
            default: 0,
            minimum: 0
        },

        /**
        Number of times to play test video before moving on. This is ignored if
        testLength is set to a positive value.
        @property {Number} testCount
        @default 1
        */
        testCount: {
            type: 'number',
            description: 'Number of times to play test video',
            default: 1
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
        }
    },

    meta: {
        name: 'Video player',
        description: 'Component that plays a video',
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
                this.pauseStudy();
            }
        }
    },

    actions: {

        videoStarted() {
            if (!this.get('isPaused')) {
                // Check that we haven't played it enough times already
                this.set('testVideosTimesPlayed', this.get('testVideosTimesPlayed') + 1);
                if ((this.get('testVideosTimesPlayed') > this.get('testCount')) && (!this.get('testLength'))) {
                    this.readyToFinish();
                } else {
                    if (this.get('testVideosTimesPlayed') === 1) {
                      window.clearInterval(this.get('testTimer'));
                      if (this.get('testLength')) {
                        this.set('testTimer', window.setTimeout(() => {
                          this.readyToFinish();
                        }, this.get('testLength') * 1000));
                      }
                      if ($('audio#exp-music').length) {
                        $('audio#exp-music')[0].play();
                      }
                    }
                    this.send('setTimeEvent', 'startTestVideo');
                }
            }
        },

        videoStopped() {
                if ((this.get('testVideosTimesPlayed') >= this.get('testCount')) && (!this.get('testLength'))) {
                    this.readyToFinish();
                } else {
                    this.$('#player-video')[0].currentTime = 0;
                    this.$('#player-video')[0].play();
                }
                this.send('setTimeEvent', 'videoStopped');
        },

        finish() { // Move to next frame altogether
            // Call this something separate from next because stopRecorder promise needs
            // to call next AFTER recording is stopped and we don't want this to have
            // already been destroyed at that point.
            window.clearInterval(this.get('testTimer'));
            this.set('testVideosTimesPlayed', 0);
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
        }
    },

    readyToFinish() {
        if (this.get('autoProceed')) {
            this.send('finish');
        } else {
            $('#nextbutton').prop('disabled', false);
        }
    },

    startVideo() {
        // Set doingTest to true, which displays test video in template; once that actually starts
        // it will trigger the videoStarted action
        this.set('doingTest', true);
    },

    pauseStudy(pause) { // only called in FS mode
        try {
            this.set('hasBeenPaused', true);
        } catch (_) {
            return;
        }
        var wasPaused = this.get('isPaused');

        // Currently paused: restart
        if (!pause && wasPaused) {
            this.set('isPaused', false);
            // TODO: restart to beginning of test video (or not)
            // TODO: skip

            try {
                this.resumeRecorder();
            } catch (_) {

            }
        } else if (pause || !wasPaused) { // Not currently paused: pause
            window.clearInterval(this.get('testTimer'));
            this.set('testVideosTimesPlayed', 0);
            this.send('setTimeEvent', 'pauseVideo');
            this.pauseRecorder(true);
            this.set('isPaused', true);
        }
    },

    didInsertElement() {
        this._super(...arguments);

        $(document).on('keyup.pauser', (e) => {
            if (this.checkFullscreen()) {
                if (e.which === 32) { // space: pause/unpause study
                    this.pauseStudy();
                }
            }
        });

        $('#nextbutton').prop('disabled', true);

        let video = this.get('video_parsed', {});

        if (video.source.length) {
            this.set('videoShown', video.source[0].src);
        } else {
            this.set('videoShown', '');
        }

        // Apply user-provided CSS to video

        if (!video.position) {
            $('#test-video').css({
                'left': `${video.left}%`,
                'width': `${video.width}%`,
                'top': `${video.top}%`,
                'height': `${video.height}%`
            });
        }
        if (!this.get('doRecording') && !this.get('startSessionRecording')) {
            this.startVideo();
        }
    },

    willDestroyElement() { // remove event handler
        $(document).off('keyup.pauser');
        window.clearInterval(this.get('testTimer'));
        this._super(...arguments);
    },

    // Override to do a bit extra when starting recording
    onRecordingStarted() {
        this.startVideo();
        $('#waitForVideo').hide();
    },

    // Override to do a bit extra when starting session recorder
    onSessionRecordingStarted() {
        this.startVideo();
        $('#waitForVideo').hide();
    }
});
