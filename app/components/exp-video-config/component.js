import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video configuration frame guiding user through making sure permissions are set appropriately and microphone is working, with troubleshooting text. All content is hard-coded for a general-purpose technical setup frame.

```json
"frames": {
    "video-config": {
        "kind": "exp-video-config"
    }
}
```

@class ExpVideoConfig
@extends ExpFrameBase
@extends VideoRecord
*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,
    showWarning: false,
    micChecked: Em.computed.alias('recorder.micChecked'),
    hasCamAccess: Em.computed.alias('recorder.hasCamAccess'),
    hasWebCam: Em.computed.alias('recorder.hasWebCam'),

    actions: {

        checkAudioThenNext() {
            if (!this.get('micChecked')) {
                this.set('showWarning', true);
            } else if (this.get('hasWebCam')) {
                this.send('next');
            }
        },

        reloadRecorder() {
            this.set('showWarning', false);
            this.destroyRecorder();
            this.setupRecorder(this.$(this.get('recorderElement')), false);
        },
    },

    type: 'exp-videoconfig',
    meta: {
        name: 'Video Recorder Configuration',
        description: 'Frame guiding the user through setting up webcam, with no recording.',
        parameters: {
            type: 'object',
            properties: {
                /**
                Text to show as the introduction to the troubleshooting tips section
                @property {String} troubleshootingIntro
                @default "Some families are having trouble initially getting their webcams to work on Lookit. We're sorry, and we're working on switching away from Flash to make recording more reliable! In the meantime, these instructions should fix most problems."
                */
                troubleshootingIntro: {
                    type: 'string',
                    description: 'Text to show as introduction to troubleshooting tips section',
                    default: "We're just getting started with a new method for video recording! If you're having trouble and the instructions below don't fix it, we're sorry - and we'd love to hear from you so we can improve the system."
                }

            },
            required: []
        },
        data: {
            type: 'object',
            properties: {}
        }
    }
});
