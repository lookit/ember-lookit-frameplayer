import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { observer } from '@ember/object';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Frame to implement a storybook page with dialogue spoken by characters.
 * First, characters appear and any main narration audio is played.
 * Next, the user can click on the characters to play additional audio
 * associated with each character image, or (for a choice trial) the user clicks
 * one of the images to select it as an answer. Once main narration audio has
 * been played and either a selection has been made (for a choice trial,
 * isChoiceFrame: true) or all
 * required character audio has been played (for a non-choice trial), the user
 * can proceed by pressing 'next'. (A trial with only main narration audio can
 * also simply auto-proceed when audio is finished.)
 *
 * Recording is optional. If webcam recording is conducted (doRecording: true)
 * then audio does not start until recording does, to ensure the entire trial
 * is recorded.
 *
 * The character images are specified in 'images', including an image source,
 * positioning on the screen, any animation at the start of the trial, any
 * associated audio, and whether that audio is required.
 *
 * This frame is displayed fullscreen; if the frame before it is not, that frame
 * needs to include a manual "next" button so that there's a user interaction
 * event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
 * without a user event.)
 *
 * The examples below show a few expected uses of this frame. In phase-2,
 * two characters are shown; the protagonist is already present, and speaker1
 * flies in from the left. Speaker1 has associated audio (dialogue). After
 * the narrative audio, the user can click on speaker1 to play the audio, and
 * will then be able to proceed.
 *
 * phase-5 is a choice trial, where the user has to click on one of the two
 * images before proceeding.

```json
 "frames": {
        "phase-2": {
            "kind": "exp-lookit-dialogue-page",
            "baseDir": "https://s3.amazonaws.com/lookitcontents/politeness/",
            "audioTypes": ["mp3", "ogg"],
            "backgroundImage": "order1_test1_background.png",
            "doRecording": false,
            "autoProceed": false,
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
                    "id": "protagonist",
                    "src": "order1_test1_listener1.png",
                    "left": "40",
                    "bottom": "2",
                    "height": "60"
                },
                {
                    "id": "speaker1",
                    "text": "Click to hear what he said!",
                    "src": "order1_test1_speaker1.png",
                    "left": "20",
                    "bottom": "2",
                    "height": "60",
                    "animate": "flyleft",
                    "requireAudio": true,
                    "imageAudio": "polcon_example_2_2speaker1polite"
                }
            ],
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": "polcon_example_2_1intro"
                }
            ]
        },
        "phase-5": {
            "kind": "exp-lookit-dialogue-page",
            "baseDir": "https://s3.amazonaws.com/lookitcontents/politeness/",
            "audioTypes": ["mp3", "ogg"],
            "backgroundImage": "order1_test1_background.png",
            "doRecording": false,
            "autoProceed": false,
            "isChoiceFrame": true,
            "parentTextBlock": {
                "title": "Parents:",
                "text": "click on the character your child selects.",
                "emph": true
            },
            "images": [
                {
                    "id": "speaker1",
                    "src": "order1_test1_speaker1.png",
                    "left": "20",
                    "bottom": "2",
                    "height": "60"
                },
                {
                    "id": "speaker2",
                    "src": "order1_test1_speaker2.png",
                    "left": "60",
                    "bottom": "2",
                    "height": "60"
                }
            ],
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": "polcon_example_5q1"
                }
            ]
        }
 }

 * ```
 * @class ExpLookitDialoguePage
 * @extends ExpFrameBase
 * @uses FullScreen
 * @uses ExpandAssets
 * @uses VideoRecord
 */

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord, ExpandAssets, {
    type: 'exp-lookit-dialogue-page',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    // Don't need to override startRecordingAutomatically as we override the observer
    // whenPossibleToRecord directly.

    // Track state of experiment
    completedAudio: false, // for main narration audio
    imageAudioPlayed: new Set(),
    currentlyHighlighted: null, // id for image currently selected

    currentAudioIndex: -1, // during initial sequential audio, holds an index into audioSources

    assetsToExpand: {
        'audio': ['audioSources/sources', 'images/imageAudio'],
        'video': [],
        'image': ['images/src', 'backgroundImage']
    },

    // Can the user click the 'next' button yet? Require all 'main' audio to
    // have played. For a choice frame, require that one of the images is
    // selected; for other frames, require that any required image-audio has
    // completed.
    readyToProceed: Ember.computed('completedAudio', 'imageAudioPlayed', 'currentlyHighlighted',
        function() {
            var okayToProceed = this.get('completedAudio');

            if (this.get('isChoiceFrame') && !(this.get('currentlyHighlighted'))) {
                okayToProceed = false;
            } else {
                var whichAudioCompleted = this.get('imageAudioPlayed');
                this.get('images').forEach(function (im) {
                    if (im.requireAudio && !(whichAudioCompleted.has(im.id))) {
                        okayToProceed = false;
                    }
                });
            }
            return okayToProceed;
        }),

    // Override to do a bit extra when starting recording
    whenPossibleToRecord: observer('recorder.hasCamAccess', 'recorderReady', function() {
        var _this = this;
        if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
            this.startRecorder().then(() => {
                _this.set('recorderReady', false);
                $('#waitForVideo').hide();
                _this.set('currentAudioIndex', -1);
                _this.send('playNextAudioSegment');
            });
        }
    }),

    meta: {
        name: 'ExpLookitDialoguePage',
        description: 'Frame for a storybook page with dialogue spoken by characters',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Phase number (just included as a convenience & sent to server, to make handling collected data simpler)
                 *
                 * @property {Number} nPhase
                 * @default 0
                 */
                nPhase: {
                    type: 'number',
                    description: 'Phase number',
                    default: 0
                },
                /**
                 * Trial number (just included as a convenience & sent to server, to make handling collected data simpler)
                 *
                 * @property {Number} nTrial
                 * @default 0
                 */
                nTrial: {
                    type: 'number',
                    description: 'Trial number',
                    default: 0
                },
                /**
                 * URL of background image; will be stretched to width of page
                 *
                 * @property {String} backgroundImage
                 */
                backgroundImage: {
                    type: 'string',
                    description: 'URL of background image; will be stretched to width of page'
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
                 * Array of objects describing audio to play at the start of
                 * this frame. Each element describes a separate audio segment.
                 *
                 * @property {Object[]} audioSources
                 *   @param {String} audioId unique string identifying this
                 *      audio segment
                 *   @param {Object[]} sources Array of {src: 'url', type:
                 *      'MIMEtype'} objects with audio sources for this segment.
                 *
                 * Can also give a single string 'filename', which will
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
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        'src': {
                                            type: 'string'
                                        },
                                        'type': {
                                            type: 'string'
                                        }
                                    }
                                }
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
                 * Text block to display to parent. (Each field is optional)
                 *
                 * @property {Object} parentTextBlock
                 *   @param {String} title title to display
                 *   @param {String} text paragraph of text
                 *   @param {Boolean} emph whether to bold this paragraph
                 *   @param {Object} css object specifying any css properties
                 *      to apply to this section, and their values - e.g.
                 *      {'color': 'red', 'font-size': '12px'}.
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
                    default: []
                },
                /**
                 * Array of images to display and information about their placement
                 *
                 * @property {Object[]} images
                 *   @param {String} id unique ID for this image. This will be used to refer to the choice made by the user, if any.
                 *   @param {String} src URL of image source (can be full URL, or stub to append to baseDir; see `baseDir`)
                 *   @param {String} left distance from left of story area to image center, as percentage of story area width
                 *   @param {String} height image height, as percentage of story area height
                 *   @param {String} bottom bottom margin, as percentage of story area height
                 *   @param {String} animate animation to use at start of trial on this image, if any. If not provided, image is shown throughout trial. Options are 'fadein', 'fadeout', 'flyleft' (fly from left), and 'flyright'.
                 *   @param {String} text text to display above image, e.g. 'Click to hear what he said!' If omitted, no text is shown.
                 *   @param {Object[]} imageAudio sources Array of {src: 'url',
                 * type: 'MIMEtype'} objects with audio sources for audio to play when this image is clicked, if any. (Omit to not associate audio with this image.)
                 *
                 * Can also give a single string `filename`, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 *   @param {Boolean} requireAudio whether to require the user to click this image and complete the audio associated before proceeding to the next trial. (Incompatible with autoProceed.)
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
                                type: 'string'
                            },
                            'left': {
                                type: 'string'
                            },
                            'height': {
                                type: 'string'
                            },
                            'bottom': {
                                type: 'string'
                            },
                            'animate': {
                                type: 'string'
                            },
                            'text': {
                                type: 'string'
                            },
                            'imageAudio': {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        'src': {
                                            type: 'string'
                                        },
                                        'type': {
                                            type: 'string'
                                        }
                                    }
                                }
                            },
                            'requireAudio': {
                                type: 'boolean'
                            }
                        }
                    }
                }
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any video recorded during this frame
             * @param {List} videoList a list of webcam video IDs in case there are >1
             * @param {Object} eventTimings
             * @param {String} currentlyHighlighted which image is selected at
             *   the end of the trial, or null if none is. This indicates the
             *   final selected choice for a choice trial.
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                },
                currentlyHighlighted: {
                    type: 'string'
                },
                nTrial: {
                    type: 'number'
                },
                nPhase: {
                    type: 'number'
                },
                videoList: {
                    type: 'list'
                }
            }
        }
    },

    // Move an image up and down until the isSpeaking class is removed.
    // Yes, this could much more naturally be done by using a CSS animation property
    // on isSpeaking, but despite animations getting applied properly to the element,
    // I haven't been able to get that working - because of the possibility of ember-
    // specific problems here, I'm going with something that *works* even if it's less
    // elegent.
    wiggle(imageId) {
        var _this = this;
        if ($('#' + imageId).hasClass('isSpeaking')) {
            $('#' + imageId).animate({'margin-bottom': '.3%'}, 250, function() {
                $('#' + imageId).animate({'margin-bottom': '0%'}, 250, function() {
                    _this.wiggle(imageId);
                });
            });
        }
    },

    actions: {

        clickSpeaker(imageId) {
            // On a choice frame, highlight this choice
            if (this.get('isChoiceFrame')) {

                /**
                 * When one of the images is clicked during a choice frame
                 *
                 * @event clickSpeaker
                 * @param {String} imageId
                 */
                this.send('setTimeEvent', 'clickSpeaker', {
                    imageId: imageId
                });

                $('.story-image-positioner').removeClass('highlight');
                $('#' + imageId).addClass('highlight');
                this.set('currentlyHighlighted', imageId);
                this.notifyPropertyChange('readyToProceed');

            // In general, play audio associated with this image
            } else {
                // Only allow playing image audio once main narration finishes
                if (this.get('completedAudio')) {
                    // pause any current audio, and set times to 0
                    $('.story-image-positioner').removeClass('isSpeaking');
                    $('audio').each(function() {
                        this.pause();
                        this.currentTime = 0;
                    });
                    // play this image's associated audio
                    $('#' + imageId + ' audio')[0].play();
                    // animate the image while audio is playing
                    $('#' + imageId).addClass('isSpeaking');
                    this.wiggle(imageId);

                    /**
                     * When image audio is started
                     *
                     * @event startSpeakerAudio
                     * @param {String} imageId
                     */
                    this.send('setTimeEvent', 'startSpeakerAudio', {
                        imageId: imageId
                    });
                }
            }
        },

        endSpeakerAudio(imageId) {
            $('#' + imageId).removeClass('isSpeaking');
        },

        markAudioPlayed(imageId) {

            /**
             * When image audio is played (recorded even if not completed)
             *
             * @event playSpeakerAudio
             * @param {String} imageId
             */
            this.send('setTimeEvent', 'playSpeakerAudio', {
                imageId: imageId
            });

            this.imageAudioPlayed.add(imageId);
            this.notifyPropertyChange('readyToProceed');
        },

        replay() {
            // pause any current audio, and set times to 0
            $('.story-image-positioner').removeClass('isSpeaking');
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
            $('.story-image-positioner').removeClass('isSpeaking');
            this.stopRecorder().then(() => {
                _this.set('stoppedRecording', true);
                _this.send('next');
            }, () => {
                _this.send('next');
            });
        },

        playNextAudioSegment() {
            this.set('currentAudioIndex', this.get('currentAudioIndex') + 1);
            if (this.currentAudioIndex < this.get('audioSources').length) {
                $('#' + this.get('audioSources')[this.currentAudioIndex].audioId)[0].play();
            } else {
                if (this.get('autoProceed')) {
                    this.send('finish');
                } else {
                    /**
                     * When narration audio is completed
                     *
                     * @event completeMainAudio
                     */
                    this.send('setTimeEvent', 'completeMainAudio');
                    this.set('completedAudio', true);
                    this.notifyPropertyChange('readyToProceed');
                }
            }
        }

    },

    didInsertElement() {

        this._super(...arguments);

        // Make 'Enter' == next button
        $(document).on('keyup.nexter', (e) => {
            if (this.get('readyToProceed')) {
                if (e.which === 13) { // enter/return
                    this.send('finish');
                }
            }
        });

        this.set('imageAudioPlayed', new Set()); // Otherwise persists across frames

        var parentTextBlock = this.get('parentTextBlock') || {};
        var css = parentTextBlock.css || {};
        $('#parenttext').css(css);

        this.send('showFullscreen');
        $('#nextbutton').prop('disabled', true);

        // Any animations as images are displayed at start of this phase
        $('.story-image-positioner').hide();
        this.get('images').forEach(function (im) {
            if (im.animate === 'fadein') {
                $('#' + im.id).fadeIn(1000);
            } if (im.animate === 'fadeout') {
                $('#' + im.id).show();
                $('#' + im.id).fadeOut(1000);
            }else if (im.animate === 'flyleft') {
                $('#' + im.id).show();
                $('#' + im.id).css('left', '-20%');
                $('#' + im.id).animate({
                    left: im.left + '%'
                }, 1500);
            } else if (im.animate === 'flyright') {
                $('#' + im.id).show();
                $('#' + im.id).css('left', '100%');
                $('#' + im.id).animate({
                    left: im.left + '%'
                }, 1500);
            }else {
                $('#' + im.id).show();
            }
        });

        // If not waiting for recording to start, just go ahead with audio now
        if (!this.get('doUseCamera')) {
            this.send('playNextAudioSegment');
        }

    },

    willDestroyElement() {
        $(document).off('keyup.nexter');
        this._super(...arguments);
    }

});
