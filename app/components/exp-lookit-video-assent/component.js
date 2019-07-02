import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { computed } from '@ember/object';

let {
    $
} = Em;

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video assent frame for Lookit studies for older children to agree to participation,
separately from parental consent.

```json
"frames": {
    "video-assent": {
        "kind": "exp-lookit-video-assent",
        ...
    }
}
```

@class ExpLookitVideoAssent
@extends ExpFrameBase

@uses VideoRecord
*/

export default ExpFrameBaseComponent.extend(VideoRecord, MediaReload, ExpandAssets, {
    layout,
    frameType: 'CONSENT',
    disableRecord: Em.computed('recorder.recording', 'recorder.hasCamAccess', function () {
        return !this.get('recorder.hasCamAccess') || this.get('recorder.recording');
    }),
    startedRecording: false,

    pageIndex: 0,

    noNext: computed('pageIndex', function() {
        return this.get('pageIndex') >= this.get('pages.length') - 1;
    }),

    noPrev: computed('pageIndex', function() {
        return this.get('pageIndex') <= 0;
    }),

    currentPage: computed('pageIndex', function() {
        return this.get('pages_parsed')[this.get('pageIndex')];
    }),


    assetsToExpand: {
        'audio': [],
        'video': ['pages/sources'],
        'image': ['pages/imgSrc']
    },

    actions: {

        nextVideo() {
            this.set('pageIndex', this.get('pageIndex') + 1);
        },
        previousVideo() {
            this.set('pageIndex', this.get('pageIndex') - 1);
        },

        record() {
            this.startRecorder().then(() => {
                this.set('startedRecording', true);
                // Require at least 3 s recording
                setTimeout(function() {
                    $('#submitbutton').prop('disabled', false);
                }, 3000);
            });
        },
        finish() {
            if (!this.get('stoppedRecording')) {
                this.stopRecorder().then(() => {
                    this.session.set('completedConsentFrame', true);
                    this.set('stoppedRecording', true);
                    this.send('next');
                });
            }
        },
        download() {
            // Get the text of the consent form to process. Split into lines, and remove
            // repeat empty lines. Start each new line with an indent.

            console.log(this);

            var origText = $('#consent-form-full-text').text().split(/\r?\n/);
            var trimmedText = [];
            var emptyLineWasLast = false;
            $.each(origText, function(idx, val) {
                if (val.trim() || !emptyLineWasLast) {
                    trimmedText.push('     ' + val.trim());
                    if (emptyLineWasLast) {
                        trimmedText.push('');
                    }
                }
                if (val.trim()) {
                    emptyLineWasLast = false;
                } else {
                    emptyLineWasLast = true;
                }
            });

            // Prep PDF - need to set font before splitting lines
            // jscs:disable requireCapitalizedConstructors
            var consentPDF = new jsPDF();
            // jscs:enable requireCapitalizedConstructors
            consentPDF.setFont('times');
            consentPDF.setFontSize(12);
            var timeString = moment().format('MMMM Do YYYY, h:mm:ss a'); // for header

            // Wrap lines so they'll fit nicely on the page
            var splitText = consentPDF.splitTextToSize(trimmedText, 150);

            // Split into pages
            var linesPerPage = 55;
            var nPages = Math.ceil(splitText.length / linesPerPage);
            for (var iPage = 0; iPage < nPages; iPage++) {
                // Header on each page
                consentPDF.setFontSize(10);
                consentPDF.text('Child assent form: ' + this.get('experiment').get('name'), 10, 10)
                consentPDF.text(timeString + ' (page ' + (iPage + 1) + ' of ' + nPages + ')', 10, 15);
                // Actual text for the page
                consentPDF.setFontSize(12);
                consentPDF.text(splitText.slice(linesPerPage * iPage, linesPerPage * (iPage + 1)), 25, 25);

                // Go to the next page
                if (iPage < (nPages - 1)) {
                    consentPDF.addPage();
                }
            }
            consentPDF.save('Lookit_study_child_assent_' + moment().format('YYYY_MM_DD') + '.pdf');

            /**
             * When participant downloads consent form
             *
             * @event downloadConsentForm
             */
            this.send('setTimeEvent', 'downloadConsentForm');
        }
    },

    meta: {
        name: 'Video assent form',
        description: 'A video assent form.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * A list of pages of assent form text/pictures/video for the participant to read through
                 *
                 * @property {Array} pages
                 *   @param {String} altText Alt-text used for the image displayed, if any
                 *   @param {Object[]} sources (Optional) String indicating video path relative to baseDir (see baseDir), OR Array of {src: 'url', type: 'MIMEtype'} objects.
                 *   @param {String} imgSrc (Optional) URL of image to display; can be full path or relative to baseDir
                 *   @param {Object[]} textBlocks list of text blocks to show on this page, processed by exp-text-block. Can use HTML.
                 */
                pages: {
                    type: 'array',
                    description: 'A list of videos to preview',
                    items: {
                        type: 'object',
                        properties: {
                            imgSrc: {
                                type: 'string',
                                default: ''
                            },
                            altText: {
                                type: 'string',
                                default: 'image'
                            },
                            sources: {
                                type: 'array',
                                default: [],
                                items: {
                                    type: 'object',
                                    properties: {
                                        src: {
                                            type: 'string'
                                        },
                                        type: {
                                            type: 'string'
                                        }
                                    },
                                    required: ['src', 'type']
                                }
                            },
                            textBlocks: {
                                type: 'array',
                                default: []
                            }
                        },
                        required: []
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
                 * Text of the question to ask about whether to participate. Answer options are Yes/No; No means study will stop, Yes means it will proceed.
                 *
                 * @property {String} participationQuestion
                 */
                participationQuestion: {
                    type: 'string',
                    description: 'Text on the button to proceed to the previous example video/image',
                    default: 'Do you want to participate in this study?'
                }
            },
            required: ['PIName', 'institution', 'PIContact', 'purpose', 'procedures', 'payment']
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} consentFormText the exact text shown in the consent document during this frame
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
                },
                consentFormText: {
                    type: 'string'
                }
            },
            required: ['videoId']
        }
    },


    didInsertElement() {
        this._super(...arguments);
        this.set('consentFormText', $('#consent-form-text').text());
    }
});
