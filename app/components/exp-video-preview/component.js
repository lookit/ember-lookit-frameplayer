import Ember from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { computed } from '@ember/object';
import { videoAssetOptions, imageAssetOptions } from '../../mixins/expand-assets';

/*
 * @module exp-player
 * @submodule frames
 */

// Use regular comment syntax here to exclude from docs for clarity
/*
 * A frame that displays a series of videos to preview, without collecting data as a live experiment. User can go through these at their own pace and video controls are shown. Webcam video is recorded starting once the user presses a button to actually display the videos, so that researchers can check that the participant (infant/child) did not see the videos ahead of time.
 ```json
 "frames": {
    "my-sample-frame": {
        "id": "video-preview",
        "kind": "exp-video-preview",
        "text": "Here are the videos your child will see in this study. You can watch them ahead of time--please just don't show your child yet!",
        "prompt": "My child can NOT see the screen. Start the preview!",
        "baseDir": "https://url.com/",
        "videoTypes": ["webm", "mp4"],
        "videos": [
           {
             "caption": "User-facing text that appears below the video",
             "sources": "example_intro"
           },
           {
             "caption": "User-facing text that appears below the video",
             "imgSrc": "caterpillar_picture"
           }
         ]
    }
  }

 * ```
 * @class Exp-video-preview
 * @extends Exp-frame-base
 * @uses Expand-assets
 * @uses Video-record
 * @uses Media-reload
 * @deprecated
 */
export default ExpFrameBaseComponent.extend(MediaReload, VideoRecord, ExpandAssets, {
    layout,
    videoIndex: 0,

    recordingStopped: false,
    recordingStarted: false,

    noNext: computed('videoIndex', function() {
        return this.get('videoIndex') >= this.get('videos.length') - 1;
    }),

    noPrev: computed('videoIndex', function() {
        return this.get('videoIndex') <= 0;
    }),

    currentVideo: computed('videoIndex', function() {
        return this.get('videos')[this.get('videoIndex')];
    }),

    disableRecord: Ember.computed('recorder.hasCamAccess', 'recorderReady', function() {
        return !(this.get('recorder.hasCamAccess') && this.get('recorderReady'));
    }),

    assetsToExpand: {
        'audio': [],
        'video': ['videos/sources'],
        'image': ['videos/imgSrc']
    },

    actions: {
        accept() {
            this.set('prompt', false);
            if (this.get('experiment') && this.get('id') && this.get('session') && !this.get('isLast')) {
                this.startRecorder().then(() => {
                    this.set('recordingStarted', true);
                });
            }
        },
        nextVideo() {
            this.set('videoIndex', this.get('videoIndex') + 1);
        },
        previousVideo() {
            this.set('videoIndex', this.get('videoIndex') - 1);
        },
        finish() {
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
        }
    },
    type: 'exp-video-preview',
    frameSchemaProperties: {
        /*
         * A series of preview videos to display within a single frame, defined as an array of objects.
         *
         * @property {Array} videos
         *   @param {String} caption Some text to appear under this video
         *   @param {Object[]} sources String indicating video path relative to baseDir (see baseDir), OR Array of {src: 'url', type: 'MIMEtype'} objects.
         *   @param {String} imgSrc URL of image to display (optional; each preview video should designate either sources or imgSrc). Can be full path or relative to baseDir.
         */
        videos: {
            type: 'array',
            description: 'A list of videos to preview',
            items: {
                type: 'object',
                properties: {
                    imgSrc: {
                        anyOf: imageAssetOptions,
                        default: ''
                    },
                    sources: {
                        anyOf: videoAssetOptions
                    },
                    caption: {
                        type: 'string'
                    }
                },
                required: ['caption']
            },
            default: []
        },
        /*
         * Text on the button prompt asking the user to continue to the videos
         *
         * @property {String} prompt
         */
        prompt: {
            type: 'string',
            description: 'Text on the button prompt asking the user to continue to the videos',
            default: 'Begin preview'
        },
        /*
         * Informational text to display to the user before videos are shown, along with button to continue
         *
         * @property {String} text
         */
        text: {
            type: 'string',
            description: 'Informational text to display to the user before videos are shown, along with button to continue',
            default: ''
        },
        /*
         * Text on the button to proceed to the next example video/image
         *
         * @property {String} nextStimulusText
         */
        nextStimulusText: {
            type: 'string',
            description: 'Text on the button to proceed to the next example video/image',
            default: 'Next'
        },
        /*
         * Text on the button to proceed to the previous example video/image
         *
         * @property {String} previousStimulusText
         */
        previousStimulusText: {
            type: 'string',
            description: 'Text on the button to proceed to the previous example video/image',
            default: 'Previous'
        }
    },
    meta: {
        name: 'ExpVideoPreview',
        description: 'Frame that displays a series of preview videos, self-paced with controls.',
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
    }
});
