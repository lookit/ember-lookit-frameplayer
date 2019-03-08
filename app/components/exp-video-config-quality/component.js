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
        if (this.get('requireItemConfirmation')) {
            this.set('readyToProceed', false);
        }
    },

    showCheckboxWarning: false,
    readyToProceed: true,

    uncheckedBoxes() {
        if (!this.get('requireItemConfirmation')) {
            return -1;
        }

        // returns index of first unchecked box, or -1 if all boxes are checked
        for (var i = 0; i < this.get('instructionBlocks').length; i++) {
            if (!$('#checkbox-' + i).prop('checked')) {
                this.set('readyToProceed', false);
                return i;
            }
        }
        this.set('readyToProceed', true);
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
                this.set('showCheckboxWarning', false);
            }
        },

        finish() {
            // If needed, display warning about checking all boxes and scroll to first unchecked
            if (this.get('requireItemConfirmation')) {
                let firstUnchecked = this.uncheckedBoxes();
                if (firstUnchecked != -1) {
                    this.set('showCheckboxWarning', true);
                    $('#instructions-' + firstUnchecked)[0].scrollIntoView({behavior: 'smooth', block: 'start'});
                }
            }

            // Actually proceed if ready
            if (this.get('readyToProceed')) {
                this.send('next');
            }
        },
    }
});
