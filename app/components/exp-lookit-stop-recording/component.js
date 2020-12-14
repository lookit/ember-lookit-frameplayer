import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import ExpandAssets from '../../mixins/expand-assets';
import isColor, {colorSpecToRgbaArray, textColorForBackground} from '../../utils/is-color';
import { imageAssetOptions, videoAssetOptions } from '../../mixins/expand-assets';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
* Dedicated frame to stop session recording.
*
* This frame will take a few seconds to upload an ongoing session-level recording, then proceed
* immediately to the next frame. (See https://lookit.readthedocs.io/en/develop/researchers-create-experiment.html?highlight=startSessionRecording#recording-webcam-video
* for information about session-level vs. individual-frame recording.)
*
* It will time out after a default of 5 minutes of waiting for the upload to complete, or
* after 5 seconds of not seeing any progress (i.e. something went wrong with starting the
* upload process). If there is no active session recording, it proceeds immediately.
*
*
*
* (You could also set stopSessionRecording to true on any frame, but you generally wouldn't
* get any specialized functionality for displaying a nice message about upload progress.)
*
* Just like for exp-lookit-calibration, you can display a video or an optionally animated
* image (see below for examples of each) as a placeholder while getting recording started.
*
* For details about specifying media locations, please see
* https://lookit.readthedocs.io/en/develop/researchers-prep-stimuli.html?highlight=basedir#directory-structure
*
* Example usage:

```json

    "stop-recording-with-image": {
        "kind": "exp-lookit-stop-recording",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "image": "peekaboo_remy.jpg",
        "imageAnimation": "spin"
        "displayFullscreen": true
    },

    "stop-recording-with-video": {
        "kind": "exp-lookit-stop-recording",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "video": "attentiongrabber",
        "displayFullscreen": true
    },

* ```
* @class Exp-lookit-stop-recording
* @extends Exp-frame-base
* @uses Expand-assets
*/

export default ExpFrameBaseComponent.extend(ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-stop-recording',

    /**
     * @property {Boolean} startSessionRecording
     * @private
     */
    /**
     * @property {Boolean} endSessionRecording
     * @private
     */
    endSessionRecording: true,
    /**
     * Maximum time allowed for whole-session video upload before proceeding, in seconds.
     * Can be overridden by researcher, based on tradeoff between making families wait and
     * losing data.
     * @property {Number} sessionMaxUploadSeconds
     * @default 3000
     */
    sessionMaxUploadSeconds: 300, // 5 minutes - generous default for possibly long recording

    hasStartedUpload: false,

    progressTimer: null,
    allowProceedTimer: null,

    assetsToExpand: {
        'audio': [],
        'video': [
            'video'
        ],
        'image': [
            'image'
        ]
    },

    frameSchemaProperties: {
        /**
         * Whether to display this frame in full-screen mode         *
         * @property {Boolean} displayFullscreen
         * @default true
         */
        displayFullscreen: {
            type: 'boolean',
            description: 'Whether to display this frame in full-screen mode',
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
         * Video to play (looping) while waiting. Supply
         * either a video or image, not both.
         *
         * This can be either an array of {src: 'url', type: 'MIMEtype'} objects or
         * just a string like `attentiongrabber` to rely on the `baseDir` and `videoTypes`
         * to generate full paths.
         *
         * @property {Object[]} video
         * @default []
         */
        video: {
            anyOf: videoAssetOptions,
            description: 'list of objects specifying video src and type for calibration audio',
            default: []
        },
        /**
         * Image to display while waiting. Supply
         * either a video or image, not both.
         *
         * This can be either a full URL or just the filename (e.g. "star.png") to
         * use the full path based on `baseDir` (e.g. `baseDir/img/star.png`).
         *
         * @property {String} image
         * @default []
         */
        image: {
            anyOf: imageAssetOptions,
            description: 'Image to display while uploading',
            default: ''
        },

        /**
         * Which animation to use for the image. Options are 'bounce', 'spin',
         * or '' (empty to not animate).
         *
         * @property {String} imageAnimation
         * @default []
         */
        imageAnimation: {
            type: 'string',
            enum: ['bounce', 'spin', ''],
            description: 'Which animation to use for the image.',
            default: 'spin'
        }
    },

    // TODO: store some data about what happened!
    meta: {
        data: {
            type: 'object',
            properties: {
            }
        }
    },


    didInsertElement() {
        this._super(...arguments);
        this.set('hasVideo', this.get('video').length > 0);

        // Apply background colors
        let colorSpec = this.get('backgroundColor');
        if (isColor(colorSpec)) {
            $('div.exp-lookit-start-stop-recording').css('background-color', colorSpec);
            // Set text color so it'll be visible (black or white depending on how dark background is). Use style
            // so this applies whenever pause text actually appears.
            let colorSpecRGBA = colorSpecToRgbaArray(colorSpec);
            $('p.wait-for-video').css('color', textColorForBackground(colorSpecRGBA));
        } else {
            console.warn('Invalid background color provided; not applying.');
        }

        // Apply image animation class
        if (this.get('image')) {
            $('#placeholder-image').addClass(this.get('imageAnimation'));
        }

        // Make sure we're already recording at the session level!
        if (!this.get('sessionRecordingInProgress')) {
            /**
             * If there's no active session recording so this frame is proceeding
             * immediately.
             *
             * @event warningNoActiveSessionRecording
             */
            this.send('setTimeEvent', 'warningNoActiveSessionRecording');
            this.send('next');
        }

        var _this = this;
        this.stopSessionRecorder().finally(() => {
            _this.send('next');
        });

        this.set('progressTimer', window.setInterval(function() {
            let msg = $('.pipeMsgOverlay').html();
            let match = msg.match(/\d*%/);
            if (match) {
                $('#progress').html(`Uploading video... ${match[0]}`);
                $('.progress-bar').css('width', match);
                _this.set('hasStartedUpload', true);
            } else if (msg) {
                $('#progress').html(msg);
            } else {
                $('#progress').html('Uploading video...')
            }
        }, 100));

        this.set('allowProceedTimer', window.setTimeout(function() {
            if (!_this.get('hasStartedUpload')) {
                /**
                 * If no progress update about upload is available within 10s, and
                 * frame proceeds automatically. Otherwise if the upload has started
                 * (e.g. we know it is 10% done) it will continue waiting.
                 *
                 * @event warningUploadTimeoutError
                 */
                _this.send('setTimeEvent', 'warningUploadTimeoutError');
                _this.send('next');
            }
        }, 5000));

    },

    willDestroyElement() {
        window.clearInterval(this.get('progressTimer'));
        window.clearInterval(this.get('allowProceedTimer'));
        this._super(...arguments);
    }

});
