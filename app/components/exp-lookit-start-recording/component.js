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
* Dedicated frame to start session recording.
*
* This frame will take a few seconds to get a session-level recording started, then proceed
* immediately to the next frame. (See https://lookit.readthedocs.io/en/develop/researchers-create-experiment.html?highlight=startSessionRecording#recording-webcam-video
* for information about session-level vs. individual-frame recording.)
*
* (You could also set startSessionRecording to true on any frame, but then you need to rely
* on that individual frame's setup for waiting for recording before getting started.)
*
* If the following frame is full-screen, make this one full-screen too.
*
* Just like for exp-lookit-calibration, you can display a video or an optionally animated
* image (see below for examples of each) as a placeholder while getting recording started.
*
* For details about specifying media locations, please see
* https://lookit.readthedocs.io/en/develop/researchers-prep-stimuli.html?highlight=basedir#directory-structure
*
* Example usage:

```json

    "start-recording-with-image": {
        "kind": "exp-lookit-start-recording",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "image": "peekaboo_remy.jpg",
        "imageAnimation": "spin"
        "displayFullscreen": true
    },

    "start-recording-with-video": {
        "kind": "exp-lookit-start-recording",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "video": "attentiongrabber",
        "displayFullscreen": true
    },

* ```
* @class Exp-lookit-start-recording
* @extends Exp-frame-base
* @uses Expand-assets
*/

export default ExpFrameBaseComponent.extend(ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-start-recording',

    /**
     *
     * @property {Boolean} startSessionRecording
     * @default true
     * @private
     */
    startSessionRecording: true,

    /**
     *
     * @property {Boolean} endSessionRecording
     * @default false
     * @private
     */
    endSessionRecording: false,

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
         * Whether to display this frame in full-screen mode
         *
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
            description: 'list of objects specifying video src and type',
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
            description: 'Image to display while waiting',
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
            description: 'Which animation to use for the image',
            default: 'spin'
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {
            }
        }
    },

    onSessionRecordingStarted() {
        this.send('next');
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
            //$(`<style>.exp-lookit-start-stop-recording p.waitForVideo { color: ${textColor}; }</style>`).appendTo('div.exp-lookit-start-stop-recording');
            $('p.wait-for-video').css('color', textColorForBackground(colorSpecRGBA));
        } else {
            console.warn('Invalid background color provided; not applying.');
        }

        // Apply image animation class
        if (this.get('image')) {
            $('#placeholder-image').addClass(this.get('imageAnimation'));
        }

        // Check that we're not already recording
        if (this.get('sessionRecordingInProgress')) {
            console.warn('Already have active session recording; proceeding without starting another.');
            this.send('next');
        }

    }

});
