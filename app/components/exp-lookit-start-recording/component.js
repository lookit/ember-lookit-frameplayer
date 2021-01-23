import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import ExpandAssets from '../../mixins/expand-assets';
import isColor, {colorSpecToRgbaArray, textColorForBackground} from '../../utils/is-color';
import { imageAssetOptions, videoAssetOptions } from '../../mixins/expand-assets';

let {
    $
} = Ember;



/*
* Dedicated frame to start session recording.
*/

export default ExpFrameBaseComponent.extend(ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-start-recording',

    startSessionRecording: true,

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

        displayFullscreen: {
            type: 'boolean',
            description: 'Whether to display this frame in full-screen mode',
            default: true
        },

        backgroundColor: {
            type: 'string',
            description: 'Color of background',
            default: 'white'
        },

        video: {
            anyOf: videoAssetOptions,
            description: 'list of objects specifying video src and type',
            default: []
        },

        image: {
            anyOf: imageAssetOptions,
            description: 'Image to display while waiting',
            default: ''
        },

        imageAnimation: {
            type: 'string',
            enum: ['bounce', 'spin', ''],
            description: 'Which animation to use for the image',
            default: 'spin'
        },

        waitForVideoMessage: {
            type: 'string',
            default: '',
            description: 'Text to display while waiting'
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
