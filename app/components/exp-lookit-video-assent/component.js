import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { audioAssetOptions, videoAssetOptions, imageAssetOptions } from '../../mixins/expand-assets';
import { computed } from '@ember/object';

let {
    $
} = Em;

/**
 * @module exp-player
 * @submodule frames
 */

/**


@class Exp-lookit-video-assent
@extends Exp-frame-base

@uses Video-record
@uses Expand-assets
*/

export default ExpFrameBaseComponent.extend(VideoRecord, ExpandAssets, {
    layout,
    frameType: 'CONSENT',
    disableRecord: Em.computed('recorder.recording', 'recorder.hasCamAccess', function () {
        return !this.get('recorder.hasCamAccess') || this.get('recorder.recording');
    }),
    startedRecording: false,

    pageIndex: null,
    readAllPages: false,

    noNext: computed('pageIndex', 'hasCompletedThisPageAudio', 'hasCompletedThisPageVideo', function() {
        return (this.get('pageIndex') >= this.get('pages.length') - 1) || (!this.get('hasCompletedThisPageAudio')) || (!this.get('hasCompletedThisPageVideo'));
    }),

    noPrev: computed('pageIndex', function() {
        return this.get('pageIndex') <= 0;
    }),

    currentPage: computed('pageIndex', function() {
        return this.get('pages_parsed')[this.get('pageIndex')];
    }),

    pageHasAudio: computed('pageIndex', function() {
        return !!this.get('pages_parsed')[this.get('pageIndex')].audio;
    }),

    pageHasVideo: computed('pageIndex', function() {
        return !!this.get('pages_parsed')[this.get('pageIndex')].video;
    }),

    hasCompletedEachPageAudio: [false], // start off with just covering page 0, populate in didInsert
    hasCompletedEachPageVideo: [false],

    hasCompletedThisPageAudio: false, // Track state of current page for blocking 'continue' action
    hasCompletedThisPageVideo: false,

    childResponse: false,

    /**
     * @property {Boolean} startRecordingAutomatically
     * @private
     */
    startRecordingAutomatically: Em.computed.alias('recordWholeProcedure'),

    /**
     * @property {Boolean} showWaitForRecordingMessage
     * @private
     */
    showWaitForRecordingMessage: false,

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

    assetsToExpand: {
        'audio': ['pages/audio'],
        'video': ['pages/video'],
        'image': ['pages/imgSrc']
    },

    // Utility to play audio/video object and avoid failing to actually trigger play for
    // dumb browser reasons / race conditions
    playMedia(mediaObj) {
        mediaObj.pause();
        mediaObj.load();
        mediaObj.currentTime = 0;
        mediaObj.play().then(() => {
        }).catch(() => {
            mediaObj.play();
        }
        );
    },

    updatePage() {
        if (this.get('recordLastPage') && !this.get('recordWholeProcedure') && (this.get('pageIndex') === this.get('pages').length - 1)) {
            this.startRecorder();
        }
        if (this.get('pageHasAudio')) {
            this.playMedia($('audio#assent-audio')[0]);
        }
        if (this.get('pageHasVideo')) {
            this.playMedia($('video#assent-video')[0]);
        }
        this.set('hasCompletedThisPageAudio', this.get('hasCompletedEachPageAudio')[this.get('pageIndex')]);
        this.set('hasCompletedThisPageVideo', this.get('hasCompletedEachPageVideo')[this.get('pageIndex')]);
    },

    actions: {

        nextVideo() {
            this.set('pageIndex', this.get('pageIndex') + 1);
            if ((this.get('pageIndex') === this.get('pages').length - 1) && !this.get('pageHasAudio') && !this.get('pageHasVideo')) {
                this.set('readAllPages', true);
            }
            /**
             * Participant proceeded to next assent page
             *
             * @event nextAssentPage
             * @param {Number} pageNumber which assent page was viewed (zero-indexed)
             */
            this.send('setTimeEvent', 'nextAssentPage',
                {pageNumber: this.get('pageIndex')});
            this.updatePage();
        },

        previousVideo() {
            this.set('pageIndex', this.get('pageIndex') - 1);
            /**
             * Participant returned to previous assent page
             *
             * @event previousAssentPage
             * @param {Number} pageNumber which assent page was viewed (zero-indexed)
             */
            this.send('setTimeEvent', 'previousAssentPage',
                {pageNumber: this.get('pageIndex')});
            this.updatePage();
        },

        selectYes() {
            this.set('childResponse', 'Yes');
        },

        selectNo() {
            this.set('childResponse', 'No');
        },

        submit() {
            this.session.set('completedConsentFrame', true);
            /**
             * Participant submitted assent question answer
             *
             * @event assentQuestionSubmit
             * @param {String} childResponse child response submitted ('Yes' or 'No')
             */
            this.send('setTimeEvent', 'assentQuestionSubmit',
                {childResponse: this.get('childResponse')});

            var _this = this;
            if (_this.get('childResponse') === 'Yes') {
                this.stopRecorder().then(() => {
                    _this.send('next');
                }, () => {
                    _this.send('next');
                });
            } else {
                _this.send('exit');
            }
        },

        audioCompleted() {
            this.get('hasCompletedEachPageAudio')[this.get('pageIndex')] = true;
            this.set('hasCompletedThisPageAudio', true);

            if (this.get('pageIndex') === this.get('pages').length - 1) {
                this.set('readAllPages', true);
            }
        },

        videoCompleted() {
            this.get('hasCompletedEachPageVideo')[this.get('pageIndex')] = true;
            this.set('hasCompletedThisPageVideo', true);

            if (this.get('pageIndex') === this.get('pages').length - 1) {
                this.set('readAllPages', true);
            }
        },

        download() {
            // Get the text of the consent form to process. Split into lines, and remove
            // repeat empty lines. Start each new line with an indent.

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
            var consentPDF = new jsPDF();
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
                consentPDF.text('Child assent form: ' + this.get('experiment').get('name'), 10, 10);
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
             * @event downloadAssentForm
             */
            this.send('setTimeEvent', 'downloadAssentForm');
        }
    },

    frameSchemaProperties: {
        /**
         * A list of pages of assent form text/pictures/video for the participant to read through
         *
         * @property {Array} pages
         *   @param {String} altText Alt-text used for the image displayed, if any
         *   @param {Object[]} video (Optional) String indicating video path relative to baseDir (see baseDir), OR Array of {src: 'url', type: 'MIMEtype'} objects. Video will be displayed (with controls shown) and participant must complete to proceed.
         *   @param {Object[]} audio (Optional) String indicating audio path relative to baseDir (see baseDir), OR Array of {src: 'url', type: 'MIMEtype'} objects. Audio will be played (with controls shown) and participant must complete to proceed.
         *   @param {String} imgSrc (Optional) URL of image to display; can be full path or relative to baseDir
         *   @param {Object[]} textBlocks list of text blocks to show on this page, processed by exp-text-block. Can use HTML.
         *   @param {Boolean} showWebcam Whether to display the participant webcam on this page
         */
        pages: {
            type: 'array',
            description: 'A list of videos to preview',
            items: {
                type: 'object',
                properties: {
                    imgSrc: {
                        anyOf: imageAssetOptions,
                        default: ''
                    },
                    altText: {
                        type: 'string',
                        default: 'image'
                    },
                    video: {
                        anyOf: videoAssetOptions,
                        default: []
                    },
                    audio: {
                        anyOf: audioAssetOptions,
                        default: []
                    },
                    textBlocks: {
                        type: 'array',
                        default: []
                    },
                    showWebcam: {
                        type: 'boolean',
                        default: false
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
         * Whether to record webcam video on the last page
         *
         * @property {Boolean} recordLastPage
         */
        recordLastPage: {
            type: 'boolean',
            description: 'Whether to record webcam video on the last page',
            default: false
        },
        /**
         * Whether to record webcam video during the entire assent frame (if true, overrides recordLastPage)
         *
         * @property {Boolean} recordWholeProcedure
         */
        recordWholeProcedure: {
            type: 'boolean',
            description: 'Whether to record webcam video during the entire assent frame',
            default: false
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
        },
        /**
         * How many years old the child has to be for this page to be shown. If child
         * is younger, the page is skipped. Leave at 0 to always show. This is an
         * age in 'calendar years' - it will line up with the child's birthday,
         * regardless of leap years etc.
         *
         * @property {String} minimumYearsToAssent
         */
        minimumYearsToAssent: {
            type: 'number',
            description: 'How many years old the child has to be for this page to be shown',
            default: 0
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
                },
                /**
                * the exact text shown in the assent document during this frame
                * @attribute assentFormText
                */
                assentFormText: {
                    type: 'string'
                },
                /**
                * The child's response to the assent question - Yes or No
                * @attribute childResponse
                */
                childResponse: {
                    type: 'string'
                }
            },
            required: []
        }
    },

    didInsertElement() {
        this._super(...arguments);
        this.set('assentFormText', $('#consent-form-full-text').text());

        var hasCompletedEachPageAudio = [];
        for (let iPage = 0; iPage < this.get('pages_parsed').length; iPage++) {
            hasCompletedEachPageAudio[iPage] = !this.get('pages_parsed')[iPage].audio; // count as completed if no audio
        }
        this.set('hasCompletedEachPageAudio', hasCompletedEachPageAudio);

        var hasCompletedEachPageVideo = [];
        for (let iPage = 0; iPage < this.get('pages_parsed').length; iPage++) {
            hasCompletedEachPageVideo[iPage] = !this.get('pages_parsed')[iPage].video; // count as completed if no video
        }
        this.set('hasCompletedEachPageVideo', hasCompletedEachPageVideo);

        this.set('pageIndex', -1);
        this.send('nextVideo');

        if (this.get('session').get('child') && this.get('session').get('child').get('birthday')) { // always show frame in preview mode
            var dob = this.get('session').get('child').get('birthday');

            // var ageInDays = ((new Date()) - dob)/(1000*60*60*24);
            // Calculate age in full years (i.e., will line up with how many years old the
            // child is considered, will not vary based on whether some of those years have been
            // leap years)
            var today = new Date();
            var beforeBirthday = 0;
            if (today.getMonth() < dob.getMonth() || ((today.getMonth() == dob.getMonth()) && today.getDate() < dob.getDate())) {
                beforeBirthday = 1;
            }
            var ageInYears = today.getFullYear() - dob.getFullYear() - beforeBirthday;

            if (this.get('minimumYearsToAssent') && ageInYears < this.get('minimumYearsToAssent')) {
                /**
                 * Skip the assent form because the participant is too young to give assent
                 *
                 * @event skipAssentDueToParticipantAge
                 */
                this.send('setTimeEvent', 'skipAssentDueToParticipantAge');
                this.send('next');
            }
        }
    }

});
