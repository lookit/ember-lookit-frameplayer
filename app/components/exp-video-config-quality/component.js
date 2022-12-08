import layout from './template';

import Ember from 'ember';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import { observer } from '@ember/object';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video configuration frame showing webcam view at right and instructions for checking
video quality for preferential looking setup at left. Default content is hard-coded to
provide a reasonable set of instructions for preferential looking setups, so the frame can
be used as follows with no parameters besides `kind`:

```json
"frames": {
    "video-quality": {
        "kind": "exp-video-config-quality"
    }
}
```

Optionally,
participants can be required to check off each item before they can proceed to the next
frame. If `requireItemConfirmation` is true (default), then the 'next' button will
appear disabled until the participant has checked off all buttons, although if they click
it anyway they will get an informative warning and the instructions section will scroll
to the first unchecked item.

Participants can also be optionally required to create and view a short recording, e.g. to
check their child will be audible or their child's eyes will be visible in a particular position.

You can also customize any or all text and images as in the following example.

```json
"frames": {
    "video-quality": {
        "kind": "exp-video-config-quality",
        "title": "Webcam setup for preferential looking",
        "introText": "We'll be analyzing where your child chooses to look during the videos--but only if we can tell where that is! Please check each of the following to ensure we're able to use your video:",
        "requireItemConfirmation": true,
        "completedItemText": "Did it!",
        "instructionBlocks": [
                    {
                        "text": "<strong>Make sure the webcam you're using is roughly centered</strong> relative to this monitor. This makes it much easier for us to tell whether your child is looking to the left or right!",
                        "image": {
                            "src": "https://s3.amazonaws.com/lookitcontents/website/centering.png",
                            "alt": "Example images of using centered external webcam on monitor or built-in webcam on laptop."
                        }
                    },
                    {
                        "text": "<strong>Turn off any other monitors</strong> connected to your computer, besides the one with the centered webcam. (If there's just one monitor, you're all set!)",
                        "image": {
                            "src": "https://s3.amazonaws.com/lookitcontents/website/monitors.png",
                            "alt": "Example images showing laptop screen turned off if using external monitor and webcam, or external monitor turned off if using built-in webcam and laptop screen."
                        }
                    },
                    {
                        "text": "Check the lighting by making sure you can <strong>clearly see your own eyes</strong> on the webcam view to the right. You may need to either turn on a light or reduce light coming from behind you.",
                        "image": {
                            "src": "https://s3.amazonaws.com/lookitcontents/website/lighting.png",
                            "alt": "Example images showing good lighting, room too dark, and backlit scene where eyes are not visible."
                        }
                    },
                    {
                        "text": "If it's practical, <strong>minimize exciting things</strong> that are visible behind or to the side of the screen--for instance, by facing a wall instead of the kitchen. (If this isn't practical for you, don't worry about it--just check the box!)",
                        "image": {
                            "src": "https://s3.amazonaws.com/lookitcontents/website/distractions.png",
                            "alt": "Example images showing a child and puppy next to the computer, versus a computer just on its own."
                        }
                    },
                    {
                        "text": "During the study, we'll ask that you sit facing away from the monitor, holding your child over your shoulder, like this. (More on that in a moment!) <strong>Make sure the webcam is angled up or down enough that your child's eyes are visible in this position</strong>. If you're not sure if your child's eyes will be visible, you can make a short recording to check!",
                        "image": {
                            "src": "https://s3.amazonaws.com/lookitcontents/website/over_shoulder.jpg",
                            "alt": "Example image showing a dad holding his child looking over his shoulder."
                        }
                    }
                ],
            "requireTestVideo": true,
            "showRecordMenu": true,
            "recordingInstructionText": "You should be able to see your camera view above. You can create and view a short recording to see how your setup looks."
    }
}
```

@class Exp-video-config-quality
@extends Exp-frame-base
@extends Video-record

*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,

    type: 'exp-video-config-quality',
    maxRecordingLength: 60,

    /**
     * @property {Boolean} startRecordingAutomatically
     * @private
     */

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
        Text to show as the introduction to the list of things to check. Can include
        HTML.
        @property {String} introText
        @default ""
        */
        introText: {
            type: 'string',
            description: 'Text to show as the introduction to the list of things to check',
            default: 'We\'ll be analyzing where your child chooses to look during the videos--but only if we can tell where that is! Please check each of the following to ensure we\'re able to use your video:'
        },
        /**
        Title to display to participant
        @property {String} title
        @default ""
        */
        title: {
            type: 'string',
            description: 'Title to display to participant',
            default: 'Webcam setup for preferential looking'
        },
        /**
        Whether to show checkboxes under each instruction item and require
        participant to check them off to proceed.
        @property {Boolean} requireItemConfirmation
        @default true
        */
        requireItemConfirmation: {
            type: 'boolean',
            description: 'Whether to show checkboxes under each instruction item',
            default: true
        },
        /**
        Whether to require participant to make and view a test video. Ignored if
        showRecordMenu is false.
        @property {Boolean} requireTestVideo
        @default true
        */
        requireTestVideo: {
            type: 'boolean',
            description: 'Whether to require participant to record and view a test video',
            default: true
        },
        /**
        Whether to display record/replay menu to participant. If false,
        requireTestVideo value is ignored.
        @property {Boolean} showRecordMenu
        @default true
        */
        showRecordMenu: {
            type: 'boolean',
            description: 'Whether to display record/replay menu to participant',
            default: true
        },
        /**
        Text to show below the webcam view. For instance, you might instruct
        families to make a short recording in the position they will be in for the
        experiment, and make sure that the infant's eyes are visible or that the
        child is audible. HTML is allowed.
        @property {String} recordingInstructionText
        @default "Did it!"
        */
        recordingInstructionText: {
            type: 'string',
            description: 'Text to show below the webcam view',
            default: 'You should be able to see your camera view above. You can create and view a short recording to see how your setup looks.'
        },
        /**
        Text to show next to instructions checkboxes, if participant is required
        to check off each instruction (see requireItemConfirmation). Ignored if
        requireItemConfirmation is false.
        @property {String} completedItemText
        @default "Did it!"
        */
        completedItemText: {
            type: 'string',
            description: 'Text to show next to instructions checkboxes',
            default: 'Did it!'
        },
        /**
        List of instruction segments to display to participant. Rendered using
        {{#crossLink "Exp-text-block"}}{{/crossLink}}, so all parameters
        of ExpTextBlock can be used.
        @property {Object} instructionBlocks
          @param {String} text instructions text (can include html)
          @param {Object} image image to display, with 'src' & 'alt' attributes
        @default [set of standard instructions]
        */
        instructionBlocks: {
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
            },
            description: 'List of instruction segments to display',
            default: [
                {
                    text: '<strong>Make sure the webcam you\'re using is roughly centered</strong> relative to this monitor. This makes it much easier for us to tell whether your child is looking to the left or right!',
                    image: {
                        src: 'assets/centering.png',
                        alt: 'Example images of using centered external webcam on monitor or built-in webcam on laptop.'
                    }
                },
                {
                    text: '<strong>Turn off any other monitors</strong> connected to your computer, besides the one with the centered webcam. (If there\'s just one monitor, you\'re all set!)',
                    image: {
                        src: 'assets/monitors.png',
                        alt: 'Example images showing laptop screen turned off if using external monitor and webcam, or external monitor turned off if using built-in webcam and laptop screen.'
                    }
                },
                {
                    text: 'Check the lighting by making sure you can <strong>clearly see your own eyes</strong> on the webcam view to the right. You may need to either turn on a light or reduce light coming from behind you.',
                    image: {
                        src: 'assets/lighting.png',
                        alt: 'Example images showing good lighting, room too dark, and backlit scene where eyes are not visible.'
                    }
                },
                {
                    text: 'During the study, we\'ll ask that you sit facing away from the monitor, holding your child over your shoulder, like this. (More on that in a moment!) <strong>Make sure the webcam is angled up or down enough that your child\'s eyes are visible in this position</strong>.',
                    image: {
                        src: 'assets/over_shoulder.jpg',
                        alt: 'Example image showing a dad holding his child looking over his shoulder.'
                    }
                },
                {
                    text: 'If it\'s practical, <strong>minimize exciting things</strong> that are visible behind or to the side of the screen--for instance, by facing a wall instead of the kitchen. (If this isn\'t practical for you, don\'t worry about it--just check the box!)',
                    image: {
                        src: 'assets/distractions.png',
                        alt: 'Example images showing a child and puppy next to the computer, versus a computer just on its own.'
                    }
                }
            ]
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

    didInsertElement() {
        this._super(...arguments);
        this.checkIfDone();

        if (!this.get('showRecordMenu')) {
            this.set('requireTestVideo', false);
            $('.exp-video-config-quality').append($('<style>') // CSS rule so that persists if element reloaded
                .prop('type', 'text/css')
                .prop('id', 'exp-video-config-quality-hide-record-buttons')
                .html('.exp-video-config-quality div[id^="pipeMenu"] {visibility: hidden; display: none !important;}'));
        } else {
            $('#exp-video-config-quality-hide-record-buttons').remove();
        }
    },

    showCheckboxWarning: false,
    showRecorderWarning: false,
    hasPlayedBack: false,

    completedBoxes: false,
    readyToProceed: false,

    checkIfDone() {
        // Checks if conditions are met to move on from this frame, setting 'readyToProceed'
        // accordingly. REMOVES warnings if appropriate, but does not add them (so that
        // warnings are only shown if the user tries to proceed too soon, not immediately)

        // See if checkboxes are all checked (if required)
        let boxCheck = !this.get('requireItemConfirmation') || this.get('completedBoxes');
        if (boxCheck) {
            this.set('showCheckboxWarning', false);
        }

        // See if recording has been made and viewed (if required)
        let recordCheck = !this.get('requireTestVideo') || (this.get('recorder.hasCreatedRecording') && this.get('hasPlayedBack'));
        if (recordCheck) {
            this.set('showRecorderWarning', false);
        }

        this.set('readyToProceed', boxCheck && recordCheck);
    },

    uncheckedBoxes() {
        if (!this.get('requireItemConfirmation')) {
            return -1;
        }

        // returns index of first unchecked box, or -1 if all boxes are checked
        for (var i = 0; i < this.get('instructionBlocks').length; i++) {
            if (!$('#checkbox-' + i).prop('checked')) {
                this.set('completedBoxes', false);
                return i;
            }
        }
        this.set('completedBoxes', true);
        return -1;
    },

    /**
     * Observer that adds listener for play button once recorder is ready.
     * @method whenPossibleToRecord
     */
    videoConfigRecordingObserver: observer('recorder.hasCamAccess', 'recorderReady', function() {
        // The Pipe menu takes a little while to get set up, so if we try to bind an
        // event to it e.g. upon didRender, it doesn't end up bound. Additionally, the
        // #pipeRec and #pipePlay buttons have their behavior OVERWRITTEN by Pipe,
        // e.g. pipePlay's handler changes after there's a recording available, so
        // we don't want to bind to those.
        var _this = this;
        if (this.get('recorder') && this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
            this.get('recorder').on('btPlayPressed', (recId) => {   // eslint-disable-line no-unused-vars
                _this.set('hasPlayedBack', true);
                _this.checkIfDone();
            });

            this.get('recorder').on('btStopRecordingPressed', (recId) => {   // eslint-disable-line no-unused-vars
                _this.get('recorder').set('_recording', false); // so we don't also call stop when leaving page unless needed
                _this.set('stoppedRecording', true);
            });

        }
    }),

    actions: {
        checkboxChanged(idx) {
            if ($('#checkbox-' + idx).prop('checked')) {
                let $nextInstruction = $('#instructions-' + (idx + 1));
                if ($nextInstruction.length) {
                    $nextInstruction[0].scrollIntoView({behavior: 'smooth', block: 'start'});
                }
            }
            this.set('completedBoxes', this.uncheckedBoxes() == -1);
            this.checkIfDone();
        },

        finish() {

            this.checkIfDone();

            // If needed, display warning about checking all boxes and scroll to first unchecked.
            // (note - removal of warnings done in checkIfDone)
            if (this.get('requireItemConfirmation')) {
                let firstUnchecked = this.uncheckedBoxes();
                if (firstUnchecked != -1) {
                    this.set('showCheckboxWarning', true);
                    $('#instructions-' + firstUnchecked)[0].scrollIntoView({behavior: 'smooth', block: 'start'});
                }
            }

            // If needed, display warning about making a recording
            if (this.get('requireTestVideo') && (!this.get('recorder.hasCreatedRecording') || !this.get('hasPlayedBack'))) {
                this.set('showRecorderWarning', true);
            }

            // Actually proceed if ready
            if (this.get('readyToProceed')) {
                this.send('next');
            }
        },

        reloadRecorder() {
            this.set('showWarning', false);
            this.set('hasPlayedBack', false);
            this.destroyRecorder();
            this.setupRecorder(this.$(this.get('recorderElement')));
        },
    }
});
