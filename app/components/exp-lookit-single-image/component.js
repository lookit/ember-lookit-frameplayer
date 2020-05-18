import Ember from 'ember';
import { imageAssetOptions } from '../../mixins/expand-assets';
//import { observer } from '@ember/object';

import ExpLookitImageAudioBase from '../exp-lookit-image-audio-base/component';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Frame to implement a basic "storybook page" trial, with images placed on the
 * screen within a display area and a sequence of audio files played.
 * Optionally, images may be highlighted at specified times during the audio
 * files.
 *
 * Webcam recording may be turned on or off; if on, the page is not displayed
 * or audio started until recording begins.
 *
 * Frame is displayed fullscreen, but is not paused or otherwise disabled if the
 * user leaves fullscreen. A button appears prompting the user to return to
 * fullscreen mode.
 *
 * The parent may press 'next' to proceed, or the study may proceed
 * automatically when audio finishes (autoProceed). Optionally, if using autoProceed,
 * the frame may be displayed for a minimum duration, so that e.g. it lasts exactly 10
 * seconds from start of audio even though the audio is only 2 seconds long. If using this
 * feature a progress bar may be displayed.
 *
 * Any number of images may be placed on the screen, and their position
 * specified. (Aspect ratio will be the same as the original image.)
 *
 * This frame is displayed fullscreen; if the frame before it is not, that frame
 * needs to include a manual "next" button so that there's a user interaction
 * event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
 * without a user event.)

```json
 "frames": {
    "story-intro-1": {
            "doRecording": false,
            "autoProceed": true,
            "baseDir": "https://s3.amazonaws.com/lookitcontents/ingroupobligations/",
            "audioTypes": ["mp3", "ogg"],
            "parentTextBlock": {
                "title": "Parents!",
                "text": "some instructions",
                "emph": true,
                "css": {
                    "color": "red",
                    "font-size": "12px"
                }
            },
            "images": [
                {
                    "id": "leftA",
                    "src": "flurps1.jpg",
                    "left": "10",
                    "width": "30",
                    "top": "34.47"
                },
                {
                    "id": "rightA",
                    "src": "zazzes1.jpg",
                    "left": "60",
                    "width": "30",
                    "top": "34.47"
                }
            ],
            "kind": "exp-lookit-story-page",
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": "intro1",
                    "highlights": [
                        {"range": [3.017343,    5.600283], "image":     "leftA"},
                        {"range": [5.752911,    8.899402], "image":     "rightA"}
                    ]
                }
            ]
        }
 }

 * ```
 * @class Exp-lookit-single-image
 * @extends Exp-lookit-image-audio-base
 * @uses Full-screen
 * @uses Video-record
 * @uses Expand-assets
 */

export default ExpLookitImageAudioBase.extend({
    type: 'exp-lookit-single-image',

    autoProceed: false,
    audioSources: [],

    assetsToExpand: {
        'audio': [],
        'video': [],
        'image': ['images/src']
    },

    frameSchemaProperties: {
        /**
         * Whether to do webcam recording (will wait for webcam
         * connection before starting audio if so)
         *
         * @property {Boolean} doRecording
         */
        doRecording: {
            type: 'boolean',
            description: 'Whether to do webcam recording (will wait for webcam connection before starting audio if so)'
        },

        /**
         * Duration of frame in seconds. If set and positive, there will be no next button
         * displayed and the experiment will auto-proceed after the duration elapses.
         * Default is -1: next button is displayed and parent chooses when to proceed.
         *
         * @property {Number} durationSeconds
         * @default -1
         */
        durationSeconds: {
            type: 'number',
            description: 'Minimum duration of frame in seconds if autoproceeding',
            default: -1
        },

        /**
         * [Only used if durationSeconds set] Whether to
         * show a progress bar based on durationSeconds in the parent text area.
         *
         * @property {Number} showProgressBar
         */
        showProgressBar: {
            type: 'boolean',
            description: 'Whether to show a progress bar based on durationSeconds',
            default: false
        },

        /**
         * [Only used if next button is also displayed] Whether to
         * show a previous button to allow the participant to go to the previous frame
         *
         * @property {Number} showPreviousButton
         */
        showPreviousButton: {
            type: 'boolean',
            default: true,
            description: 'Whether to show a previous button (used only if showing Next button)'
        },

        /**
         * Text to display to parent.  Each field is optional. If the `parentTextBlock`
         * is an empty object `{}`, no parent text block is displayed at all at the bottom
         * of the screen. Otherwise, even if the title and text are empty, the block will
         * be displayed as usual without any text.
         *
         * @property {Object} parentTextBlock
         *   @param {String} title title to display
         *   @param {String} text paragraph of text
         *   @param {Boolean} emph whether to bold this paragraph
         *   @param {Object} css object specifying any css properties
         *      to apply to this section, and their values - e.g.
         *      {'color': 'red', 'font-size': '12px'}
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
                emph: {
                    type: 'boolean'
                },
                css: {
                    type: 'object',
                    default: {}
                }
            },
            default: {}
        },

        /**
         * Image to display and information about its placement
         *
         * @property {Object[]} images
         *   @param {String} src URL of image source. This can be a full
         *     URL, or relative to baseDir (see baseDir).
         *   @param {String} alt alt-text for image in case it doesn't load and for
         *     screen readers
         *   @param {String} left left margin, as percentage of story area width
         *   @param {String} width image width, as percentage of story area width
         *   @param {String} top top margin, as percentage of story area height
         */
        image: {
            type: 'object',
            properties: {
                'src': {
                    anyOf: imageAssetOptions
                },
                'left': {
                    type: 'string'
                },
                'width': {
                    type: 'string'
                },
                'top': {
                    type: 'string'
                },
                'alt': {
                    type: 'string'
                }
            }
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
            default: 'black'
        },
        /**
         * Color of area where images are shown, if different from overall background.
         * Defaults to backgroundColor if one is provided. See
         * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
         * for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
         * rgb hex values (e.g. '#800080' - include the '#')
         *
         * @property {String} pageColor
         * @default 'white'
         */
        pageColor: {
            type: 'string',
            description: 'Color of image area',
            default: 'white'
        }
    },

    actions: {

        finish() {
            this.finish();
        },

        finishedAudio() {
            this.finishedAudio();
        },

        playAudio() { // TODO: combine / use parent fn
            this.set('startedAudio', true);
            if (this.get('durationSeconds') && this.get('durationSeconds') > 0) {
                let _this = this;
                /**
                * Timer for set-duration trial begins
                *
                * @event startTimer
                */
                this.send('setTimeEvent', 'startTimer');
                this.set('pageTimer', window.setTimeout(function() {
                    /**
                        * Timer for set-duration trial ends
                        *
                        * @event endTimer
                        */
                    _this.send('setTimeEvent', 'endTimer');
                    _this.set('minDurationAchieved', true);
                    _this.send('finish');
                }, _this.get('durationSeconds') * 1000));
                if (this.get('showProgressBar')) {
                    this.set('timerStart', new Date().getTime());
                    let timerStart = _this.get('timerStart');
                    let durationSeconds = _this.get('durationSeconds');
                    this.set('progressTimer', window.setInterval(function() {
                        let now = new Date().getTime();
                        var prctDone =  (now - timerStart) / (durationSeconds * 10);
                        $('.progress-bar').css('width', prctDone + '%');
                    }, 100));
                }
            } else {
                this.set('minDurationAchieved', true);
            }
        }

    },

    didInsertElement() {
        this._super(...arguments);
        if (this.get('durationSeconds') && this.get('durationSeconds') > 0) {
            $('#nextbutton').prop('disabled', true);
        } else {
            $('#nextbutton').prop('disabled', false);
        }
    },

    didReceiveAttrs() {
        this._super(...arguments);

        let image = this.get('image');
        if (!image.hasOwnProperty('id')) {
            image.id = 'image_1';
        }

        this.set('images', [image]);
        this.set('autoProceed', this.get('durationSeconds') > 0);
        this.set('showProgressBar', this.get('showProgressBar') && this.get('autoProceed'));
        this.expandAssets();
    }

});
