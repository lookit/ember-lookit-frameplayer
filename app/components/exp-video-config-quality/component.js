import layout from './template';

import Ember from 'ember';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

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
            }
        ]
    }
}
```

@class ExpVideoConfigQuality
@extends ExpFrameBase
@extends VideoRecord

*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,

    type: 'exp-video-config-quality',
    maxRecordingLength: 60,
    meta: {
        name: 'Video Recorder Configuration for preferential looking',
        description: 'Video configuration frame showing webcam view at right and instructions for checking video quality for preferential looking setup at left, with pictures.',
        parameters: {
            type: 'object',
            properties: {
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
                Whether to require participant to make and view a test video
                @property {Boolean} requireTestVideo
                @default true
                */
                requireTestVideo: {
                    type: 'boolean',
                    description: 'Whether to require participant to record and view a test video',
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
                {{#crossLink "ExpTextBlock"}}{{/crossLink}}, so all parameters
                of ExpTextBlock can be used.
                @property {Object} instructionBlocks
                  @param {String} text instructions text (can include html)
                  @param {Object} image image to display, with 'src' & 'alt' attributes
                @default ""
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
            required: []
        },
        data: {
            type: 'object',
            properties: {}
        }
    },

    didInsertElement() {
        this._super(...arguments);
        this.checkIfDone();
    },

    showCheckboxWarning: false,
    showRecorderWarning: false,

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
        let recordCheck = !this.get('requireTestVideo') || (this.get('recorder.hasCreatedRecording') && this.get('recorder.hasPlayedBack'));
        if (recordCheck) {
            this.set('showRecorderWarning', false);
        }

        // The Pipe menu takes a little while to get set up, so if we try to bind an
        // event to it e.g. upon didRender, it doesn't end up bound. Additionally, the
        // #pipeRec and #pipePlay buttons have their behavior OVERWRITTEN by Pipe,
        // e.g. pipePlay's handler changes after there's a recording available, so
        // we don't want to bind to those. But adding the handler here means that at
        // least once someone tries to proceed by clicking 'next', they'll now get an
        // update on when the condition is met - and other actions like clicking checkboxes
        // will also trigger this so we can ensure that the 'next' button doesn't look
        // disabled once the user can proceed.
        var _this = this;
        $('#pipeMenu').off('click');
        $('#pipeMenu').click(function() {
            _this.checkIfDone();
        });

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

    actions: {
        checkboxChanged(idx) {
            if ($('#checkbox-' + idx).prop('checked')) {
                let $nextInstruction = $('#instructions-' + (idx + 1));
                if ($nextInstruction.length) {
                    $nextInstruction[0].scrollIntoView({behavior: 'smooth', block: 'start'});
                }
            }
            if (this.uncheckedBoxes() == -1) {
                this.set('completedBoxes', true);
                this.checkIfDone();
            } else {
                this.set('completedBoxes', false);
                this.checkIfDone();
            }
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
            if (this.get('requireTestVideo') && (!this.get('recorder.hasCreatedRecording') || !this.get('recorder.hasPlayedBack'))) {
                this.set('showRecorderWarning', true);
            }

            // Actually proceed if ready
            if (this.get('readyToProceed')) {
                this.send('next');
            }
        },

        reloadRecorder() {
            this.set('showWarning', false);
            this.destroyRecorder();
            this.setupRecorder(this.$(this.get('recorderElement')), false);
        },
    }
});
