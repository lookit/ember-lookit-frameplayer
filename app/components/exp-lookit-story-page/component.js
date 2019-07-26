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
 * @class ExpLookitStoryPage
 * @extends ExpFrameBase
 * @uses FullScreen
 * @uses VideoRecord
 * @uses ExpandAssets
 */

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

    assetsToExpand: {
        'audio': ['audioSources/sources'],
        'video': [],
        'image': ['images/src']
    },

    meta: {
        name: 'ExpLookitStoryPage',
        description: 'Frame to display a basic storybook page trial, with images and audio',
        parameters: {
            type: 'object',
            properties: {
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
                    type: 'Number',
                    description: 'Minimum duration of frame in seconds if autoproceeding'
                },

                /**
                 * [Only used if autoProceed is true and durationSeconds set] Whether to
                 * show a progress bar based on durationSeconds in the parent text area.
                 *
                 * @property {Number} showProgressBar
                 */
                showProgressBar: {
                    type: 'Boolean',
                    description: 'Whether to show a progress bar based on durationSeconds'
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
                }
            }
        },
        data: {
            type: 'object',
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {Object} eventTimings
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @param {List} videoList a list of webcam video IDs in case there are >1
             * @return {Object} The payload sent to the server
             */
            properties: {
                videoId: {
                    type: 'string'
                },
                videoList: {
                    type: 'list'
                }
            },
        }
    },

    // Override to do a bit extra when recording
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

    actions: {

        // During playing audio
        updateCharacterHighlighting() {

            var thisAudioData = this.get('audioSources')[this.currentAudioIndex];
            var t = $('#' + thisAudioData.audioId)[0].currentTime;

            $('.story-image-container').removeClass('highlight');

            thisAudioData.highlights.forEach(function (h) {
                if (t > h.range[0] && t < h.range[1]) {
                    $('#' + h.image).addClass('highlight');
                }
            });
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
            this.stopRecorder().then(() => {
                _this.set('stoppedRecording', true);
                _this.send('next');
            }, () => {
                _this.send('next');
            });
        },

        playNextAudioSegment() {
            this.set('currentAudioIndex', this.get('currentAudioIndex') + 1);
            if (this.currentAudioIndex == 0) { // Starting first audio segment: start timer & progress bar
                if (this.get('durationSeconds')) {
                    let _this = this;
                    this.set('pageTimer', window.setTimeout(function() {
                            _this.set('minDurationAchieved', true);
                            if (_this.get('finishedAllAudio')) {
                                _this.send('finish');
                            }
                        }, _this.get('durationSeconds') * 1000));
                    if (this.get('showProgressBar')) {
                        this.set('timerStart', new Date().getTime());
                        this.set('progressTimer', window.setInterval(function() {
                            var prctDone =  ((new Date().getTime() - _this.get('timerStart'))) / (_this.get('durationSeconds') * 10);
                            $('.progress-bar').css('width', prctDone + '%');
                        }, 100));

                    }
                } else {
                    this.set('minDurationAchieved', true);
                }
            }
            if (this.currentAudioIndex < this.get('audioSources').length) {
                $('#' + this.get('audioSources')[this.currentAudioIndex].audioId)[0].play();
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
        var parentTextBlock = this.get('parentTextBlock') || {};
        var css = parentTextBlock.css || {};
        $('#parenttext').css(css);

        this.send('showFullscreen');
        $('#nextbutton').prop('disabled', true);

        // If not recording, go to audio right away! Otherwise will be triggered when
        // recording starts.
        if (!this.get('doRecording')) {
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
        if (this.get('doRecording') && this.get('currentAudioIndex') == -1) {
            $('.story-image-container').hide();
        }
    }

});
