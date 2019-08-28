import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video configuration frame guiding user through making sure permissions are set
appropriately and microphone is working, with troubleshooting text. Almost all content is
hard-coded, to provide a general-purpose technical setup frame.

```json
"frames": {
    "video-config": {
        "kind": "exp-video-config",
        "troubleshootingIntro": "If you're having any trouble getting your webcam set up,
          please feel free to call the XYZ lab at (123) 456-7890 and we'd be glad to
          help you out!"
    }
}
```

@class Exp-video-config
@extends Exp-frame-base
@extends Video-record
*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,
    showWarning: false,
    micChecked: Em.computed.alias('recorder.micChecked'),
    hasCamAccess: Em.computed.alias('recorder.hasCamAccess'),

    actions: {

        checkAudioThenNext() {
            if (!this.get('micChecked')) {
                this.set('showWarning', true);
            } else if (this.get('hasCamAccess')) {
                this.send('next');
            }
        },

        reloadRecorder() {
            this.set('showWarning', false);
            this.destroyRecorder();
            this.setupRecorder(this.$(this.get('recorderElement')));
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
                @default ""
                */
                troubleshootingIntro: {
                    type: 'string',
                    description: 'Text to show as introduction to troubleshooting tips section',
                    default: ''
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
