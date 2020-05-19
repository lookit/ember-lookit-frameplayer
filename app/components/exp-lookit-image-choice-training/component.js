import Ember from 'ember';
import { imageAssetOptions, audioAssetOptions } from '../../mixins/expand-assets';
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
 * TODO
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
 * @class Exp-lookit-image-choice-training
 * @extends Exp-lookit-image-audio-base
 * @uses Full-screen
 * @uses Video-record
 * @uses Expand-assets
 */

export default ExpLookitImageAudioBase.extend({
    type: 'exp-lookit-image-choice-training',

    autoProceed: false,
    audioSources: [],

    requireCorrectChoice: true,

    canMakeChoice: false,

    frameSchemaProperties: {

        /**
         * Whether to proceed automatically after audio (and hide
         * replay/next buttons). If true: the next, previous, and replay buttons are
         * hidden, and the frame auto-advances after (a) the audio segment (if any)
         * completes AND (b) the durationSeconds is achieved. If false: the next, previous,
         * and replay buttons (as applicable) are displayed. It becomes possible to
         * press 'next' only once the audio segment, if any, is finished.
         *
         * @property {Boolean} autoProceed
         * @default false
         */
        autoProceed: {
            type: 'boolean',
            description: 'Whether to proceed automatically after audio (and hide replay/next buttons)',
            default: false
        },

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
         * Minimum duration of frame in seconds. If set and positive, then it will only
         * be possible to proceed to the next frame after both the audio completes AND
         * this duration is acheived. (If `autoProceed` is true, the experiment will
         * proceed automatically then; otherwise the Next button will be enabled at that
         * point.)
         *
         * @property {Number} durationSeconds
         * @default -1
         */
        durationSeconds: {
            type: 'number',
            description: 'Minimum duration of frame in seconds',
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
         * [Only used if next button is also displayed] Whether to
         * show a previous button to allow the participant to go to the previous frame
         *
         * @property {Number} showPreviousButton
         */
        showReplayButton: {
            type: 'boolean',
            default: true,
            description: 'Whether to show a replay button (used only if showing Next button)'
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
         * Array of images to display and information about their placement
         *
         * @property {Object[]} images
         *   @param {String} id unique ID for this image
         *   @param {String} src URL of image source. This can be a full
         *     URL, or relative to baseDir (see baseDir).
         *   @param {String} alt alt-text for image in case it doesn't load and for
         *     screen readers
         *   @param {String} left left margin, as percentage of story area width
         *   @param {String} width image width, as percentage of story area width
         *   @param {String} top top margin, as percentage of story area height
         *   @param {String} position one of three presets for position - 'left', 'right', or 'center'. Takes precedence over manual positioning using left/width/top.
         *   @param {Boolean} nonChoiceOption whether this is a static image, NOT an option participants can select (only used if this is a choice frame). Default false.
         *   @param {Number} displayDelayMs how many milliseconds after images can be displayed to display THIS image. Useful if e.g. you'd like to display options first, then a cue image, or vice versa. Must be positive.
         */
        images: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    'id': {
                        type: 'string'
                    },
                    'src': {
                        anyOf: imageAssetOptions
                    },
                    'alt': {
                        type: 'string'
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
                    'position': {
                        type: 'string',
                        enum: ['left', 'center', 'right']
                    },
                    'nonChoiceOption': {
                        type: 'boolean'
                    },
                    'displayDelayMs': {
                        type: 'number',
                        minimum: 0
                    },
                    'correct': {
                        type: 'boolean'
                    },
                    'feedbackAudio': {
                        anyOf: audioAssetOptions
                    }
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
        },

        /**
         * Audio file to play at the start of this frame.
         *
         * @property {Object[]} audio audio sources for this frame.
         *
         * This can either be an array of {src: 'url', type: 'MIMEtype'} objects, e.g.
         * listing equivalent .mp3 and .ogg files, or can be a single string `filename`
         * which will be expanded based on `baseDir` and `audioTypes` values (see `audioTypes`).
         */
        audio: {
            anyOf: audioAssetOptions,
            description: 'Audio to play as this frame begins',
            default: []
        },
        /**
         * Whether this is a frame where the user needs to click to
         * select one of the images before proceeding
         *
         * @property {Boolean} isChoiceFrame
         * @default false
         */
        isChoiceFrame: {
            type: 'boolean',
            description: 'Whether this is a frame where the user needs to click to select one of the images before proceeding'
        },
        /**
         * Whether the participant can select an option before audio finishes
         *
         * @property {Boolean} canMakeChoiceBeforeAudioFinished
         * @default false
         */
        canMakeChoiceBeforeAudioFinished: {
            type: 'boolean',
            description: 'Whether the participant can select an option before audio finishes',
            default: false
        },

    },

    didInsertElement() {
        this._super(...arguments);
        this.set('canMakeChoice', !!this.get('canMakeChoiceBeforeAudioFinished'));
        $('#nextbutton').prop('disabled');
    },

    meta: {
        name: 'ExpLookitImageChoice',
        description: 'General frame to display images and/or audio',
        data: {
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                },
                videoList: {
                    type: 'list'
                },
                /**
                * Array of images used in this frame [same as passed to this frame, but
                * may reflect random assignment for this particular participant]
                * @attribute images
                */
                images: {
                    type: 'array'
                },
                /**
                * ID of image selected at time of proceeding
                * @attribute selectedImage
                */
                selectedImage: {
                    type: 'string'
                }
            },
        }
    },

});
