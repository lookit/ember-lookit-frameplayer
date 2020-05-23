import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { audioAssetOptions, imageAssetOptions, videoAssetOptions } from '../../mixins/expand-assets';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
*
* Frame to do calibration for looking direction. Shows a small video/image in a sequence
* of locations so you'll have video of the child looking to those locations at known times.
*
* The attention-grabber can be either a small video or an image (see examples below of each).
* Images can be animated (spinning or bouncing).
*
* Generally you will want to have video of this frame. You can set doRecording to true to
* make a video clip just for this frame, or you can use session-level recording (set
* startSessionRecording to true on this or a previous frame). If either type of recording
* is starting on this frame, it waits until recording starts to display the first calibration
* segment.
*
* It can be displayed at center, left, or right of the screen. You can specify the sequence
* of positions or use the default ['center', 'left', 'right', 'center']. Each time it moves,
* the video (if any) and audio restart, and an event is recorded with the location and time (and time
* relative to any video recording) of the segment start.
*
* For details about specifying media locations, please see
* https://lookit.readthedocs.io/en/develop/researchers-prep-stimuli.html?highlight=basedir#directory-structure
*
* This frame is displayed fullscreen, to match the frames you will likely want to compare
* looking behavior on. If the participant leaves fullscreen, that will be
* recorded as an event, and a large "return to fullscreen" button will be displayed. Don't
* use video coding from any intervals where the participant isn't in fullscreen mode - the
* position of the attention-grabbers won't be as expected.
*
* If the frame before it is not fullscreen, that frame
* needs to include a manual "next" button so that there's a user interaction
* event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
* without a user event.)
*
* Example usage:

```json

    "calibration-with-image": {
        "kind": "exp-lookit-calibration",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "audioTypes": [
            "ogg",
            "mp3"
        ],
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "calibrationImage": "peekaboo_remy.jpg",
        "calibrationLength": 3000,
        "calibrationPositions": [
            "center",
            "left",
            "right"
        ],
        "calibrationAudio": "chimes",
        "calibrationImageAnimation": "spin"
    },

    "calibration-with-video": {
        "kind": "exp-lookit-calibration",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "audioTypes": [
            "ogg",
            "mp3"
        ],
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "calibrationLength": 3000,
        "calibrationPositions": [
            "center",
            "left",
            "right"
        ],
        "calibrationAudio": "chimes",
        "calibrationVideo": "attentiongrabber"
    },

* ```
* @class Exp-lookit-calibration
* @extends Exp-frame-base
* @uses Full-screen
* @uses Media-reload
* @uses Video-record
* @uses Expand-assets
*/

// Todo - probably make mixin for setting background color etc.
// See https://stackoverflow.com/a/56266358
const isColor = (strColor) => {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
};

export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, VideoRecord, ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-calibration',

    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',

    assetsToExpand: {
        'audio': [
            'calibrationAudio',
        ],
        'video': [
            'calibrationVideo'
        ],
        'image': [
            'calibrationImage'
        ]
    },

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    calTimer: null, // reference to timer counting how long calibration segment has played
    retryCalibrationAudio: false, // see exp-lookit-video regarding this workaround

    frameSchemaProperties: {

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
         * Color of background. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
         * for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
         * rgb hex values (e.g. '#800080' - include the '#')
         *
         * @property {String} backgroundColor
         * @default 'black'
         */
        backgroundColor: {
            type: 'string',
            description: 'Color of background',
            default: 'white'
        },
        /**
         * Length of single calibration segment in ms.
         *
         * @property {Number} calibrationLength
         * @default 3000
         */
        calibrationLength: {
            type: 'number',
            description: 'length of single calibration segment in ms',
            default: 3000
        },
        /**
         * Ordered list of positions to show calibration segment in. Options are
         * "center", "left", "right". Ignored if calibrationLength is 0.
         *
         * @property {Array} calibrationPositions
         * @default ["center", "left", "right", "center"]
         */
        calibrationPositions: {
            type: 'array',
            description: 'Ordered list of positions to show calibration',
            items: {
                type: 'string',
                enum: ['center', 'left', 'right']
            },
            default: ['center', 'left', 'right', 'center']
        },
        /**
         * Audio to play when the attention-grabber is placed at each location (will be
         * played once from the start, but cut off if it's longer than calibrationLength).
         *
         * This can either be an array of `{src: 'url', type: 'MIMEtype'}` objects for
         * calibration audio, or just a string to use the full URLs based on `baseDir`.
         *
         * @property {Object[]} calibrationAudio
         * @default []
         */
        calibrationAudio: {
            anyOf: audioAssetOptions,
            description: 'list of objects specifying audio src and type for calibration audio',
            default: []
        },
        /**
         * Calibration video (played from start at each calibration position). Supply
         * either a calibration video or calibration image, not both.
         *
         * This can be either an array of {src: 'url', type: 'MIMEtype'} objects or
         * just a string like `attentiongrabber` to rely on the `baseDir` and `videoTypes`
         * to generate full paths.
         *
         * @property {Object[]} calibrationVideo
         * @default []
         */
        calibrationVideo: {
            anyOf: videoAssetOptions,
            description: 'list of objects specifying video src and type for calibration audio',
            default: []
        },
        /**
         * Image to use for calibration - will be placed at each location. Supply
         * either a calibration video or calibration image, not both.
         *
         * This can be either a full URL or just the filename (e.g. "star.png") to
         * use the full path based on `baseDir` (e.g. `baseDir/img/star.png`).
         *
         * @property {String} calibrationImage
         * @default []
         */
        calibrationImage: {
            anyOf: imageAssetOptions,
            description: 'TODO',
            default: ''
        },

        /**
         * Which animation to use for the calibration image. Options are 'bounce', 'spin',
         * or '' (empty to not animate).
         *
         * @property {String} calibrationImageAnimation
         * @default []
         */
        calibrationImageAnimation: {
            type: 'string',
            enum: ['bounce', 'spin', ''],
            description: 'TODO',
            default: 'spin'
        }
    },

    meta: {
        name: 'Video player',
        description: 'Component that plays a video',
        data: {
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                }
            }
        }
    },

    finish() { // Move to next frame altogether
        // Call this something separate from next because stopRecorder promise needs
        // to call next AFTER recording is stopped and we don't want this to have
        // already been destroyed at that point.
        window.clearInterval(this.get('calTimer'));
        var _this = this;
        if (this.get('doRecording')) {
            this.stopRecorder().then(() => {
                _this.set('stoppedRecording', true);
                _this.send('next');
                return;
            }, () => {
                _this.send('next');
                return;
            });
        } else {
            _this.send('next');
        }
    },

    startCalibration() {
        var _this = this;

        // First check whether any calibration video provided. If not, skip.
        if (!this.get('calibrationLength')) {
            this.finish();
        }

        var calAudio = $('#player-calibration-audio')[0];
        $('.calibration-stimulus').show();

        // Show the calibration segment at center, left, right, center, each
        // time recording an event and playing the calibration audio.
        var doCalibrationSegments = function(calList, lastLoc) {
            if (calList.length === 0) {
                _this.finish();
            } else {
                var thisLoc = calList.shift();
                /**
                 * Start of EACH calibration segment
                 *
                 * @event startCalibration
                 * @param {String} location location of calibration ball, relative to child: 'left', 'right', or 'center'
                 */
                _this.send('setTimeEvent', 'startCalibration',
                    {location: thisLoc});


                _this.set('retryCalibrationAudio', true);
                calAudio.pause();
                calAudio.currentTime = 0;
                calAudio.play().then(() => {}, () => {
                    calAudio.play();
                });

                $('.calibration-stimulus').removeClass(lastLoc);
                $('.calibration-stimulus').addClass(thisLoc);
                if (_this.get('hasVideo')) {
                    var calVideo = $('#player-calibration-video')[0];
                    calVideo.pause();
                    calVideo.currentTime = 0;
                    calVideo.play();
                }


                _this.set('calTimer', window.setTimeout(function() {
                    _this.set('retryCalibrationAudio', false);
                    doCalibrationSegments(calList, thisLoc);
                }, _this.get('calibrationLength')));
            }
        };

        doCalibrationSegments(this.get('calibrationPositions').slice(), '');

    },

    reloadObserver: Ember.observer('reloadingMedia', function() {
        console.log('reloadObserver');
        if (!this.get('reloadingMedia')) {  // done with most recent reload
            if (this.get('retryCalibrationAudio')) {
                $('#player-calibration-audio')[0].play();
            }
        }
    }),

    onRecordingStarted() {
        $('#waitForVideo').hide();
        this.startCalibration();
    },

    onSessionRecordingStarted() {
        $('#waitForVideo').hide();
        this.startCalibration();
    },

    didInsertElement() {
        this._super(...arguments);
        this.set('hasVideo', this.get('calibrationVideo').length > 0);
        $('.calibration-stimulus').hide();

        // Apply background colors
        if (isColor(this.get('backgroundColor'))) {
            $('div.exp-lookit-image-audio').css('background-color', this.get('backgroundColor'));
        } else {
            console.warn('Invalid background color provided; not applying.');
        }

        // Apply calibration animation class
        if (this.get('calibrationImage')) {
            $('#calibration-image').addClass(this.get('calibrationImageAnimation'));
        }
        if (!(this.get('doRecording') || this.get('startSessionRecording'))) {
            $('#waitForVideo').hide();
            this.startCalibration();
        }
    },

    willDestroyElement() {
        window.clearInterval(this.get('calTimer'));
        this._super(...arguments);
    }
});
