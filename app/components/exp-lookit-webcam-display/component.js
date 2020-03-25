import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import layout from './template';
import { observer } from '@ember/object';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame to display the user's webcam stream, along with a small amount of optional text.
 * Expected use is as a break during an experiment, e.g. to check positioning, but could
 * also be used as a lightweight frame for data collection.
 *
 * Not fullscreen by default, but can be displayed fullscreen as shown in example below.
 * Can optionally record video.
 *
 *
 ```
    "frames": {
        "webcam-display-break": {
            "kind": "exp-lookit-webcam-display",
            "blocks": [
                {
                    "title": "Here is a short break",
                    "listblocks": [
                        {
                            "text": "You can check that your child is still visible"
                        },
                        {
                            "text": "You can make some silly faces"
                        }
                    ]
                }
            ],
            "nextButtonText": "Next",
            "showPreviousButton": false,
            "displayFullscreenOverride": true,
            "startRecordingAutomatically": false
        }
    }
```
 * @class Exp-lookit-webcam-display
 * @extends Exp-frame-base
 * @extends Video-record
 */

export default ExpFrameBaseComponent.extend(VideoRecord, {
    type: 'exp-lookit-observation',
    layout: layout,
    recorderElement: '#recorder',

    frameSchemaProperties: {
        /**
         * Array of blocks for {{#crossLink "Exp-text-block"}}{{/crossLink}}, specifying text/images of instructions to display
         *
         * @property {Object[]} blocks
         *   @param {String} title Title of this section
         *   @param {String} text Paragraph text of this section
         *   @param {Object[]} listblocks Object specifying bulleted points for this section. Each object is of the form:
         *   {text: 'text of bullet point', image: {src: 'url', alt: 'alt-text'}}. Images are optional.
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
                    }
                }
            },
            default: []
        },
        /**
         * Whether to automatically begin recording upon frame load
         *
         * @property {Boolean} startRecordingAutomatically
         * @default false
         */
        startRecordingAutomatically: {
            type: 'boolean',
            default: false
        },
        /**
         * Text to display on the 'next frame' button
         *
         * @property {String} nextButtonText
         * @default 'Next'
         */
        nextButtonText: {
            type: 'string',
            default: 'Next'
        },
        /**
         * Whether to show a 'previous' button
         *
         * @property {Boolean} showPreviousButton
         * @default true
         */
        showPreviousButton: {
            type: 'boolean',
            default: false
        }
    },

    meta: {
        name: 'ExpLookitWebcamDisplay',
        description: 'This frame displays the participant\'s webcam and some optional text. It can be used for setup or for a quick break to check positioning.',
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @param {List} videoList a list of webcam video IDs in case there are >1
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'

                },
                videoList: {
                    type: 'list'
                }
            },
            required: ['videoId']
        }
    },

    // Override to deal with whether or not recording is starting automatically
    whenPossibleToRecord: observer('recorder.hasCamAccess', 'recorderReady', function() {
        if (this.get('startRecordingAutomatically')) {
            if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
                this.send('record');
            }
        }
    }),

    actions: {
        proceed() { // make sure 'next' fires while still on this frame
            this.stopRecorder().finally(() => {
                this.destroyRecorder();
                this.send('next');
            });
        }
    }
});
