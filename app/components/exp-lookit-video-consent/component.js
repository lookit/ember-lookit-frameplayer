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

* `consent_005`: A reworked and simplified template that fixes a lot of mildly confusing sentences. Adds a separate risk_statement to separate information about procedures, risks, and compensation/benefits.

* `consent_garden`: For Project GARDEN studies only.

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
        let _this = this;
        this.startRecorder().then(() => {
            // Require at least 2 s recording
            setTimeout(function() {
                $('#stopbutton').prop('disabled', false);
            }, 2000);
            $('#recordingIndicator').show();
            $('#recordingText').text(_this._translate('exp-lookit-video-consent.Recording'));
        }, () => {
            $('#recordingText').text(_this._translate('exp-lookit-video-consent.Error-starting-recorder'));
            $('#recordbutton').prop('disabled', false);
        });
    },

    actions: {
        record() {

            $('#recordingStatus').show();
            $('#recordingText').text(`${this._translate('exp-lookit-video-consent.Starting-recorder')}...`);
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
                    $('#recordingText').text(_this._translate('exp-lookit-video-consent.Error-starting-recorder'));
                    $('#recordbutton').prop('disabled', false);
                });
            } else {
                this.startRecorderAndUpdateDisplay(); // First time - can use current recorder
            }

        },
        stop() {
            $('#recordingText').text(`${this._translate('exp-lookit-video-consent.Stopping-and-uploading')}...`);
            $('#recordingIndicator').hide();
            $('#stopbutton').prop('disabled', true);
            var _this = this;

            this.stopRecorder().finally(() => {
                _this.set('stoppedRecording', true);
                _this.set('hasMadeVideo', true);
                $('#recordingText').text(_this._translate('exp-lookit-video-consent.Not-recording'));
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

        prompt_only_adults: {
            type: 'boolean',
            description: 'Whether to ask for consent ONLY for the adult (not on behalf of a child)',
            default: false
        },

        private_level_only: {
            type: 'boolean',
            default: false,
            description: 'Whether to describe only the "private" video sharing option (only for consent template 5+)'
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

        purpose_header: {
            type: 'string',
            description: 'Custom header for the section on study purpose',
            default: ''
        },

        procedures_header: {
            type: 'string',
            description: 'Custom header for the section on study procedures',
            default: ''
        },

        participation_header: {
            type: 'string',
            description: 'Custom header for the section on voluntary participation',
            default: ''
        },

        omit_injury_phrase: {
            type: 'boolean',
            description: 'Whether to omit the phrase "or in the very unlikely event of a research-related injury" from the contact section',
            default: false
        },

        benefits_header: {
            type: 'string',
            description: 'Custom header for the section on benefits & compensation',
            default: ''
        },

        risk_header: {
            type: 'string',
            description: 'Custom header for the section on risks, if risk_statement is included',
            default: ''
        },

        summary_statement: {
            type: 'string',
            description: 'Summary of consent form if required by IRB',
            default: ''
        },

        consent_statement_text: {
            type: 'string',
            description: 'Custom text for the consent statement to be read aloud.',
            default: ''
        },

        template: {
            type: 'string',
            enum: ['consent_001', 'consent_002', 'consent_003', 'consent_004', 'consent_005', 'consent_garden'],
            description: 'Which consent document template to use',
            default: 'consent_001'
        },

        // GARDEN template parameters
        study_info_description: {
            type: 'string',
            description: 'GARDEN only: Brief (one-sentence) description of study to insert into the study_info_content default text.'
        },

        purpose_content: {
            type: 'string',
            description: 'GARDEN only: Brief description of the purpose of the study. '
        },

        eligibility_content: {
            type: 'string',
            description: 'GARDEN only: Eligibility criteria.'
        },

        procedures_content: {
            type: 'string',
            description: 'GARDEN only: Statement summarizing study procedures.'
        },

        benefits_content: {
            type: 'string',
            description: 'GARDEN only: Statement summarizing the benefits of the research to the family or to society.'
        },

        data_sharing_learn: {
            type: 'string',
            description: 'GARDEN only: Statement about what additional things might be learned from the data from this specific study.'
        },

        irb_contact: {
            type: 'string',
            description: 'GARDEN only: Contact info for the research rights/IRB section.'
        },

        risk_content_additional: {
            type: 'string',
            description: 'GARDEN only: Additional risk statement to be added after the default text'
        },
        
        risk_content_discontinue_options: {
            type: 'string',
            description: 'GARDEN only: Additional study-specific discontinue options to be inserted into the default statement.'
        },

        risk_content_breach_of_confidentiality: {
            type: 'string',
            description: 'GARDEN only: Breach of confidentiality statement, if required by your IRB.'
        },

        data_collection_omit_video: {
            type: 'boolean',
            default: false, 
            description: 'GARDEN only: Whether or not to omit the video recordings data type form the data collection section.'
        },
        
        include_irb_contact_statement: {
            type: 'boolean',
            default: false, 
            description: 'GARDEN only: Whether or not to include the "IRB may contact you" sentence in the research rights/IRB section.'
        },
        
        irb_extra : {
            type: 'string',
            description: 'GARDEN only: Use this parameter to provide any additional institution IRB specific information.'
        },

        header: {
            type: 'string',
            description: 'GARDEN only: Custom header.'
        },

        intro_sentence: {
            type: 'string',
            description: 'GARDEN only: Custom intro sentence'
        },

        overview_header: {
            type: 'string',
            description: 'GARDEN only: Custom overview header.'
        },

        overview_content: {
            type: 'string',
            description: 'GARDEN only: Custom overview content.'
        },

        study_info_header: {
            type: 'string',
            description: 'GARDEN only: Custom study info header.'
        },

        study_info_content: {
            type: 'string',
            description: 'GARDEN only: Custom study info content.'
        },

        eligibility_header : {
            type: 'string',
            description: 'GARDEN only: Custom eligibility header.'
        },

        duration_statement: {
            type: 'string',
            description: 'GARDEN only: Custom duration statement.'
        },

        payment_header: {
            type: 'string',
            description: 'GARDEN only: Custom payment header.'
        },

        payment_content: {
            type: 'string',
            description: 'GARDEN only: Custom payment content.'
        },

        risk_content: {
            type: 'string',
            description: 'GARDEN only: Custom risk content.'
        },

        data_collection_header: {
            type: 'string',
            description: 'GARDEN only: Custom data collection header.'
        },

        data_collection_content: {
            type: 'string',
            description: 'GARDEN only: Custom data collection content.'
        },

        data_use_header: {
            type: 'string',
            description: 'GARDEN only: Custom data use header.'
        },

        data_use_content: {
            type: 'string',
            description: 'GARDEN only: Custom data use content.'
        },

        data_access_header: {
            type: 'string',
            description: 'GARDEN only: Custom data access header.'
        },

        data_access_content: {
            type: 'string',
            description: 'GARDEN only: Custom data access content.'
        },

        data_management_header: {
            type: 'string',
            description: 'GARDEN only: Custom data management header.'
        },

        data_management_content: {
            type: 'string',
            description: 'GARDEN only: Custom data management content.'
        },

        data_sharing_header: {
            type: 'string',
            description: 'GARDEN only: Custom data sharing header.'
        },

        data_sharing_content: {
            type: 'string',
            description: 'GARDEN only: Custom data sharing content.'
        },

        research_rights_irb_header: {
            type: 'string',
            description: 'GARDEN only: Custom Research Rights / IRB header.'
        },

        research_rights_irb_content: {
            type: 'string',
            description: 'GARDEN only: Custom Research Rights / IRB content.'
        },

        lookit_info_header: {
            type: 'string',
            description: 'GARDEN only: Custom Lookit Info header.'
        },

        lookit_info_content: {
            type: 'string',
            description: 'GARDEN only: Custom Lookit Info content.'
        },

        voluntary_participation_header: {
            type: 'string',
            description: 'GARDEN only: Custom voluntary participation header.'
        },

        voluntary_participation_content: {
            type: 'string',
            description: 'GARDEN only: Custom voluntary participation content.'
        },

        video_sharing_header: {
            type: 'string',
            description: 'GARDEN only: Custom video sharing header.'
        },

        video_sharing_consent: {
            type: 'string',
            description: 'GARDEN only: Custom video sharing consent content.'
        },

        video_sharing_study: {
            type: 'string',
            description: 'GARDEN only: Custom video sharing study content.'
        },

        databrary_content: {
            type: 'string',
            description: 'GARDEN only: Custom databrary content.'
        },

        publication_header: {
            type: 'string',
            description: 'GARDEN only: Custom publication header.'
        },

        publication_content: {
            type: 'string',
            description: 'GARDEN only: Custom publication content.'
        },

        contact_header : {
            type: 'string',
            description: 'GARDEN only: Custom contact header.'
        },

        contact_content: {
            type: 'string',
            description: 'GARDEN only: Custom contact content.'
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
        let validTemplateNames = ['consent_001', 'consent_002', 'consent_003', 'consent_004', 'consent_005', 'consent_garden'];
        if (!validTemplateNames.includes(this.get('template'))) {
            console.warn('Invalid consent form specified. \'template\' parameter of \'exp-lookit-video-consent\' frame should be one of: ' + validTemplateNames.join(' '));
        }
        this.set('consentFormText', $('#consent-form-text').text());
        $('#recordingIndicator').hide();
        $('#recordingText').text(this._translate('exp-lookit-video-consent.Not-recording-yet'));
        $('[id^=pipeMenu]').hide();
        $('#recordbutton').prop('disabled', false);
        $('#stopbutton').prop('disabled', true);
        $('#playbutton').prop('disabled', true);
    }
});
