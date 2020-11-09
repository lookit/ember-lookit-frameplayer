import Em from 'ember';

import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import ExpandAssets, {videoAssetOptions} from '../../mixins/expand-assets';

let {
    $
} = Em;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame to display video instructions to the user.
 *
 * A video is displayed to the left, and a transcript or summary in a scrolling box to the right. (The transcript can
 * be omitted if desired, but in that case you must provide complete captioning for the video!)
 *
 * The participant is required to either scroll to the bottom of the transcript or watch the video to proceed.
 *
 * Each element of the 'transcriptBlocks' parameter is rendered using {{#crossLink "Exp-text-block"}}{{/crossLink}}.

```json
 "frames": {
     "intro-video": {
        "kind": "exp-lookit-instruction-video",
        "instructionsVideo": [
            {
                "src": "https://raw.github.com/UCDOakeslab/Baby_MR_Lookit/master/Lookit Introduction Part 1_Edited.mp4",
                "type": "video/mp4"
            }
        ],
        "introText": "Welcome to the study! Please watch this video to get started. \n(Or you can read the summary to the right if you prefer.)",
        "transcriptTitle": "Video summary",
        "transcriptBlocks": [
            {
                "title": "Background information about the study",
                "listblocks": [
                    {
                        "text": "Your baby does not need to be with you at this point in the study. We will let you know when it is time to get your baby."
                    },
                    {
                        "text": "Mental rotation, or the ability to manipulate internal representations of objects, is an important spatial ability. Spatial abilities are important for understanding objects, reading maps, mathematical reasoning, and navigating the world. Thus, the development of mental rotation is an important milestone. In the current study, we are interested in examining whether babies in general can mentally rotate simple objects."
                    }
                ]
            },
            {
                "title": "Preview of what your baby will see"
            },
            {
                "listblocks": [
                    {
                        "text": "Your baby will be shown two identical Tetris shapes on the screen; one on the left and one on the right. The shapes appear and disappear, changing their orientation each time they reappear. On one side, the rotation will always be possible. Sometimes, on the other side, a mirror image of the shape will be presented. If babies can mentally rotate objects, they should spend different amounts of time watching these two kinds of stimuli."
                    }
                ]
            },
            {
                "title": "What's next?",
                "listblocks": [
                    {
                        "text": "Because this is an online study, we will check to make sure that your webcam is set up and working properly on the next page, so we can record your baby’s looking behavior during the study."
                    },
                    {
                        "text": "Following that page, you will be given an opportunity to review the consent information and we will ask that you record a short video of yourself giving consent to participate in this study."
                    },
                    {
                        "text": "We will then ask you questions about your baby's motor abilities."
                    },
                    {
                        "text": "After you are finished with the consent page and questions, you will be provided with more detailed information about what to do during the study and how to get started."
                    }
                ]
            }
        ],
        "warningText": "Please watch the video or read the transcript before proceeding.",
        "nextButtonText": "Next",
        "title": "Study instructions",
        "showPreviousButton": false
    }
 }

 * ```
 * @class Exp-lookit-instruction-video
 * @extends Exp-frame-base
 * @extends Expand-assets
 */

export default ExpFrameBaseComponent.extend(ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-instruction-video',
    assetsToExpand: {
        'audio': [
        ],
        'video': [
            'instructionsVideo'
        ],
        'image': [
        ]
    },
    frameSchemaProperties: {

        /**
         * Title to show at top of frame
         *
         * @property {String} title
         * @default 'Study instructions'
         */
        title: {
            type: 'string',
            description: 'Title for frame',
            default: 'Study instructions'
        },

        /**
         * Intro text to show at top of frame
         *
         * @property {String} introText
         * @default 'Welcome! Please watch this video to learn how the study will work. \n You can read through the information to the right if you prefer.'
         */
        introText: {
            type: 'string',
            description: 'Intro text to show at top of frame',
            default: 'Welcome! Please watch this video to learn how the study will work. You can read the transcript to the right if you prefer.'
        },

        requireWatchOrRead: {
            type: 'Boolean',
            description: 'Whether to require that the participant watches the video (or reads the whole transcript) to move on',
            default: true
        },

        /**
         * Text to show above Next button if participant has not yet watched video or read transcript. Only used if
         * requireWatchOrRead is true.
         *
         * @property {String} warningText
         * @default 'Please watch the video or read the transcript before proceeding.'
         */
        warningText: {
            type: 'string',
            description: 'Text to show above Next button if participant has not yet watched video or read transcript',
            default: 'Please watch the video or read the transcript before proceeding.'
        },

        /**
         * The location of the instructions video to play. This can be either
         *      an array of {'src': 'https://...', 'type': '...'} objects (e.g. providing both
         *      webm and mp4 versions at specified URLS) or a single string relative to baseDir/<EXT>/.
         *
         * @property {Object} instructionsVideo
         */
        instructionsVideo: {
            anyOf: videoAssetOptions,
            description: 'Object describing the instructions video to show'
        },

        /**
         * Title to show above video transcript/overview. Generally this should be either "Video transcript" or
         * "Video summary" depending on whether you're providing a word-for-word transcript or a condensed summary.
         * It may
         *
         * @property {String} transcriptTitle
         * @default 'Video transcript'
         */
        transcriptTitle: {
            type: 'string',
            description: 'Title to show above video transcript/overview',
            default: 'Video transcript'
        },

        /**
         * Array of blocks for {{#crossLink "Exp-text-block"}}{{/crossLink}}, providing a transcript of the video
         * or an overview of what it said. A transcript can be broken down into bullet points to make it more readable.
         *
         * If you've also provided closed captions throughout the video, you can use this space just to provide key
         * points.
         *
         * If this is left blank ([]) no transcript is displayed.
         *
         * @property {Object[]} transcriptBlocks
         *   @param {String} title Title of this section
         *   @param {String} text Paragraph text of this section
         *   @param {Object[]} listblocks Object specifying bulleted points for this section. Each object is of the form:
         *   {text: 'text of bullet point', image: {src: 'url', alt: 'alt-text'}}. Images are optional.*
         */
        transcriptBlocks: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string'
                    },
                    text: {
                        type: 'string'
                    },
                    listblocks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                text: {
                                    type: 'string'
                                },
                                image: {
                                    type: 'object',
                                    properties: {
                                        src: {
                                            type: 'string'
                                        },
                                        alt: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            default: []
        },
        /**
         * Whether to show a 'previous' button
         *
         * @property {Boolean} showPreviousButton
         * @default true
         */
        showPreviousButton: {
            type: 'boolean',
            default: true
        },
        /**
         * Text to display on the 'next frame' button
         *
         * @property {String} nextButtonText
         * @default 'Start the videos! \n (You\'ll have a moment to turn around.)'
         */
        nextButtonText: {
            type: 'string',
            default: 'Start the videos! \n (You\'ll have a moment to turn around.)'
        }
    },
    meta: {
        data: {
            type: 'object',
            properties: {
            }
        }
    },

    hasCompletedFrame: Em.computed('playedVideo', 'readTranscript', 'requireWatchOrRead', function() {
        return (!this.get('requireWatchOrRead') || this.get('playedVideo') || this.get('readTranscript'));
    }),

    showWarning: false,
    playedVideo: false,
    readTranscript: false,

    actions: {
        mediaPlayed() {
            this.set('playedVideo', true);
            this.set('showWarning', false);
        },
        checkIfDoneThenNext() {
            if (!this.get('hasCompletedFrame')) {
                this.set('showWarning', true);
            } else {
                this.send('next');
            }
        }
    },

    didInsertElement() {
        this._super(...arguments);
        let $transcript = $('div.transcript');
        let _frame = this;
        // See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Determine_if_an_element_has_been_totally_scrolled
        if ($transcript.length) {
            // First check if the transcript is already scrolled to end because it doesn't need to scroll. Allow slight
            // buffer (2px) as Chrome doesn't always think we've scrolled to very bottom.
            if ($transcript[0].scrollHeight - $transcript[0].scrollTop <= $transcript[0].clientHeight + 2) {
                _frame.set('readTranscript', true);
                _frame.set('showWarning', false);
            }
            // And check upon scrolling if we've reached the bottom
            $transcript.bind('scroll', function() {
                if (this.scrollHeight - this.scrollTop <= this.clientHeight + 2) {
                    _frame.set('readTranscript', true);
                    _frame.set('showWarning', false);
                }
            });
        }
    }
});
