import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { audioAssetOptions, imageAssetOptions } from '../../mixins/expand-assets';
import isColor from '../../utils/is-color';

let {
    $
} = Ember;


/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Frame to display image(s) and play audio, with optional video recording. Options allow
 * customization for looking time, storybook, forced choice, and reaction time type trials,
 * including training versions where children (or parents) get feedback about their responses.
 *
 * This can be used in a variety of ways - for example:
 *
 * - Display an image for a set amount of time and measure looking time
 *
 * - Display two images for a set amount of time and play audio for a
 * looking-while-listening paradigm
 *
 * - Show a "storybook page" where you show images and play audio, having the parent/child
 * press 'Next' to proceed. If desired,
 * images can appear and be highlighted at specific times
 * relative to audio. E.g., the audio might say "This [image of Remy appears] is a boy
 * named Remy. Remy has a little sister [image of Zenna appears] named Zenna.
 * [Remy highlighted] Remy's favorite food is brussel sprouts, but [Zenna highlighted]
 * Zenna's favorite food is ice cream. [Remy and Zenna both highlighted] Remy and Zenna
 * both love tacos!"
 *
 * - Play audio asking the child to choose between two images by pointing or answering
 * verbally. Show text for the parent about how to help and when to press Next.
 *
 * - Play audio asking the child to choose between two images, and require one of those
 * images to be clicked to proceed (see "choiceRequired" option).
 *
 * - Measure reaction time as the child is asked to choose a particular option on each trial
 * (e.g., a central cue image is shown first, then two options at a short delay; the child
 * clicks on the one that matches the cue in some way)
 *
 * - Provide audio and/or text feedback on the child's (or parent's) choice before proceeding,
 * either just to make the study a bit more interactive ("Great job, you chose the color BLUE!")
 * or for initial training/familiarization to make sure they understand the task. Some
 * images can be marked as the "correct" answer and a correct answer required to proceed.
 * If you'd like to include some initial training questions before your test questions,
 * this is a great way to do it.
 *
 * In general, the images are displayed in a designated region of the screen with aspect
 * ratio 7:4 (1.75 times as wide as it is tall) to standardize display as much as possible
 * across different monitors. If you want to display things truly fullscreen, you can
 * use `autoProceed` and not provide `parentText` so there's nothing at the bottom, and then
 * set `maximizeDisplay` to true.
 *
 * Webcam recording may be turned on or off; if on, stimuli are not displayed and audio is
 * not started until recording begins. (Using the frame-specific `isRecording` property
 * is good if you have a smallish number of test trials and prefer to have separate video
 * clips for each. For reaction time trials or many short trials, you will likely want
 * to use session recording instead - i.e. start the session recording before the first trial
 * and end on the last trial - to avoid the short delays related to starting/stopping the video.)
 *
 * This frame is displayed fullscreen, but is not paused or otherwise disabled if the
 * user leaves fullscreen. A button appears prompting the user to return to
 * fullscreen mode.
 *
 * Any number of images may be placed on the screen, and their position
 * specified. (Aspect ratio will be the same as the original image.)
 *
 * The examples below show a variety of usages, corresponding to those shown in the video.
 *
 * image-1: Single image displayed full-screen, maximizing area on monitor, for 8 seconds.
 *
 * image-2: Single image displayed at specified position, with 'next' button to move on
 *
 * image-3: Image plus audio, auto-proceeding after audio completes and 4 seconds go by
 *
 * image-4: Image plus audio, with 'next' button to move on
 *
 * image-5: Two images plus audio question asking child to point to one of the images,
 *   demonstrating different timing of image display & highlighting of images during audio
 *
 * image-6: Three images with audio prompt, family has to click one of two to continue
 *
 * image-7: Three images with audio prompt, family has to click correct one to continue -
 *   audio feedback on incorrect answer
 *
 * image-8: Three images with audio prompt, family has to click correct one to continue -
 *   text feedback on incorrect answer
 *
 *

```json
 "frames": {
    "image-1": {
        "kind": "exp-lookit-images-audio",
        "images": [
            {
                "id": "cats",
                "src": "two_cats.png",
                "position": "fill"
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "autoProceed": true,
        "doRecording": true,
        "durationSeconds": 8,
        "maximizeDisplay": true
    },
    "image-2": {
        "kind": "exp-lookit-images-audio",
        "images": [
            {
                "id": "cats",
                "src": "three_cats.JPG",
                "top": 10,
                "left": 30,
                "width": 40
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "autoProceed": false,
        "doRecording": true,
        "parentTextBlock": {
            "text": "Some explanatory text for parents",
            "title": "For parents"
        }
    },
    "image-3": {
        "kind": "exp-lookit-images-audio",
        "audio": "wheresremy",
        "images": [
            {
                "id": "remy",
                "src": "wheres_remy.jpg",
                "position": "fill"
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "audioTypes": [
            "mp3",
            "ogg"
        ],
        "autoProceed": true,
        "doRecording": false,
        "durationSeconds": 4,
        "parentTextBlock": {
            "text": "Some explanatory text for parents",
            "title": "For parents"
        },
        "showProgressBar": true
    },
    "image-4": {
        "kind": "exp-lookit-images-audio",
        "audio": "peekaboo",
        "images": [
            {
                "id": "remy",
                "src": "peekaboo_remy.jpg",
                "position": "fill"
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "audioTypes": [
            "mp3",
            "ogg"
        ],
        "autoProceed": false,
        "doRecording": false,
        "parentTextBlock": {
            "text": "Some explanatory text for parents",
            "title": "For parents"
        }
    },
    "image-5": {
        "kind": "exp-lookit-images-audio",
        "audio": "remyzennaintro",
        "images": [
            {
                "id": "remy",
                "src": "scared_remy.jpg",
                "position": "left"
            },
            {
                "id": "zenna",
                "src": "love_zenna.jpg",
                "position": "right",
                "displayDelayMs": 1500
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "highlights": [
            {
                "range": [
                    0,
                    1.5
                ],
                "imageId": "remy"
            },
            {
                "range": [
                    1.5,
                    3
                ],
                "imageId": "zenna"
            }
        ],
        "autoProceed": false,
        "doRecording": true,
        "parentTextBlock": {
            "text": "Some explanatory text for parents",
            "title": "For parents"
        }
    },
    "image-6": {
        "kind": "exp-lookit-images-audio",
        "audio": "matchremy",
        "images": [
            {
                "id": "cue",
                "src": "happy_remy.jpg",
                "position": "center",
                "nonChoiceOption": true
            },
            {
                "id": "option1",
                "src": "happy_zenna.jpg",
                "position": "left",
                "displayDelayMs": 2000
            },
            {
                "id": "option2",
                "src": "annoyed_zenna.jpg",
                "position": "right",
                "displayDelayMs": 2000
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "autoProceed": false,
        "doRecording": true,
        "choiceRequired": true,
        "parentTextBlock": {
            "text": "Some explanatory text for parents",
            "title": "For parents"
        },
        "canMakeChoiceBeforeAudioFinished": true
    },
    "image-7": {
        "kind": "exp-lookit-images-audio",
        "audio": "matchzenna",
        "images": [
            {
                "id": "cue",
                "src": "sad_zenna.jpg",
                "position": "center",
                "nonChoiceOption": true
            },
            {
                "id": "option1",
                "src": "surprised_remy.jpg",
                "position": "left",
                "feedbackAudio": "negativefeedback",
                "displayDelayMs": 3500
            },
            {
                "id": "option2",
                "src": "sad_remy.jpg",
                "correct": true,
                "position": "right",
                "displayDelayMs": 3500
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "autoProceed": false,
        "doRecording": true,
        "choiceRequired": true,
        "parentTextBlock": {
            "text": "Some explanatory text for parents",
            "title": "For parents"
        },
        "correctChoiceRequired": true,
        "canMakeChoiceBeforeAudioFinished": false
    },
    "image-8": {
        "kind": "exp-lookit-images-audio",
        "audio": "matchzenna",
        "images": [
            {
                "id": "cue",
                "src": "sad_zenna.jpg",
                "position": "center",
                "nonChoiceOption": true
            },
            {
                "id": "option1",
                "src": "surprised_remy.jpg",
                "position": "left",
                "feedbackText": "Try again! Remy looks surprised in that picture. Can you find the picture where he looks sad, like Zenna?",
                "displayDelayMs": 3500
            },
            {
                "id": "option2",
                "src": "sad_remy.jpg",
                "correct": true,
                "position": "right",
                "feedbackText": "Great job! Remy is sad in that picture, just like Zenna is sad.",
                "displayDelayMs": 3500
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "autoProceed": false,
        "doRecording": true,
        "choiceRequired": true,
        "parentTextBlock": {
            "text": "Some explanatory text for parents",
            "title": "For parents"
        },
        "correctChoiceRequired": true,
        "canMakeChoiceBeforeAudioFinished": false
    }
 }

 * ```
 * @class Exp-lookit-images-audio
 * @extends Exp-frame-base
 * @uses Full-screen
 * @uses Video-record
 * @uses Expand-assets
 */


export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord, ExpandAssets, {

    type: 'exp-lookit-images-audio',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player', // which element to send fullscreen
    fsButtonID: 'fsButton', // ID of button to go to fullscreen

    startedTrial: false, // whether we've started playing audio yet
    _finishing: false, // whether we're currently trying to move to next trial (to prevent overlapping calls)

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    pageTimer: null,
    progressTimer: null,
    nextButtonDisableTimer: null,
    showChoiceTimer: null,
    imageDisplayTimers: null,

    autoProceed: false,
    finishedAllAudio: false,
    minDurationAchieved: false,

    choiceRequired: false,
    correctChoiceRequired: false,
    correctImageSelected: false,
    canMakeChoice: true,
    showingFeedbackDialog: false,
    selectedImage: null,

    noParentText: false,

    assetsToExpand: {
        'audio': ['audio', 'images/feedbackAudio'],
        'video': [],
        'image': ['images/src']
    },

    frameSchemaProperties: {
        /**
         * Whether to do webcam recording (will wait for webcam
         * connection before starting audio or showing images if so)
         *
         * @property {Boolean} doRecording
         */
        doRecording: {
            type: 'boolean',
            description: 'Whether to do webcam recording (will wait for webcam connection before starting audio if so'
        },

        /**
         * Whether to proceed automatically when all conditions are met, vs. enabling
         * next button at that point. If true: the next, previous, and replay buttons are
         * hidden, and the frame auto-advances after ALL of the following happen
         * (a) the audio segment (if any) completes
         * (b) the durationSeconds (if any) is achieved
         * (c) a choice is made (if required)
         * (d) that choice is correct (if required)
         * (e) the choice audio (if any) completes
         * (f) the choice text (if any) is dismissed
         * If false: the next, previous, and replay buttons (as applicable) are displayed.
         * It becomes possible to press 'next' only once the conditions above are met.
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
         * Minimum duration of frame in seconds. If set, then it will only
         * be possible to proceed to the next frame after both the audio completes AND
         * this duration is acheived.
         *
         * @property {Number} durationSeconds
         * @default 0
         */
        durationSeconds: {
            type: 'number',
            description: 'Minimum duration of frame in seconds',
            minimum: 0,
            default: 0
        },

        /**
         * [Only used if durationSeconds set] Whether to
         * show a progress bar based on durationSeconds in the parent text area.
         *
         * @property {Boolean} showProgressBar
         * @default false
         */
        showProgressBar: {
            type: 'boolean',
            description: 'Whether to show a progress bar based on durationSeconds',
            default: false
        },

        /**
         * [Only used if not autoProceed] Whether to
         * show a previous button to allow the participant to go to the previous frame
         *
         * @property {Boolean} showPreviousButton
         * @default true
         */
        showPreviousButton: {
            type: 'boolean',
            default: true,
            description: 'Whether to show a previous button (used only if showing Next button)'
        },

        /**
         * [Only used if not autoProceed AND if there is audio] Whether to
         * show a replay button to allow the participant to replay the audio
         *
         * @property {Boolean} showReplayButton
         * @default false
         */
        showReplayButton: {
            type: 'boolean',
            default: true,
            description: 'Whether to show a replay button (used only if showing Next button)'
        },

        /**
         * Whether to have the image display area take up the whole screen if possible.
         * This will only apply if (a) there is no parent text and (b) there are no
         * control buttons (next, previous, replay) because the frame auto-proceeds.
         *
         * @property {Boolean} maximizeDisplay
         * @default false
         */
        maximizeDisplay: {
            type: 'boolean',
            default: false,
            description: 'Whether to have the image display area take up the whole screen if possible'
        },

        /**
         * Audio file to play at the start of this frame.
         * This can either be an array of {src: 'url', type: 'MIMEtype'} objects, e.g.
         * listing equivalent .mp3 and .ogg files, or can be a single string `filename`
         * which will be expanded based on `baseDir` and `audioTypes` values (see `audioTypes`).
         *
         * @property {Object[]} audio
         * @default []
         *
         */
        audio: {
            anyOf: audioAssetOptions,
            description: 'Audio to play as this frame begins',
            default: []
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
        },
        /**
         * Array of images to display and information about their placement. For each
         * image, you need to specify `src` (image name/URL) and placement (either by
         * providing left/width/top values, or by using a `position` preset).
         *
         * Everything else is optional! This is where you would say that an image should
         * be shown at a delay
         *
         * @property {Object[]} images
         *   @param {String} id unique ID for this image
         *   @param {String} src URL of image source. This can be a full
         *     URL, or relative to baseDir (see baseDir).
         *   @param {String} alt alt-text for image in case it doesn't load and for
         *     screen readers
         *   @param {Number} left left margin, as percentage of story area width. If not provided,
         *     the image is centered horizontally.
         *   @param {Number} width image width, as percentage of story area width. Note:
         *     in general only provide one of width and height; the other will be adjusted to
         *     preserve the image aspect ratio.
         *   @param {Number} top top margin, as percentage of story area height. If not provided,
         *     the image is centered vertically.
         *   @param {Number} height image height, as percentage of story area height. Note:
         *     in general only provide one of width and height; the other will be adjusted to
         *     preserve the image aspect ratio.
         *   @param {String} position one of 'left', 'center', 'right', 'fill' to use presets
         *     that place the image in approximately the left, center, or right third of
         *     the screen or to fill the screen as much as possible.
         *     This overrides left/width/top values if given.
         *   @param {Boolean} nonChoiceOption [Only used if `choiceRequired` is true]
         *     whether this should be treated as a non-clickable option (e.g., this is
         *     a picture of a girl, and the child needs to choose whether the girl has a
         *     DOG or a CAT)
         *   @param {Number} displayDelayMs Delay at which to show the image after trial
         *     start (timing will be relative to any audio or to start of trial if no
         *     audio). Optional; default is to show images immediately.
         *   @param {Object[]} feedbackAudio [Only used if `choiceRequired` is true]
         *      Audio to play upon clicking this image. This can either be an array of
         *     {src: 'url', type: 'MIMEtype'} objects, e.g. listing equivalent .mp3 and
         *     .ogg files, or can be a single string `filename` which will be expanded
         *     based on `baseDir` and `audioTypes` values (see `audioTypes`).
         *   @param {String} feedbackText [Only used if `choiceRequired` is true] Text
         *     to display in a dialogue window upon clicking the image.
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
                        enum: ['left', 'center', 'right', 'fill']
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
                    },
                    'feedbackText': {
                        type: 'string'
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
         * Whether this is a frame where the user needs to click to select one of the
         * images before proceeding.
         *
         * @property {Boolean} choiceRequired
         * @default false
         */
        choiceRequired: {
            type: 'boolean',
            description: 'Whether this is a frame where the user needs to click to select one of the images before proceeding',
            default: false
        },
        /**
         * [Only used if `choiceRequired` is true] Whether the participant has to select
         * one of the *correct* images before proceeding.
         *
         * @property {Boolean} correctChoiceRequired
         * @default false
         */
        correctChoiceRequired: {
            type: 'boolean',
            description: 'Whether this is a frame where the user needs to click a correct image before proceeding',
            default: false
        },
        /**
         * Whether the participant can make a choice before audio finishes. (Only relevant
         * if `choiceRequired` is true.)
         *
         * @property {Boolean} canMakeChoiceBeforeAudioFinished
         * @default false
         */
        canMakeChoiceBeforeAudioFinished: {
            type: 'boolean',
            description: 'Whether the participant can select an option before audio finishes',
            default: false
        },
        /**
         * Array representing times when particular images should be highlighted. Each
         * element of the array should be of the form {'range': [3.64, 7.83], 'imageId': 'myImageId'}.
         * The two `range` values are the start and end times of the highlight in seconds,
         * relative to the audio played. The `imageId` corresponds to the `id` of an
         * element of `images`.
         *
         * Highlights can overlap in time. Any that go longer than the audio will just
         * be ignored/cut off.
         *
         * One strategy for generating a bunch of highlights for a longer story is to
         * annotate using Audacity and export the labels to get the range values.
         *
         * @property {Object[]} highlights
         *   @param {Array} range [startTimeInSeconds, endTimeInSeconds], e.g. [3.64, 7.83]
         *   @param {String} imageId ID of the image to highlight, corresponding to the `id` field of the element of `images` to highlight
         */
        highlights: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    'range': {
                        type: 'array',
                        items: {
                            type: 'number',
                            minimum: 0
                        }
                    },
                    'imageId': {
                        'type': 'string'
                    }
                }
            },
            default: []
        }
    },

    meta: {
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
                },
                /**
                * Whether image selected at time of proceeding is marked as correct
                * @attribute correctImageSelected
                */
                correctImageSelected: {
                    type: 'string'
                }
            },
        }
    },

    // Override to do a bit extra when starting recording
    onRecordingStarted() {
        this.startTrial();
    },

    // Override to do a bit extra when starting session recorder
    onSessionRecordingStarted() {
        this.startTrial();
        $('#waitForVideo').hide();
    },

    updateCharacterHighlighting() {

        var highlights = this.get('highlights');

        if (highlights.length) {
            var t = $('#player-audio')[0].currentTime;
            $('.story-image-container img.story-image').removeClass('narration-highlight');
            // var _this = this;
            highlights.forEach(function (h) {
                if (t > h.range[0] && t < h.range[1]) {
                    var $element = $('#' + h.imageId + ' img.story-image')
                    $element.addClass('narration-highlight');
                    // _this.wiggle($element);
                }
            });
        }
    },

    // Move an image up and down until the isSpeaking class is removed.
    // Yes, this could much more naturally be done by using a CSS animation property
    // on isSpeaking, but despite animations getting applied properly to the element,
    // I haven't been able to get that working - because of the possibility of ember-
    // specific problems here, I'm going with something that *works* even if it's less
    // elegent.
    //     wiggle($element) {
    //         var _this = this;
    //         var $parent = $element.parent();
    //         if ($element.hasClass('narration-highlight')) {
    //             $parent.animate({'margin-bottom': '.1%', 'margin-top': '-.1%'}, 150, function() {
    //                 if ($element.hasClass('narration-highlight')) {
    //                     $parent.animate({'margin-bottom': '0%', 'margin-top': '0%'}, 150, function() {
    //                         _this.wiggle($element);
    //                     });
    //                 }
    //             });
    //         }
    //     },

    replay() {
        // pause any current audio, and set times to 0
        $('audio').each(function() {
            this.pause();
            this.currentTime = 0;
        });
        /**
         * When main audio segment is replayed
         *
         * @event replayAudio
         */
        this.send('setTimeEvent', 'replayAudio');
        // restart audio
        $(`.story-image-container`).hide();
        this.showImages();
        this.playAudio();
    },

    finish() {
        if (!this.get('_finishing')) {
            this.set('_finishing', true);
            var _this = this;
            /**
             * Trial is complete and attempting to move to next frame; may wait for recording
             * to catch up before proceeding.
             *
             * @event trialComplete
             */
            this.send('setTimeEvent', 'trialComplete');
            if (this.get('doRecording')) {
                $('#nextbutton').text('Sending recording...');
                $('#nextbutton').prop('disabled', true);
                this.set('nextButtonDisableTimer', window.setTimeout(function () {
                    $('#nextbutton').prop('disabled', false);
                }, 5000));

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

    finishedAudio() {
        /**
         * When main audio segment finishes playing
         *
         * @event finishAudio
         */
        this.send('setTimeEvent', 'finishAudio');
        this.set('finishedAllAudio', true);
        this.set('canMakeChoice', true);
        this.checkAndEnableProceed();
    },

    checkAndEnableProceed() {
        let ready = this.get('minDurationAchieved') &&
                    this.get('finishedAllAudio') &&
                    !this.get('showingFeedbackDialog') &&
                    (!this.get('choiceRequired') || (this.get('selectedImage') && (this.get('correctImageSelected') || !this.get('correctChoiceRequired'))));
        if (ready) {
            this.readyToFinish();
        }
        return ready;
    },

    readyToFinish() {
        if (this.get('autoProceed')) {
            this.send('finish');
        } else {
            $('#nextbutton').prop('disabled', false);
        }
    },

    startTrial() {
        this.set('startedTrial', true);
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
                _this.checkAndEnableProceed();
            }, _this.get('durationSeconds') * 1000));
            if (this.get('showProgressBar')) {
                let timerStart = new Date().getTime();
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

        this.playAudio();
        this.showImages();
    },

    playAudio() {
        // Start audio if there is any
        var _this = this;
        if ($('#player-audio source').length) {
            $('#player-audio')[0].play().then(() => {
                /**
                 * When main audio segment starts playing
                 *
                 * @event startAudio
                 */
                _this.send('setTimeEvent', 'startAudio');
            }, () => {
                /**
                 * When main audio cannot be started. In this case we treat it as if
                 * the audio was completed (for purposes of allowing participant to
                 * proceed)
                 *
                 * @event failedToStartAudio
                 */
                _this.send('setTimeEvent', 'failedToStartAudio');
                _this.finishedAudio();
            });
        } else { // Otherwise treat as if completed
            this.finishedAudio();
        }
    },

    showImages() {
        /**
         * When images are displayed to participant (for images without any delay added)
         *
         * @event displayAllImages
         */
        this.send('setTimeEvent', 'displayImages');
        var _this = this;
        $.each(this.get('images_parsed'), function(idx, image) {
            if (image.hasOwnProperty('displayDelayMs')) {
                var thisTimeout = window.setTimeout(function() {
                    /**
                     * When a specific image is shown at a delay.
                     *
                     * @event displayImage
                     * @param {String} imageId
                     */
                    _this.send('setTimeEvent', 'displayImage', {
                        imageId: image.id
                    });
                    $(`.story-image-container#${image.id}`).show();
                }, image.displayDelayMs);
                if (_this.get('imageDisplayTimers')) {
                    _this.get('imageDisplayTimers').push(thisTimeout);
                } else {
                    _this.set('imageDisplayTimers', [thisTimeout]);
                }
            } else {
                $(`.story-image-container#${image.id}`).show();
            }
        });
    },

    clickImage(imageId, nonChoiceOption, correct, feedbackText) {
        // If this is a choice frame and a valid choice and we're allowed to make a choice yet...
        if (this.get('choiceRequired') && !nonChoiceOption && this.get('canMakeChoice') && !this.get('showingFeedbackDialog')) {
            this.set('finishedAllAudio', true); // Treat as if audio is finished in case making choice before audio finishes - otherwise we never satisfy that criterion
            /**
             * When one of the image options is clicked during a choice frame
             *
             * @event clickImage
             * @param {String} imageId ID of the image selected
             * @param {Boolean} correct whether this image is marked as correct
             */
            this.send('setTimeEvent', 'clickImage', {
                imageId: imageId,
                correct: correct
            });

            // Highlight the selected image and store it
            $('.story-image-container img').removeClass('highlight');
            $('#' + imageId + ' img').addClass('highlight');
            this.set('selectedImage', imageId);
            this.set('correctImageSelected', correct);

            if (this.get('correctChoiceRequired') && !correct) {
                $('#nextbutton').prop('disabled', true);
            }

            var noFeedback = true; // Track whether we're giving some form of feedback
            // vs. allowing immediate proceeding

            var _this = this;
            // Play any feedback audio if available
            if ($(`#${imageId}.story-image-container audio source`).length) {
                noFeedback = false;
                // If there's audio associated with this choice,
                $('audio').each(function() { // pause any other audio
                    this.pause();
                    this.currentTime = 0;
                });
                $(`#${imageId}.story-image-container audio`)[0].play().then(() => {
                    /**
                     * When image/feedback audio is started
                     *
                     * @event startImageAudio
                     * @param {String} imageId
                     */
                    _this.send('setTimeEvent', 'startImageAudio', {
                        imageId: imageId
                    });
                }, () => {
                    /**
                     * When image/feedback audio cannot be started. In this case we treat it as if
                     * the audio was completed (for purposes of allowing participant to
                     * proceed)
                     *
                     * @event failedToStartImageAudio
                     * @param {String} imageId
                     */
                    _this.send('setTimeEvent', 'failedToStartImageAudio', {
                        imageId: imageId
                    });
                    _this.endFeedbackAudio(imageId, correct);
                });
            }

            // Also display any feedback text if available
            if (feedbackText) {
                noFeedback = false;
                this.set('showingFeedbackDialog', true);
                $(`.${imageId}.modal`).show();
            }

            // If we're giving feedback (audio or text), it will be possible to proceed
            // once any audio finishes and any text is dismissed. Otherwise, just ensure
            // that if we're moving on, the answer gets highlighted long enough for
            // the participant to see it!
            if (noFeedback) {
                this.set('showChoiceTimer', window.setTimeout(function() {
                    window.clearInterval(_this.get('showChoiceTimer'));
                    _this.checkAndEnableProceed();
                }, 150));
            }

        }
    },

    endFeedbackAudio(imageId, correct) {  // eslint-disable-line no-unused-vars
        this.checkAndEnableProceed(); // if correct, move on
    },

    actions: {

        // During playing audio
        updateCharacterHighlighting() {
            this.updateCharacterHighlighting();
        },

        replay() {
            this.replay();
        },

        finish() {
            this.finish();
        },

        finishedAudio() {
            this.finishedAudio();
        },

        clickImage(imageId, nonChoiceOption, correct, feedbackText) {
            this.clickImage(imageId, nonChoiceOption, correct, feedbackText);
        },

        endFeedbackAudio(imageId, correct) {
            this.endFeedbackAudio(imageId, correct);
        },

        hideFeedbackDialog(imageId) {
            $(`.${imageId}.modal`).hide();
            this.set('showingFeedbackDialog', false);
            /**
             * When the participant dismisses a feedback dialogue
             *
             * @event dismissFeedback
             * @param {String} imageId
             */
            this.send('setTimeEvent', 'dismissFeedback', {
                imageId: imageId
            });
            this.checkAndEnableProceed();
        }
    },

    // Supply image IDs if they're missing.
    didReceiveAttrs() {
        this._super(...arguments);
        var N = 1;
        var allImageIds =  this.get('images') ? this.get('images').map(im => im.hasOwnProperty('id') ? im.id : null) : [];
        $.each(this.get('images'), function(idx, image) {
            if (!image.hasOwnProperty('id')) {
                while (allImageIds.includes(`image_${N}`)) {
                    N++;
                }
                image.id = `image_${N}`;
            }
            N++;
        });

        this.set('canMakeChoice', !!this.get('canMakeChoiceBeforeAudioFinished'));
        this.set('minDurationAchieved', !(this.get('durationSeconds') > 0));
        this.set('showProgressBar', this.get('showProgressBar') && this.get('durationSeconds') > 0);
        this.set('showReplayButton', this.get('showReplayButton') && this.get('audio').length);
    },

    didInsertElement() {

        this._super(...arguments);

        // Apply user-provided CSS to parent text block
        if (Object.keys(this.get('parentTextBlock')).length) {
            var parentTextBlock = this.get('parentTextBlock') || {};
            var css = parentTextBlock.css || {};
            $('#parenttext').css(css);
        } else {
            this.set('noParentText', true);
            if (this.get('autoProceed')) {
                this.set('noStoryControls', true);
            }
        }

        // Apply user-provided CSS to images
        $.each(this.get('images_parsed'), function(idx, image) {
            if (!image.position) {
                $('#' + image.id).css({'left': `${image.left}%`, 'width': `${image.width}%`, 'top': `${image.top}%`, 'height': `${image.height}%`});
            }
        });

        // Apply background colors
        if (isColor(this.get('backgroundColor'))) {
            $('div.exp-lookit-image-audio').css('background-color', this.get('backgroundColor'));
        } else {
            console.warn('Invalid background color provided; not applying.');
        }

        if (isColor(this.get('pageColor'))) {
            $('div.exp-lookit-image-audio div#image-area').css('background-color', this.get('pageColor'));
        } else {
            console.warn('Invalid page color provided; not applying.');
        }

        $('#nextbutton').prop('disabled', true);
        this.checkAndEnableProceed();
    },

    // Once rendered, hide images and (if not recording) begin trial
    didRender() {
        if (!this.get('startedTrial')) { // don't re-hide/re-start upon e.g. rerender
            $('.story-image-container').hide();
            // If recording, trial will be started upon recording start. Otherwise...
            if (!this.get('doRecording') && !this.get('startSessionRecording')) {
                this.startTrial();
            }
        }
    },

    willDestroyElement() {
        // Clear any timers that might be active
        window.clearInterval(this.get('pageTimer'));
        window.clearInterval(this.get('progressTimer'));
        window.clearInterval(this.get('nextButtonDisableTimer'));
        window.clearInterval(this.get('showChoiceTimer'));
        $.each(this.get('imageDisplayTimers'), function(idx, timeout) {
            window.clearInterval(timeout);
        });

        this._super(...arguments);
    },


});
