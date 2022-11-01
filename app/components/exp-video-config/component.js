import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record-new';
import { LOOKIT_PREFERRED_DEVICES } from '../../services/video-recorder-new';
import { observer } from '@ember/object';

let {
    $
} = Em;

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
    showWebcamPermWarning: false,
    checkedWebcamPermissions: false,
    micChecked: Em.computed.alias('recorder.micChecked'),
    hasCamAccess: Em.computed.alias('recorder.hasCamAccess'),

    populateDropdowns() {
        const micSelect = $('select#audioSource')[0];
        const camSelect = $('select#videoSource')[0];
        const selectors = [micSelect, camSelect];

        // Adapted from the example at https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
        navigator.mediaDevices.enumerateDevices().then(function(deviceInfos) {
            console.log('exp-video-config: enumerate devices promise fulfilled');
            selectors.forEach(select => {
                while (select.firstChild) {
                    select.removeChild(select.firstChild);
                }
                const blankOption = document.createElement('option');
                blankOption.text = 'select...';
                blankOption.value = 123;
                select.appendChild(blankOption);
            });
            for (let i = 0; i !== deviceInfos.length; ++i) {
                const deviceInfo = deviceInfos[i];
                const option = document.createElement('option');
                option.value = deviceInfo.deviceId;
                if (deviceInfo.kind === 'audioinput') {
                    option.text = deviceInfo.label || `Microphone ${micSelect.length + 1}`;
                    if (option.value == LOOKIT_PREFERRED_DEVICES.mic) {
                        option.selected = true;
                    }
                    micSelect.appendChild(option);
                } else if (deviceInfo.kind === 'videoinput') {
                    option.text = deviceInfo.label || `Camera ${camSelect.length + 1}`;
                    if (option.value == LOOKIT_PREFERRED_DEVICES.cam) {
                        option.selected = true;
                    }
                    camSelect.appendChild(option);
                }
            }
        });
    },

    reloadRecorder() {
        console.log('exp-video-config: reload recorder');
        this.destroyRecorder();
        this.setupRecorder(this.$(this.get('recorderElement')));
    },

    actions: {

        checkAudioThenNext() {
            console.log('exp-video-config: check audio then next');
            if (!this.get('checkedWebcamPermissions') || !this.get('micChecked') || !this.get('hasCamAccess')) {
                this.set('showWarning', true);
            } else {
                this.send('next');
            }
        },

        reloadRecorderButton() {
            console.log('exp-video-config: reload recorder button');
            this.set('showWarning', false);
            this.populateDropdowns();
            this.reloadRecorder();
        },

        reloadRecorderButtonAndRecordCheck() {
            console.log('exp-video-config: reload recorder button and record check');
            this.send('reloadRecorderButton');
            this.set('checkedWebcamPermissions', true);
        },

        processSelectedMic() {
            console.log('exp-video-config: process selected mic');
            var selectedMicId = $('select#audioSource')[0].value;
            if (selectedMicId) {
                LOOKIT_PREFERRED_DEVICES.mic = selectedMicId;
                this.reloadRecorder();
            }
        },

        processSelectedCam() {
            console.log('exp-video-config: process selected cam');
            var selectedCamId = $('select#videoSource')[0].value;
            if (selectedCamId) {
                LOOKIT_PREFERRED_DEVICES.cam = selectedCamId;
                this.reloadRecorder();
            }
        }
    },

    frameSchemaProperties: {
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

    type: 'exp-video-config',
    meta: {
        data: {
            type: 'object',
            properties: {
                screenWidth: {
                    type: 'number'
                },
                screenHeight: {
                    type: 'number'
                }
            }
        }
    },

    updateOptions: observer('hasCamAccess', function() {
        console.log('exp-video-config: update options observer');
        if (this.get('hasCamAccess')) {
            this.populateDropdowns();
        }
    }),

    didInsertElement() {
        console.log('exp-video-config: did insert element');
        this._super(...arguments);
        this.set('screenWidth', screen.width);
        this.set('screenHeight', screen.height);
        this.populateDropdowns();
    }
});

