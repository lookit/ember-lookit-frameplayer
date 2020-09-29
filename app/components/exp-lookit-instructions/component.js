import Em from 'ember';

import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

let {
    $
} = Em;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame to display instructions to the user. The user's webcam may optionally be
 * displayed, and audio and video clips may be included in the instructions (and may be
 * required to be played before moving on).
 *
 * Each element of the 'blocks' parameter is rendered using {{#crossLink "Exp-text-block"}}{{/crossLink}}.

```json
 "frames": {
        "instructions": {
            "kind": "exp-lookit-instructions",
            "blocks": [
                {
                    "title": "Parent's role",
                    "listblocks": [
                        {
                            "text": "Follow instructions"
                        },
                        {
                            "text": "Only do each joke once"
                        }
                    ]
                },
                {
                    "text": "It's important that we can see you",
                    "image": {
                        "alt": "Father holding child looking over his shoulder",
                        "src": "https://s3.amazonaws.com/lookitcontents/exp-physics/OverShoulder.jpg"
                    },
                    "title": "Camera position"
                },
                {
                    "text": "Here's some audio you have to play",
                    "title": "Test",
                    "mediaBlock": {
                        "text": "You should hear 'Ready to go?'",
                        "isVideo": false,
                        "sources": [
                            {
                                "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/audio/ready.mp3",
                                "type": "audio/mp3"
                            },
                            {
                                "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/audio/ready.ogg",
                                "type": "audio/ogg"
                            }
                        ],
                        "mustPlay": true,
                        "warningText": "Please try playing the sample audio."
                    }
                },
                {
                    "text": "Here's a video you don't have to play!",
                    "title": "Test",
                    "mediaBlock": {
                        "text": "Look at that.",
                        "isVideo": true,
                        "sources": [
                            {
                                "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/examples/7_control_same.mp4",
                                "type": "video/mp4"
                            },
                            {
                                "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/examples/7_control_same.webm",
                                "type": "video/webm"
                            }
                        ],
                        "mustPlay": false
                    }
                }
            ],
            "showWebcam": true,
            "webcamBlocks": [
                {
                    "title": "Some webcam instructions",
                    "listblocks": [
                        {
                            "text": "Like this!"
                        },
                        {
                            "text": "Be careful your webcam does not have tape over it"
                        }
                    ]
                }
            ],
            "nextButtonText": "Next"
        }
 }

 * ```
 * @class Exp-lookit-instructions
 * @extends Exp-frame-base
 * @extends Video-record
 */

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout: layout,
    type: 'exp-lookit-instructions',
    doUseCamera: Em.computed.alias('showWebcam'),
    frameSchemaProperties: {

        // Note: don't display the following in the docs; they're not used because startRecordingAutomatically is
        // false.

        /**
         * @property {Boolean} showWaitForRecordingMessage
         * @private
         */

        /**
         * @property {Boolean} waitForRecordingMessage
         * @private
         */

        /**
         * @property {Boolean} waitForRecordingMessageColor
         * @private
         */

        /**
         * @property {Boolean} showWaitForUploadMessage
         * @private
         */

        /**
         * @property {Boolean} waitForUploadMessage
         * @private
         */

        /**
         * @property {String} waitForUploadMessageColor
         * @private
         */

        /**
         * @property {String} waitForWebcamImage
         * @private
         */

        /**
         * @property {String} waitForWebcamVideo
         * @private
         */

        /**
         * Whether to display the user's webcam
         *
         * @property {Boolean} showWebcam
         * @default false
         */
        showWebcam: {
            type: 'boolean',
            description: 'Whether to display the user\'s webcam',
            default: false
        },

        /**
         * Array of blocks for {{#crossLink "Exp-text-block"}}{{/crossLink}}, specifying text/images of instructions to display
         *
         * @property {Object[]} blocks
         *   @param {String} title Title of this section
         *   @param {String} text Paragraph text of this section
         *   @param {Object[]} listblocks Object specifying bulleted points for this section. Each object is of the form:
         *   {text: 'text of bullet point', image: {src: 'url', alt: 'alt-text'}}. Images are optional.
         *   @param {Object} mediaBlock Object specifying audio or video clip to include (optional). mediaBlock should be of form:
         *   {title: 'title text to show above audio', text: 'text to show below controls', warningText: 'Text to show in red if user tries to proceed but hasn't played; only used if mustPlay is true', sources: 'sources Array of {src: 'url', type: 'MIMEtype'} objects specifying audio sources', isVideo: 'boolean, whether video or audio', mustPlay: 'boolean, whether clip has to be played to proceed'}
         *
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
                    },
                    mediaBlock: {
                        type: 'object',
                        default: {},
                        properties: {
                            title: {
                                type: 'string'
                            },
                            text: {
                                type: 'string'
                            },
                            warningText: {
                                type: 'string'
                            },
                            sources: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        src: {
                                            type: 'string'
                                        },
                                        type: {
                                            type: 'string'
                                        }
                                    }
                                }
                            },
                            isVideo: {
                                type: 'boolean',
                                default: false
                            },
                            mustPlay: {
                                type: 'boolean',
                                default: false
                            }
                        }
                    }
                }
            },
            default: []
        },
        /**
         * Array of objects specifying text/images of instructions to display under webcam view (if webcam is shown)
         *
         * @property {Object[]} blocks
         *   @param {String} title Title of this section
         *   @param {String} text Paragraph text of this section
         *   @param {Object[]} listblocks Object specifying bulleted points for this section. Each object is of the form:
         *   {text: 'text of bullet point', image: {src: 'url', alt: 'alt-text'}}. Images are optional.
         */
        webcamBlocks: {
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

    showWarning: false,

    actions: {
        mediaPlayed(e) {
            $(e.srcElement).attr('completed', true);
            $(e.srcElement).parent().attr('showWarning', false);
        },
        checkAudioThenNext() {
            if (this.shouldPreventNext()) {
                this.set('showWarning', true);
            } else {
                this.send('next');
            }
        }
    },

    shouldPreventNext() {
        var done = true;
        var blocks = this.get('blocks');
        for (var iBlock = 0; iBlock < blocks.length; iBlock++) { // for each block
            if (blocks[iBlock].hasOwnProperty('mediaBlock')) {   // if it has a mediaBlock
                // find the appropriate element
                var $elem = $('#media-' + iBlock + ' .player-media');
                if (blocks[iBlock].mediaBlock.hasOwnProperty('mustPlay') && blocks[iBlock].mediaBlock.mustPlay) { // if the mediaBlock must be played
                    // if it's not completed
                    if ($elem.attr('completed') != 'true') {
                        done = false;
                        $elem.parent().attr('showWarning', true);
                    }
                } else { // does not have to be played
                    $elem.parent().attr('showWarning', false); // Set this explicitly
                    // so the warning isn't visible, although :not([showWarning])
                    // selector should handle in almost all browsers
                }
            }
        }
        return !done;
    }
});
