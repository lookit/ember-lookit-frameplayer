import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

let {
    $
} = Em;

/**
 * @module exp-player
 * @submodule frames
 */

/*
Video consent frame for Lookit studies, with consent document displayed at left and instructions to start recording, read a statement out loud, and send. A standard consent
document is displayed, with additional study-specific information provided by the researcher, in accordance with the Lookit terms of use.

Researchers can select from the following named templates:

* `consent_001`: Original Lookit consent document (2019)

* `consent_002`: Added optional GDPR section and research subject rights statement

* `consent_003`: Same as consent_002 except that the 'Payment' section is renamed 'Benefits, risks, and payment' for institutions that prefer that

* `consent_004`: Same as consent_003 except that sentences in 'Data collection and webcam recording' are rearranged to make it clearer what happens if you withdraw video data, and the prompt says to read "out loud (or in ASL)" instead of just "out loud" for accessibility.

Important: To look up the exact text of each consent template for your IRB protocol, and to understand the context for each piece of text to be inserted, please see https://github.com/lookit/research-resources/tree/master/Legal

The consent document can be downloaded as PDF document by participant.

*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout: layout,
    frameType: 'CONSENT',
    disableRecord: Em.computed('recorder.recording', 'recorder.hasCamAccess', function () {
        return !this.get('recorder.hasCamAccess') || this.get('recorder.recording');
    }),
    startedRecording: false,
    hasCheckedVideo: false,
    hasMadeVideo: false,
    showWarning: false,

    startRecorderAndUpdateDisplay() {
        this.set('startedRecording', true); // keep track of if ANY recorder has been set up yet
        this.startRecorder().then(() => {
            // Require at least 2 s recording
            setTimeout(function() {
                $('#stopbutton').prop('disabled', false);
            }, 2000);
            $('#recordingIndicator').show();
            $('#recordingText').text('Recording');
        }, () => {
            $('#recordingText').text('Error starting recorder');
            $('#recordbutton').prop('disabled', false);
        });
    },

    actions: {
        record() {

            $('#recordingStatus').show();
            $('#recordingText').text('Starting recorder...');
            $('[id^=pipeMenu]').hide();
            $('#recordbutton').prop('disabled', true);
            $('#playbutton').prop('disabled', true);
            this.set('showWarning', false);
            this.set('hasCheckedVideo', false);
            this.set('hasMadeVideo', false);

            if (this.get('startedRecording')) {
                if (this.get('recorder') && this.get('recorder').get('recorder')) {
                    this.get('recorder').get('recorder').pause();
                }
                this.destroyRecorder(); // Need to destroy between recordings or else the same video ID is sent as payload.
                // Don't destroy after stopRecorder call because then can't replay.
                var _this = this;
                this.setupRecorder(_this.$(_this.get('recorderElement'))).then(() => {
                    _this.startRecorderAndUpdateDisplay();
                }, () => {
                    $('#recordingText').text('Error starting recorder');
                    $('#recordbutton').prop('disabled', false);
                });
            } else {
                this.startRecorderAndUpdateDisplay(); // First time - can use current recorder
            }

        },
        stop() {
            $('#recordingText').text('Stopping and uploading...');
            $('#recordingIndicator').hide();
            $('#stopbutton').prop('disabled', true);
            var _this = this;

            this.stopRecorder().finally(() => {
                _this.set('stoppedRecording', true);
                _this.set('hasMadeVideo', true);
                $('#recordingText').text('Not recording');
                $('#playbutton').prop('disabled', false);
                $('#recordbutton').prop('disabled', false);
            });

        },
        playvideo() {
            $('#recordingText').text('');
            $('#recordingStatus').hide();
            this.get('recorder').get('recorder').playVideo();
            $('[id^=pipeMenu]').show();
            this.set('hasCheckedVideo', true);
        },
        finish() {

            if (!this.get('hasMadeVideo') || !this.get('hasCheckedVideo')) {
                this.set('showWarning', true);
            } else {
                this.session.set('completedConsentFrame', true);
                this.send('next');
            }

        },
        download() {
            // Get the text of the consent form to process. Split into lines, and remove
            // repeat empty lines. Start each new line with an indent.
            var origText = $('#consent-form-text').text().split(/\r?\n/);
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
                consentPDF.text(timeString + ' (page ' + (iPage + 1) + ' of ' + nPages + ')', 10, 10);
                // Actual text for the page
                consentPDF.setFontSize(12);
                consentPDF.text(splitText.slice(linesPerPage * iPage, linesPerPage * (iPage + 1)), 25, 20);

                // Go to the next page
                if (iPage < (nPages - 1)) {
                    consentPDF.addPage();
                }
            }
            consentPDF.save('Lookit_study_consent_' + moment().format('YYYY_MM_DD') + '.pdf');

            /**
             * When participant downloads consent form
             *
             * @event downloadConsentForm
             */
            this.send('setTimeEvent', 'downloadConsentForm');
        }
    },

    frameSchemaProperties: {

        PIName: {
            type: 'string',
            description: 'Name of PI running this study'
        },

        institution: {
            type: 'string',
            description: 'Name of institution running this study'
        },

        PIContact: {
            type: 'string',
            description: 'Contact information for PI or lab'
        },

        purpose: {
            type: 'string',
            description: 'Brief description of purpose of study'
        },

        procedures: {
            type: 'string',
            description: 'Brief description of study procedures'
        },

        prompt_all_adults: {
            type: 'boolean',
            description: 'Whether to include instructions for any additional adults to consent',
            default: false
        },

        payment: {
            type: 'string',
            description: 'Statement about payment/compensation for participation'
        },

        datause: {
            type: 'string',
            description: 'Study-specific data use statement'
        },

        gdpr: {
            type: 'boolean',
            description: 'Whether to include a section on GDPR',
            default: false
        },

        gdpr_personal_data: {
            type: 'string',
            description: 'List of types of personal information collected'
        },

        gdpr_sensitive_data: {
            type: 'string',
            description: 'List of types of special category information collected'
        },

        research_rights_statement: {
            type: 'string',
            description: ' Statement about rights of research subjects and how to contact IRB'
        },

        additional_segments: {
            type: 'array',
            description: 'List of additional sections (objects with title and text fields) to include at end of form',
            items: {
                type: 'object',
                properties: {
                    'title': {
                        type: 'string'
                    },
                    'text': {
                        type: 'string'
                    }
                },
                required: ['title', 'text']
            },
            default: []
        },

        risk_statement: {
            type: 'string',
            description: 'Optional statement for under header "Are there any risks if you participate?". Used only in templates 5+.'
        },

        include_databrary: {
            type: 'boolean',
            default: false,
            description: 'Whether to include a paragraph about Databrary under "Who can see our webcam recordings?". Used only in templates 5+'
        },

        voluntary_participation: {
            type: 'string',
            description: 'Optional additional text for under header "Participation is voluntary", for instance to note that there are additional sessions which are also optional. Used only in templates 5+.'
        },

        additional_video_privacy_statement: {
            type: 'string',
            description: 'Optional additional text for under header "Who can see our webcam recordings". Only used in templates 5+'
        },

        benefits_header: {
            type: 'string',
            description: 'Header for the section on benefits & compensation',
            default: 'What are the benefits?'
        },

        risk_header: {
            type: 'string',
            description: 'Header for the section on risks, if risk_statement is included',
            default: 'What are the risks?'
        },

        template: {
            type: 'string',
            enum: ['consent_001', 'consent_002', 'consent_003', 'consent_004', 'consent_005'],
            description: 'Which consent document template to use',
            default: 'consent_001'
        }
    },

    frameSchemaRequired: ['PIName', 'institution', 'PIContact', 'purpose', 'procedures', 'payment', 'template'],

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
                * the exact text shown in the consent document during this frame
                * @attribute consentFormText
                */
                consentFormText: {
                    type: 'string'
                }
            },
            required: ['videoId']
        }
    },

    didInsertElement() {
        this._super(...arguments);
        let validTemplateNames = ['consent_001', 'consent_002', 'consent_003', 'consent_004'];
        if (!validTemplateNames.includes(this.get('template'))) {
            console.warn('Invalid consent form specified. \'template\' parameter of \'exp-lookit-video-consent\' frame should be one of: ' + validTemplateNames.join(' '));
        }
        this.set('consentFormText', $('#consent-form-text').text());
        $('#recordingIndicator').hide();
        $('#recordingText').text('Not recording yet');
        $('[id^=pipeMenu]').hide();
        $('#recordbutton').prop('disabled', false);
        $('#stopbutton').prop('disabled', true);
        $('#playbutton').prop('disabled', true);
    }
});
