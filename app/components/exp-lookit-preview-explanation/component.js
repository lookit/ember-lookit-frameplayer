import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame that to explain any blinding procedures to parents, and offer them the option to preview stimuli before the study. Two buttons allow the user to move forward: one goes to the next frame (if the parent wants to preview stimuli), and one skips the next frame and goes to the one after that (if the parent declins). Therefore, this frame should be followed by an {{#crossLink "Exp-video-preview"}}{{/crossLink}} frame.

```json
 "frames": {
    "my-video-preview-explanation": {
        "introBlock": {
            "text": "During the videos, we'll ask that you hold your child over your shoulder like this, so that you're facing face away from the screen."
        },
        "image": {
            "alt": "Father holding child looking over his shoulder",
            "src": "https://s3.amazonaws.com/lookitcontents/exp-physics/OverShoulder.jpg"
        },
        "kind": "exp-lookit-preview-explanation",
        "skipButtonText": "Skip preview",
        "previewButtonText": "I'd like to preview the videos",
        "blocks": [
            {
                "text": "The reason we ask this is that your child is learning from you all the time. Even if he or she can't see where you're looking, you may unconsciously shift towards one side or the other and influence your child's attention. We want to make sure we're measuring your child's preferences, not yours!"
            },
            {
                "text": "If you'd like to see the videos your child will be shown, you can take a look ahead of time now. It's important that you preview the videos without your child, so that the videos will still be new to them."
            }
        ],
        "showPreviousButton": true
    }
 }

 * ```
 * @class Exp-lookit-preview-explanation
 * @extends Exp-frame-base
 */

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-preview-explanation',
    layout: layout,
    meta: {
        name: 'ExpLookitPreviewExplanation',
        description: 'Let parents know about blinding, give option to preview videos.',
        parameters: {
            type: 'object',
            properties: {
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
                 * Array of text blocks (paragraphs) to display after the image.
                 *
                 * @property {Object} blocks
                 *   @param {String} title title to display
                 *   @param {String} text paragraph of text
                 *   @param {Boolean} emph whether to bold this paragraph
                 */
                blocks: {
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
                            emph: {
                                type: 'boolean'
                            }
                        }
                    },
                    default: []
                },
                /**
                 * Object specifying first block of text (pre-image) to display.
                 *
                 * @property {Object} introBlock
                 *   @param {String} title title to display
                 *   @param {String} text paragraph of text
                 *   @param {Boolean} emph whether to bold this paragraph
                 */
                introBlock: {
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
                        }
                    }
                },
                /**
                 * Image to display after the intro block. (Displayed centered,
                 * with border, max height 220px.) E.g., a picture of a parent
                 * holding a child looking over their shoulder.
                 *
                 * @property {Object} image
                 *   @param {String} src URL of image
                 *   @param {String} alt alt-text
                 */
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
                },
                /**
                 * Text to display on the button to go to the next frame
                 *
                 * @property {String} previewButtonText
                 * @default 'I\'d like to preview the videos'
                 */
                previewButtonText: {
                    type: 'string',
                    default: 'I\'d like to preview the videos'
                },
                /**
                 * Text to display on the button to skip the next frame
                 *
                 * @property {String} skipButtonText
                 * @default 'Skip preview'
                 */
                skipButtonText: {
                    type: 'string',
                    default: 'Skip preview'
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                // define data structure here
            }
        }
    },
    actions: {
        skipone: function() {
            this.get('skipone')();
        }
    }
});
