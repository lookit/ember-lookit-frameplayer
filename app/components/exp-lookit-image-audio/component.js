import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { audioAssetOptions, imageAssetOptions } from '../../mixins/expand-assets';
import { observer } from '@ember/object';

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
 * @class Exp-lookit-image-audio
 * @extends Exp-frame-base
 * @uses Full-screen
 * @uses Video-record
 * @uses Expand-assets
 */

// See https://stackoverflow.com/a/56266358
const isColor = (strColor) => {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
};

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord, ExpandAssets, {
    type: 'exp-lookit-story-page',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player', // which element to send fullscreen
    fsButtonID: 'fsButton', // ID of button to go to fullscreen

    // Track state of experiment
    completedAudio: false,
    completedAttn: false,
    currentSegment: 'intro', // 'calibration', 'test', 'finalaudio' (mutually exclusive)
    previousSegment: 'intro', // used when pausing/unpausing - refers to segment that study was paused during

    currentAudioIndex: -1, // during initial sequential audio, holds an index into audioSources

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    // Don't need to override startRecordingAutomatically as we override the observer
    // whenPossibleToRecord directly.

    pageTimer: null,
    progressTimer: null,
    timerStart: null,
    finishedAllAudio: false,
    minDurationAchieved: false,
    noParentText: false,

    assetsToExpand: {
        'audio': ['audioSources/sources'],
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
            description: 'Whether to do webcam recording (will wait for webcam connection before starting audio if so'
        },
        /**
         * Whether to proceed automatically after audio (and hide
         * replay/next buttons)
         *
         * @property {Boolean} autoProceed
         */
        autoProceed: {
            type: 'boolean',
            description: 'Whether to proceed automatically after audio (and hide replay/next buttons)'
        },

        /**
         * [Only used if autoProceed is true] Minimum duration of frame in seconds.
         * Frame will auto-proceed after this much time has elapsed and all audio
         * has completed.
         *
         * @property {Number} durationSeconds
         */
        durationSeconds: {
            type: 'number',
            description: 'Minimum duration of frame in seconds if autoproceeding'
        },

        /**
         * [Only used if autoProceed is true and durationSeconds set] Whether to
         * show a progress bar based on durationSeconds in the parent text area.
         *
         * @property {Number} showProgressBar
         */
        showProgressBar: {
            type: 'boolean',
            description: 'Whether to show a progress bar based on durationSeconds'
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
         * Array of objects describing audio to play at the start of
         * this frame. Each element describes a separate audio segment.
         *
         * @property {Object[]} audioSources
         *   @param {String} audioId unique string identifying this
         *      audio segment
         *   @param {Object[]} sources Array of {src: 'url', type:
         *      'MIMEtype'} objects with audio sources for this segment
         *
         * Can also give a single string `filename`, which will
         * be expanded out to the appropriate array based on `baseDir`
         * and `audioTypes` values; see `audioTypes`.
         *
         *   @param {Object[]} highlights Array of {'range': [startT,
         *      endT], 'image': 'imageId'} objects, where the imageId
         *      values correspond to the ids given in images
         */
        audioSources: {
            type: 'array',
            description: 'List of objects specifying audio src and type for audio played during test trial',
            default: [],
            items: {
                type: 'object',
                properties: {
                    'audioId': {
                        type: 'string'
                    },
                    'sources': {
                        anyOf: audioAssetOptions
                    },
                    'highlights': {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                'range': {
                                    type: 'array',
                                    items: {
                                        type: 'number'
                                    }
                                },
                                'image': {
                                    'type': 'string'
                                }
                            }
                        }
                    }
                }
            }
        },
        /**
         * Text block to display to parent.  (Each field is optional)
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
        }
    },

    meta: {
        name: 'ExpLookitImageAudio',
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
                }
            },
        }
    },

    // Override to do a bit extra when recording (single-frame)
    whenPossibleToRecord: observer('recorder.hasCamAccess', 'recorderReady', function() {
        if (this.get('doRecording')) {
            var _this = this;
            if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
                this.startRecorder().then(() => {
                    _this.set('currentAudioIndex', -1);
                    _this.send('playNextAudioSegment');
                    _this.set('recorderReady', false);
                    $('#waitForVideo').hide();
                    $('.story-image-container').show();
                });
            }
        }
    }),

    // Override to do a bit extra when starting session recorder
    whenPossibleToRecordSession: observer('sessionRecorder.hasCamAccess', 'sessionRecorderReady', function() {
        if (this.get('startSessionRecording')) {
            var _this = this;
            if (this.get('sessionRecorder.hasCamAccess') && this.get('sessionRecorderReady')) {
                this.startSessionRecorder().then(() => {
                    _this.set('sessionRecorderReady', false);
                    _this.set('currentAudioIndex', -1);
                    _this.send('playNextAudioSegment');
                    $('#waitForVideo').hide();
                    $('.story-image-container').show();
                });
            }
        }
    }),

    actions: {

        // During playing audio
        updateCharacterHighlighting() {

            var thisAudioData = this.get('audioSources')[this.currentAudioIndex];

            if (thisAudioData.highlights) {
                var t = $('#' + thisAudioData.audioId)[0].currentTime;

                $('.story-image-container').removeClass('highlight');

                thisAudioData.highlights.forEach(function (h) {
                    if (t > h.range[0] && t < h.range[1]) {
                        $('#' + h.image).addClass('highlight');
                    }
                });
            }
        },

        replay() {
            // pause any current audio, and set times to 0
            $('audio').each(function() {
                this.pause();
                this.currentTime = 0;
            });
            // reset to index -1 as at start of study
            this.set('currentAudioIndex', -1);
            // restart audio
            this.send('playNextAudioSegment');
        },

        finish() {
            var _this = this;
            /**
             * Trial is complete and attempting to move to next frame; may wait for recording
             * to catch up before proceeding.
             *
             * @event trialComplete
             */
            this.send('setTimeEvent', 'trialComplete');

            if (this.get('doRecording')) {
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

        playNextAudioSegment() {
            this.set('currentAudioIndex', this.get('currentAudioIndex') + 1);
            if (this.currentAudioIndex == 0) { // Starting first audio segment: start timer & progress bar
                if (this.get('durationSeconds')) {
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
                            if (_this.get('finishedAllAudio')) {
                                _this.send('finish');
                            }
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
            if (this.currentAudioIndex < this.get('audioSources').length) {

                $('#' + this.get('audioSources')[this.currentAudioIndex].audioId)[0].play().then(() => {
                    /**
                     * When an audio segment starts playing
                     *
                     * @event startAudioSegment
                     * @param {Number} currentAudioIndex the index of the current audio segment, starting from 0
                     */
                    this.send('setTimeEvent', 'startAudioSegment', {'currentAudioIndex': this.currentAudioIndex});
                });
            } else {
                this.set('finishedAllAudio', true);
                if (this.get('autoProceed') && this.get('minDurationAchieved')) {
                    this.send('finish');
                } else {
                    $('#nextbutton').prop('disabled', false);
                }
            }
        }
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
            if (!image.fill) {

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

        this.send('showFullscreen');
        $('#nextbutton').prop('disabled', true);

        // If not recording, go to audio right away! Otherwise will be triggered when
        // recording starts.
        if (!(this.get('doRecording') || this.get('startSessionRecording'))) {
            this.send('playNextAudioSegment');
        }

    },

    willDestroyElement() {
        window.clearInterval(this.get('pageTimer'));
        window.clearInterval(this.get('progressTimer'));
        this._super(...arguments);
    },

    // Hide story once rendered (as long as story hasn't started yet anyway)
    didRender() {
        if ((this.get('doRecording') || this.get('startSessionRecording')) && this.get('currentAudioIndex') == -1) {
            $('.story-image-container').hide();
        }
    },

    // Supply image IDs if they're missing. This happens BEFORE assignment of
    didReceiveAttrs() {
        this._super(...arguments);
        var N = 1;
        $.each(this.get('images'), function(idx, image) {
            if (!image.hasOwnProperty('id')) {
                image.id = `image_${N}`;
            }
            N++;
        });

    }

});
