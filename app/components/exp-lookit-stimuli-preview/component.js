import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import Ember from 'ember';

import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { computed } from '@ember/object';
import { videoAssetOptions, imageAssetOptions, audioAssetOptions } from '../../mixins/expand-assets';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame that to explain any blinding procedures to parents, and offer them the option to preview stimuli before the study. Two buttons allow the user to move forward: one goes to the next frame (if the parent wants to preview stimuli), and one skips the next frame and goes to the one after that (if the parent declins). Therefore, this frame should be followed by an {{#crossLink "Exp-video-preview"}}{{/crossLink}} frame.

```json
 "frames": {
    "my-video-preview-explanation": {
        "kind": "exp-lookit-stimuli-preview",
        "doRecording": true,
        "skipButtonText": "Skip preview",
        "previewButtonText": "I'd like to preview the videos",
        "blocks": [
            {
                 "text": "During the videos, we'll ask that you hold your child over your shoulder like this, so that you're facing face away from the screen."
            },
            {
                "image": {
                    "alt": "Father holding child looking over his shoulder",
                    "src": "https://raw.githubusercontent.com/kimberscott/placeholder-stimuli/master/img/OverShoulder.jpg"
                }
            },
            {
                "text": "This is because your child is learning from you all the time, and may pick up on even very small cues about what you think. But if you can't see the stimuli, we're definitely only measuring your child's own beliefs."
            },
            {
                "text": "If you'd like to see the videos your child will be shown, you can take a look ahead of time now. It's important that you preview the videos without your child, so that the videos will still be new to them."
            }
        ],
        "showPreviousButton": true,
        "baseDir": "https://raw.githubusercontent.com/kimberscott/placeholder-stimuli/master/",
        "videoTypes": ["webm", "mp4"],
        "audioTypes": ["mp3", "ogg"],
        "stimuli": [
           {
             "caption": "At the start of each section, we will play a video like this that shows a common household object, like a book or an apple.",
             "video": "cropped_book"
           },
           {
             "caption": "Your child will be looking at images like this, and we'll ask him or her to describe each one.",
             "image": "square.png"
           },
           {
             "caption": "Between sections, we will play audio like this so you know where you are in the study.",
             "audio": "sample_1"
           }
         ]
    }
 }

 * ```
 * @class Exp-lookit-stimuli-preview
 * @extends Exp-frame-base
 * @uses Expand-assets
 * @uses Video-record
 * @uses Media-reload
 */

export default ExpFrameBaseComponent.extend(MediaReload, VideoRecord, ExpandAssets, {
    type: 'exp-lookit-stimuli-preview',
    layout: layout,

    videoIndex: 0,

    recordingStopped: false,
    recordingStarted: false,

    noNext: computed('videoIndex', function() {
        return this.get('videoIndex') >= this.get('stimuli.length') - 1;
    }),

    noPrev: computed('videoIndex', function() {
        return this.get('videoIndex') <= 0;
    }),

    currentVideo: computed('videoIndex', function() {
        return this.get('stimuli')[this.get('videoIndex')];
    }),

    recorderSettingUp: Ember.computed('recorder.hasCamAccess', 'recorderReady', function() {
        return (this.get('doRecording') && !(this.get('recorder.hasCamAccess') && this.get('recorderReady')));
    }),

    assetsToExpand: {
        'audio': ['stimuli/audio'],
        'video': ['stimuli/video'],
        'image': ['stimuli/image']
    },

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),

    /**
     * @property {Boolean} startRecordingAutomatically
     * @private
     */

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

    frameSchemaProperties: {

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
         * Array of text blocks to display as an introduction to the preview. Should be a list
         * of objects that can be passed to exp-text-block; each can have any of the
         * properties below.
         *
         * @property {Array} blocks
         *   @param {String} title title to display
         *   @param {String} text paragraph of text
         *   @param {Boolean} emph whether to bold this paragraph
         *   @param {Object} image
         *     @param {String} src URL of image (must be full URL)
         *     @param {String} alt alt-text
         *   @param {Object[]} listblocks Object specifying bulleted points for this section
         *      These will themselves be passed to exp-text-block and can include images,
         *      etc.
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
                        },
                        required: ['src', 'alt']
                    },
                    listblocks: {
                        type: 'array',
                        default: []
                    }
                }
            },
            default: []
        },
        /**
         * Text on the preview button user clicks to proceed to stimuli/images
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
        },
        /**
         * A series of preview stimuli to display within a single frame, defined as an array of objects.
         * Generally each item of the list will include ONE of image, video, or audio
         * (depending on the stimulus type), plus a caption.
         *
         * @property {Array} stimuli
         *   @param {String} caption Some text to appear under this video
         *   @param {Object[]} video String indicating video URL. This can be relative to baseDir (see baseDir), OR Array of {src: 'url', type: 'MIMEtype'} objects.
         *   @param {Object[]} audio String indicating audio URL. This can be relative to baseDir (see baseDir), OR Array of {src: 'url', type: 'MIMEtype'} objects.
         *   @param {String} image URL of image to display (optional; each preview video should designate either video or image). Can be full path or relative to baseDir.
         */
        stimuli: {
            type: 'array',
            description: 'A list of stimuli to preview',
            items: {
                type: 'object',
                properties: {
                    image: {
                        anyOf: imageAssetOptions,
                        default: ''
                    },
                    video: {
                        anyOf: videoAssetOptions
                    },
                    audio: {
                        anyOf: audioAssetOptions
                    },
                    caption: {
                        type: 'string'
                    }
                },
                required: ['caption']
            },
            default: []
        },
        /**
         * Text on the button to proceed to the next example video/image
         *
         * @property {String} nextStimulusText
         */
        nextStimulusText: {
            type: 'string',
            description: 'Text on the button to proceed to the next example video/image',
            default: 'Next'
        },
        /**
         * Text on the button to proceed to the previous example video/image
         *
         * @property {String} previousStimulusText
         */
        previousStimulusText: {
            type: 'string',
            description: 'Text on the button to proceed to the previous example video/image',
            default: 'Previous'
        },
        /**
         Whether to make a webcam video recording during stimulus preview (begins only if user chooses to preview stimuli). Default true.
         @property {Boolean} doRecording
         @default true
         */
        doRecording: {
            type: 'boolean',
            description: 'Whether to do video recording during stimulus preview',
            default: true
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
                }
            }
        }
    },
    prompt: true,
    actions: {
        accept() {
            /**
             * User clicks on start preview button
             *
             * @event startPreview
             */
            this.send('setTimeEvent', 'startPreview');
            this.set('prompt', false);
            if (this.get('experiment') && this.get('id') && this.get('session') && this.get('doRecording')) {
                this.startRecorder().then(() => {
                    this.set('recordingStarted', true);
                });
            }
        },
        nextVideo() {
            /**
             * User clicks to move to next stimulus
             *
             * @event nextStimulus
             */
            this.send('setTimeEvent', 'nextStimulus');
            this.set('videoIndex', this.get('videoIndex') + 1);
        },
        previousVideo() {
            /**
             * User clicks to move to previous stimulus
             *
             * @event previousStimulus
             */
            this.send('setTimeEvent', 'previousStimulus');
            this.set('videoIndex', this.get('videoIndex') - 1);
        },
        finish() {
            if (this.get('doRecording')) {
                if (!this.get('recordingStopped')) {
                    this.set('recordingStopped', true);
                    var _this = this;
                    this.stopRecorder().then(() => {
                        _this.send('next');
                    }, () => {
                        _this.send('next');
                    });
                } else {
                    this.send('next');
                }
            } else {
                this.send('next');
            }
        }
    }
});
