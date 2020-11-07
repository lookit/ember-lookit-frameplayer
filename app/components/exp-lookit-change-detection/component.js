import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { audioAssetOptions, videoAssetOptions, imageAssetOptions } from '../../mixins/expand-assets';
import isColor from '../../utils/is-color';
import { observer } from '@ember/object';

let {
    $
} = Ember;

// http://stackoverflow.com/a/12646864
function shuffleArrayInPlace(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/**
 * @module exp-player
 * @submodule frames
 */

/**
 *
 * Frame for a preferential looking "alternation" or "change detection" paradigm trial,
 * in which separate streams of images are displayed on the left and right of the screen.
 * Typically, on one side images would be alternating between two categories - e.g., images
 * of 8 vs. 16 dots, images of cats vs. dogs - and on the other side the images would all
 * be in the same category.
 *
 *
 * The frame starts with an optional brief "announcement" segment, where an attention-getter
 * video is displayed and audio is played. During this segment, the trial can be paused
 * and restarted.
 *
 *
 * If `doRecording` is true (default), then we wait for recording to begin before the
 * actual test trial can begin. We also always wait for all images to pre-load, so that
 * there are no delays in loading images that affect the timing of presentation.
 *
 *
 * You can customize the appearance of the frame: background color overall, color of the
 * two rectangles that contain the image streams, and border of those rectangles. You can
 * also specify how long to present the images for, how long to clear the screen in between
 * image pairs, and how long the test trial should be altogether.
 *
 *
 * You provide four lists of images to use in this frame: `leftImagesA`, `leftImagesB`,
 * `rightImagesA`, and `rightImagesB`. The left stream will alternate between images in
 * `leftImagesA` and `leftImagesB`. The right stream will alternate between images in
 * `rightImagesA` and `rightImagesB`. They are either presented in random order (default)
 * within those lists, or can be presented in the exact order listed by setting
 * `randomizeImageOrder` to false.
 *
 *
 * The timing of all image presentations and the specific images presented is recorded in
 * the event data.
 *
 *
 * This frame is displayed fullscreen; if the frame before it is not, that frame
 * needs to include a manual "next" button so that there's a user interaction
 * event to trigger fullscreen mode. (Browsers don't allow switching to fullscreen
 * without a user event.) If the user leaves fullscreen, that event is recorded, but the
 * trial is not paused.
 *
 *
 * Specifying media locations:
 *
 *
 * For any parameters that expect a list of audio/video sources, you can EITHER provide
 * a list of src/type pairs with full paths like this:
 ```json
 [
 {
            'src': 'http://.../video1.mp4',
            'type': 'video/mp4'
        },
 {
            'src': 'http://.../video1.webm',
            'type': 'video/webm'
        }
 ]
 ```
 * OR you can provide a single string 'stub', which will be expanded
 * based on the parameter baseDir and the media types expected - either audioTypes or
 * videoTypes as appropriate. For example, if you provide the audio source `intro`
 * and baseDir is https://mystimuli.org/mystudy/, with audioTypes ['mp3', 'ogg'], then this
 * will be expanded to:
 ```json
 [
 {
                             src: 'https://mystimuli.org/mystudy/mp3/intro.mp3',
                             type: 'audio/mp3'
                         },
 {
                             src: 'https://mystimuli.org/mystudy/ogg/intro.ogg',
                             type: 'audio/ogg'
                         }
 ]
 ```
 * This allows you to simplify your JSON document a bit and also easily switch to a
 * new version of your stimuli without changing every URL. You can mix source objects with
 * full URLs and those using stubs within the same directory. However, any stimuli
 * specified using stubs MUST be
 * organized as expected under baseDir/MEDIATYPE/filename.MEDIATYPE.
 *
 *
 * Example usage:

 ```json
 "frames": {
    "alt-trial": {
        "kind": "exp-lookit-change-detection",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": ["mp4", "webm"],
        "audioTypes": ["mp3", "ogg"],
        "trialLength": 15,
        "attnLength": 2,
        "fsAudio": "sample_1",
        "unpauseAudio": "return_after_pause",
        "pauseAudio": "pause",
        "videoSources": "attentiongrabber",
        "musicSources": "music_01",
        "audioSources": "video_01",
        "endAudioSources": "all_done",
        "border": "thick solid black",
        "leftImagesA": ["apple.jpg", "orange.jpg"],
        "rightImagesA": ["square.png", "tall.png", "wide.png"],
        "leftImagesB": ["apple.jpg", "orange.jpg"],
        "rightImagesB": ["apple.jpg", "orange.jpg"],
        "startWithA": true,
        "randomizeImageOrder": true,
        "displayMs": 500,
        "blankMs": 250,
        "containerColor": "white",
        "backgroundColor": "#abc",
    }
 }

 * ```
 * @class Exp-lookit-change-detection
 * @extends Exp-frame-base
 * @uses Full-screen
 * @uses Video-record
 * @uses Expand-assets
 */

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord, ExpandAssets, {

    type: 'exp-lookit-geometry-alternation',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',

    // Track state of experiment
    completedAudio: false,
    completedAttn: false,
    currentSegment: 'intro', // 'test' (mutually exclusive)
    alreadyStartedCalibration: false,

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    recordingStarted: false,

    imageIndexA: 0,
    imageIndexB: 0,
    doingA: false,
    musicFadeLength: 2000,

    assetsToExpand: {
        'audio': [
            'audioSources',
            'musicSources',
            'endAudioSources',
            'pauseAudio',
            'unpauseAudio',
            'fsAudio'
        ],
        'video': [
            'videoSources'
        ],
        'image': [
            'leftImagesA',
            'rightImagesA',
            'leftImagesB',
            'rightImagesB'
        ]
    },

    readyToStartCalibration: Ember.computed('recordingStarted', 'completedAudio', 'completedAttn', 'image_loaded_count',
        function() {
            var recordingStarted = false;
            if (this.get('session').get('recorder')) {
                recordingStarted = this.get('session').get('recorder').get('recording');
            } else {
                recordingStarted = this.get('recordingStarted');
            }
            var nImages = this.get('leftImagesA_parsed').length + this.get('leftImagesB_parsed').length +
                this.get('rightImagesA_parsed').length + this.get('rightImagesB_parsed').length;

            return ((recordingStarted || !this.get('doRecording')) && this.get('completedAudio') && this.get('completedAttn') && this.get('image_loaded_count') >= nImages);
        }),

    doingIntro: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'intro');
    }),

    isPaused: false,
    hasBeenPaused: false,

    // Timers for intro & stimuli
    introTimer: null, // minimum length of intro segment
    stimTimer: null,

    frameSchemaProperties: {
        /**
         * Whether to do webcam recording on this frame
         *
         * @property {Boolean} doRecording
         */
        doRecording: {
            type: 'boolean',
            description: 'Whether to do webcam recording',
            default: true
        },
        /**
         * minimum amount of time to show attention-getter in seconds. If 0, attention-getter
         * segment is skipped.
         *
         * @property {Number} attnLength
         * @default 0
         */
        attnLength: {
            type: 'number',
            description: 'minimum amount of time to show attention-getter in seconds',
            default: 0
        },
        /**
         * length of alternation trial in seconds. This refers only to the section of the
         * trial where the alternating image streams are presented - it does not count
         * any announcement phase.
         *
         * @property {Number} trialLength
         * @default 60
         */
        trialLength: {
            type: 'number',
            description: 'length of alternation trial in seconds',
            default: 60
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * instructions during attention-getter video
         *
         * @property {Object[]} audioSources
         */
        audioSources: {
            oneOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for instructions during attention-getter video',
            default: []
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * music during trial
         *
         * @property {Object[]} musicSources
         */
        musicSources: {
            oneOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for music during trial',
            default: []
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * audio after completion of trial (optional; used for last
         * trial "okay to open your eyes now" announcement)
         *
         * @property {Object[]} endAudioSources
         */
        endAudioSources: {
            oneOf: audioAssetOptions,
            description: 'Supply this to play audio at the end of the trial; list of objects specifying audio src and type',
            default: []
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * attention-getter video (should be loopable)
         *
         * @property {Object[]} videoSources
         */
        videoSources: {
            oneOf: videoAssetOptions,
            description: 'List of objects specifying video src and type for attention-getter video',
            default: []
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * audio played upon pausing study
         *
         * @property {Object[]} pauseAudio
         */
        pauseAudio: {
            oneOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for audio played when pausing study',
            default: []
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * audio played upon unpausing study
         *
         * @property {Object[]} unpauseAudio
         */
        unpauseAudio: {
            oneOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for audio played when pausing study',
            default: []
        },
        /**
         * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
         * audio played when study is paused due to not being fullscreen
         *
         * @property {Object[]} fsAudio
         */
        fsAudio: {
            oneOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for audio played when pausing study if study is not fullscreen',
            default: []
        },
        /**
         * Whether to start with the 'A' image list on both left and right. If true, both
         * sides start with their respective A image lists; if false, both lists start with
         * their respective B image lists.
         *
         * @property {Boolean} startWithA
         * @default true
         */
        startWithA: {
            type: 'boolean',
            description: 'Whether to start with image list A',
            default: true
        },
        /**
         * Whether to randomize image presentation order within the lists leftImagesA,
         * leftImagesB, rightImagesA, and rightImagesB. If true (default), the order
         * of presentation is randomized. Each time all the images in one list have been
         * presented, the order is randomized again for the next 'round.' If false, the
         * order of presentation is as written in the list. Once all images are presented,
         * we loop back around to the first image and start again.
         *
         * Example of randomization: suppose we have defined
         * ```
         * leftImagesA: ['apple', 'banana', 'cucumber'],
         * leftImagesB: ['aardvark', 'bat'],
         * randomizeImageOrder: true,
         * startWithA: true
         * ```
         *
         * And suppose the timing is such that we end up with 10 images total. Here is a
         * possible sequence of images shown on the left:
         *
         * ['banana', 'aardvark', 'apple', 'bat', 'cucumber', 'bat', 'cucumber', 'aardvark', 'apple', 'bat']
         *
         * @property {Boolean} randomizeImageOrder
         * @default true
         */
        randomizeImageOrder: {
            type: 'boolean',
            description: 'Whether to randomize image presentation order within lists',
            default: true
        },
        /**
         * Amount of time to display each image, in milliseconds
         *
         * @property {Number} displayMs
         * @default 750
         */
        displayMs: {
            type: 'number',
            description: 'Amount of time to display each image, in milliseconds',
            default: 500
        },
        /**
         * Amount of time for blank display between each image, in milliseconds
         *
         * @property {Number} blankMs
         * @default 750
         */
        blankMs: {
            type: 'number',
            description: 'Amount of time for blank display between each image, in milliseconds',
            default: 250
        },
        /**
         * Format of border to display around alternation streams, if any. See
         * https://developer.mozilla.org/en-US/docs/Web/CSS/border for syntax.
         *
         * @property {String} border
         * @default 'thin solid gray'
         */
        border: {
            type: 'string',
            description: 'Amount of time for blank display between each image, in milliseconds',
            default: 'thin solid gray'
        },
        /**
         * Color of background. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
         * for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
         * rgb hex values (e.g. '#800080' - include the '#')
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
         * Color of image stream container, if different from overall background.
         * Defaults to backgroundColor if one is provided.
         * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
         * for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
         * rgb hex values (e.g. '#800080' - include the '#')
         *
         * @property {String} containerColor
         * @default 'white'
         */
        containerColor: {
            type: 'string',
            description: 'Color of image stream container',
            default: 'white'
        },
        /**
         * Set A of images to display on left of screen. Left stream will alternate between
         * images from set A and from set B. Elements of list can be full URLs or relative
         * paths starting from `baseDir`.
         *
         * @property {String[]} leftImagesA
         */
        leftImagesA: {
            type: 'array',
            description: 'Set A of images to display on left of screen',
            default: [],
            items: {
                oneOf: imageAssetOptions
            }
        },
        /**
         * Set B of images to display on left of screen. Left stream will alternate between
         * images from set A and from set B. Elements of list can be full URLs or relative
         * paths starting from `baseDir`.
         *
         * @property {String[]} leftImagesB
         */
        leftImagesB: {
            type: 'array',
            description: 'Set B of images to display on left of screen',
            default: [],
            items: {
                oneOf: imageAssetOptions
            }
        },
        /**
         * Set A of images to display on right of screen. Right stream will alternate between
         * images from set A and from set B. Elements of list can be full URLs or relative
         * paths starting from `baseDir`.
         *
         * @property {String[]} rightImagesA
         */
        rightImagesA: {
            type: 'array',
            description: 'Set A of images to display on right of screen',
            default: [],
            items: {
                oneOf: imageAssetOptions
            }
        },
        /**
         * Set B of images to display on right of screen. Right stream will alternate between
         * images from set A and from set B. Elements of list can be full URLs or relative
         * paths starting from `baseDir`.
         *
         * @property {String[]} rightImagesA
         */
        rightImagesB: {
            type: 'array',
            description: 'Set B of images to display on right of screen',
            default: [],
            items: {
                oneOf: imageAssetOptions
            }
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {
                /**
                * Sequence of images shown on the left
                * @attribute leftSequence
                */
                leftSequence: {
                    type: 'Object'
                },
                /**
                * Sequence of images shown on the right
                * @attribute rightSequence
                */
                rightSequence: {
                    type: 'Object'
                },
                videoId: {
                    type: 'string'
                },
                /**
                * Whether this trial was paused
                * @attribute hasBeenPaused
                */
                hasBeenPaused: {
                    type: 'boolean'
                }
            }
        }
    },

    calObserver: observer('readyToStartCalibration', function(frame) {
        if (frame.get('readyToStartCalibration') && frame.get('currentSegment') === 'intro') {
            if (!frame.checkFullscreen()) {
                frame.pauseStudy();
            } else {
                frame.set('currentSegment', 'test');
            }
        }
    }),

    segmentObserver: observer('currentSegment', function(frame) {
        // Don't trigger starting intro; that'll be done manually.
        if (frame.get('currentSegment') === 'test') {
            frame.startTrial();
        }
    }),

    didRender() {
        this._super(...arguments);
        if (this.get('doingCalibration') && !this.get('alreadyStartedCalibration')) {
            this.set('alreadyStartedCalibration', true);
            this.startCalibration();
        }
    },

    actions: {
        // When intro audio is complete
        endAudio() {
            this.set('completedAudio', true);
            this.notifyPropertyChange('readyToStartCalibration');
        },

        finish() {

            // Call this something separate from next because stopRecorder promise needs
            // to call next AFTER recording is stopped and we don't want this to have
            // already been destroyed at that point.
            /**
             * Just before stopping webcam video capture
             *
             * @event stoppingCapture
            */
            var _this = this;
            this.stopRecorder().then(() => {
                _this.set('stoppedRecording', true);
                _this.send('next');
                return;
            }, () => {
                _this.send('next');
                return;
            });

            this._super(...arguments);
        }

    },

    startIntro() {
        // Allow pausing during intro
        var _this = this;
        $(document).off('keyup.pauser');
        $(document).on('keyup.pauser', function(e) {_this.handleSpace(e, _this);});

        // Start placeholder video right away
        /**
         * Immediately before starting intro/announcement segment
         *
         * @event startIntro
         */
        this.send('setTimeEvent', 'startIntro');
        if (this.get('attnLength')) {
            $('#player-video')[0].play();
            // Set a timer for the minimum length for the intro/break
            $('#player-audio')[0].play();
            this.set('introTimer', window.setTimeout(function() {
                _this.set('completedAttn', true);
                _this.notifyPropertyChange('readyToStartCalibration');
            }, _this.get('attnLength') * 1000));
        } else {
            _this.set('completedAttn', true);
            _this.set('completedAudio', true);
            _this.notifyPropertyChange('readyToStartCalibration');
        }
    },

    startTrial() {

        var _this = this;
        /**
         * Immediately before starting test trial segment
         *
         * @event startTestTrial
         */
        _this.send('setTimeEvent', 'startTestTrial');

        // Begin playing music; fade in and set to fade out at end of trial
        var $musicPlayer = $('#player-music');
        $musicPlayer.prop('volume', 0.1);
        $musicPlayer[0].play();
        $musicPlayer.animate({volume: 1}, _this.get('musicFadeLength'));
        window.setTimeout(function() {
            $musicPlayer.animate({volume: 0}, _this.get('musicFadeLength'));
        }, _this.get('trialLength') * 1000 - _this.get('musicFadeLength'));

        // Start presenting triangles and set to stop after trial length
        $('#allstimuli').show();
        _this.presentImages();
        window.setTimeout(function() {
            window.clearTimeout(_this.get('stimTimer'));
            _this.clearImages();
            _this.endTrial();
        }, _this.get('trialLength') * 1000);
    },

    // When triangles have been shown for time indicated: play end-audio if
    // present, or just move on.
    endTrial() {
        this.stopRecorder();
        if (this.get('endAudioSources').length) {
            $('#player-endaudio')[0].play();
        } else {
            this.send('finish');
        }
    },

    clearImages() {
        /**
         * Records each time images are cleared from display
         *
         * @event clearImages
        */
        this.send('setTimeEvent', 'clearImages');
        $('.stream-container').html('');
    },

    presentImages() {
        var A = this.get('doingA');
        var leftImageList = A ? this.get('leftImagesA_parsed') : this.get('leftImagesB_parsed');
        var rightImageList = A ? this.get('rightImagesA_parsed') : this.get('rightImagesB_parsed');
        var imageIndex = A ? this.get('imageIndexA') : this.get('imageIndexB');

        var leftImageIndex = imageIndex % leftImageList.length;
        var rightImageIndex = imageIndex % rightImageList.length;

        if (leftImageIndex == 0 && this.get('randomizeImageOrder')) {
            shuffleArrayInPlace(leftImageList);
        }
        if (rightImageIndex == 0 && this.get('randomizeImageOrder')) {
            shuffleArrayInPlace(rightImageList);
        }
        if (A) {
            this.set('imageIndexA', this.get('imageIndexA') + 1);
        } else {
            this.set('imageIndexB', this.get('imageIndexB') + 1);
        }
        this.set('doingA', !this.get('doingA'));
        var _this = this;
        _this.clearImages();
        _this.set('stimTimer', window.setTimeout(function() {
            $('#left-stream-container').html(`<img src=${leftImageList[leftImageIndex]} class="stim-image" alt="left image">`);
            $('#right-stream-container').html(`<img src=${rightImageList[rightImageIndex]} class="stim-image" alt="right image">`);
            /**
             * Immediately after making images visible
             *
             * @event presentImages
             * @param {String} left url of left image
             * @param {String} right url of right image
             */
            _this.send('setTimeEvent', 'presentImages', {
                left: leftImageList[leftImageIndex],
                right: rightImageList[rightImageIndex]
            });
            _this.set('stimTimer', window.setTimeout(function() {
                _this.presentImages();
            }, _this.get('displayMs')));
        }, _this.get('blankMs')));
    },

    handleSpace(event, frame) {
        if (frame.checkFullscreen() || !frame.isPaused) {
            if (event.which === 32) { // space
                frame.pauseStudy();
            }
        }
    },

    // Pause/unpause study; only called if doing intro.
    pauseStudy() {

        $('#player-audio')[0].pause();
        $('#player-audio')[0].currentTime = 0;
        $('#player-pause-audio')[0].pause();
        $('#player-pause-audio')[0].currentTime = 0;
        $('#player-pause-audio-leftfs')[0].pause();
        $('#player-pause-audio-leftfs')[0].currentTime = 0;

        this.set('completedAudio', false);
        this.set('completedAttn', false);

        Ember.run.once(this, () => {
            this.set('hasBeenPaused', true);
            var wasPaused = this.get('isPaused');
            this.set('currentSegment', 'intro');

            // Currently paused: RESUME
            if (wasPaused) {
                this.startIntro();
                this.set('isPaused', false);
            } else { // Not currently paused: PAUSE
                window.clearTimeout(this.get('introTimer'));
                if (this.checkFullscreen()) {
                    $('#player-pause-audio')[0].play();
                } else {
                    $('#player-pause-audio-leftfs')[0].play();
                }
                this.set('isPaused', true);
            }
        });

    },

    image_loaded_count: 0,

    didInsertElement() {
        this._super(...arguments);
        this.set('doingA', this.get('startWithA'));
        this.notifyPropertyChange('readyToStartCalibration');
        var _this = this;

        $.each([this.get('leftImagesA_parsed'), this.get('leftImagesB_parsed'), this.get('rightImagesA_parsed'), this.get('rightImagesB_parsed')],
            function(idx, imgList) {
                $.each(imgList, function(idx, url) {
                    var img = new Image();
                    img.onload = function() { // set onload fn before source to ensure we catch it
                        _this.set('image_loaded_count', _this.get('image_loaded_count') + 1);
                        _this.notifyPropertyChange('readyToStartCalibration');
                    };
                    img.onerror = function() {
                        _this.set('image_loaded_count', _this.get('image_loaded_count') + 1);
                        _this.notifyPropertyChange('readyToStartCalibration');
                        console.error('Unable to load image at ', url, ' - will skip loading but this may cause the exp-lookit-change-detection frame to fail');
                    };
                    img.src = url;
                });
            });

        if (this.get('border').includes(';')) {
            console.warn('Invalid border css provided to exp-lookit-change-detection; not applying.');
        } else {
            $('#allstimuli div.stream-container').css('border', this.get('border'));
        }

        if (isColor(this.get('backgroundColor'))) {
            $('div.exp-lookit-change-detection').css('background-color', this.get('backgroundColor'));
        } else {
            console.warn('Invalid background color provided to exp-lookit-change-detection; not applying.');
        }

        if (isColor(this.get('containerColor'))) {
            $('div.exp-lookit-change-detection div.stream-container').css('background-color', this.get('containerColor'));
        } else {
            console.warn('Invalid container color provided to exp-lookit-change-detection; not applying.');
        }

        $('#allstimuli').hide();
        this.startIntro();
    },

    willDestroyElement() { // remove event handler
        $(document).off('keyup.pauser');
        window.clearInterval(this.get('introTimer'));
        window.clearInterval(this.get('stimTimer'));
        this._super(...arguments);
    },

    /**
     * What to do when individual-frame recording starts.
     * @method onRecordingStarted
     * @private
     */
    onRecordingStarted() {
        this.set('recordingStarted', true);
        this.notifyPropertyChange('readyToStartCalibration');
    },

    /**
     * What to do when session-level recording starts.
     * @method onSessionRecordingStarted
     * @private
     */
    onSessionRecordingStarted() {
        this.set('recordingStarted', true);
        this.notifyPropertyChange('readyToStartCalibration');
    }

});
