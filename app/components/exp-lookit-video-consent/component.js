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

/**
Video consent frame for Lookit studies, with consent document displayed at left and instructions to start recording, read a statement out loud, and send. A standard consent
document is displayed, with additional study-specific information provided by the researcher, in accordance with the Lookit terms of use.

Researchers can select from the following named templates:

* `consent_001`: Original Lookit consent document (2019)

* `consent_002`: Added optional GDPR section and research subject rights statement

* `consent_003`: Same as consent_002 except that the 'Payment' section is renamed 'Benefits, risks, and payment' for institutions that prefer that

Important: To look up the exact text of each consent template for your IRB protocol, and to understand the context for each piece of text to be inserted, please see https://github.com/lookit/research-resources/tree/master/Legal

The consent document can be downloaded as PDF document by participant.

```json
"frames": {
    "video-consent": {
        "kind": "exp-lookit-video-consent",
        "template": "consent_003",
        "PIName": "Jane Smith",
        "institution": "Science University",
        "PIContact": "Jane Smith at 123 456 7890",
        "purpose": "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails.",
        "procedures": "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses.",
        "payment": "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience. There are no anticipated risks associated with participating.",
        "datause": "We are primarily interested in your child's emotional reactions to the images and sounds. A research assistant will watch your video to measure the precise amount of delight in your child's face as he or she sees each cat picture.",
        "gdpr": false,
        "research_rights_statement": "You are not waiving any legal claims, rights or remedies because of your participation in this research study.  If you feel you have been treated unfairly, or you have questions regarding your rights as a research subject, you may contact the [IRB NAME], [INSTITUTION], [ADDRESS/CONTACT]",
        "additional_segments": [
                {
                    "title": "US Patriot Act Disclosure",
                    "text": "[EXAMPLE ONLY, PLEASE REMOVE ADDITIONAL_SEGMENTS UNLESS YOU NEED THEM.] Lookit is a U.S. organization and all information gathered from the website is stored on servers based in the U.S. Therefore, your video recordings are subject to U.S. laws, such as the US Patriot Act. This act allows authorities access to the records of internet service providers. If you choose to participate in this study, you understand that your video recording will be stored and accessed in the USA. The security and privacy policy for Lookit can be found at the following link: <a href='https://lookit.mit.edu/privacy/' target='_blank'>https://lookit.mit.edu/privacy/</a>."
                }
            ]
        }
}
```

@class Exp-lookit-video-consent
@extends Exp-frame-base

@uses Video-record
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
        /**
        Name of PI running this study
        @property {String} PIName
        */
        PIName: {
            type: 'string',
            description: 'Name of PI running this study'
        },

        /**
        Name of institution running this study (if ambiguous, list institution whose IRB approved the study)
        @property {String} institution
        */
        institution: {
            type: 'string',
            description: 'Name of institution running this study'
        },

        /**
        Contact information for PI or lab in case of participant questions or concerns. This will directly follow the phrase "please contact", so format accordingly: e.g., "the XYZ lab at xyz@science.edu" or "Mary Smith at 123 456 7890".
        @property {String} PIContact
        */
        PIContact: {
            type: 'string',
            description: 'Contact information for PI or lab'
        },

        /**
        Brief description of purpose of study - 1-2 sentences that describe what you are trying to find out. Language should be as straightforward and accessible as possible! E.g., "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails."
        @property {String} purpose
        */
        purpose: {
            type: 'string',
            description: 'Brief description of purpose of study'
        },

        /**
        Brief description of study procedures. For consent templates 001 and 002, this should include any risks or a statement that there are no anticipated risks. (For consent template 003, that is included in `payment`). We add a statement about the duration (from your study definition) to the start (e.g., "This study takes about 10 minutes to complete"), so you don't need to include that. It can be in third person or addressed to the parent. E.g., "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating."
        @property {String} procedures
        */
        procedures: {
            type: 'string',
            description: 'Brief description of study procedures'
        },

        /**
        Whether to include an addition step #4 prompting any other adults present to read a statement of consent (I have read and understand the consent document. I also agree to participate in this study.)
        @property {boolean} prompt_all_adults
        @default false
        */
        prompt_all_adults: {
            type: 'boolean',
            description: 'Whether to include instructions for any additional adults to consent',
            default: false
        },

        /**
        Statement about payment/compensation for participation, including a statement that there are no additional benefits anticipated to the participant. E.g., "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience." For consent template 003, this section is titled Benefits, risks, and payment; it should include information about risks as well.
        @property {String} payment
        */
        payment: {
            type: 'string',
            description: 'Statement about payment/compensation for participation'
        },

        /**
        Study-specific data use statement (optional). This will follow the following more general text: "The research group led by [PIName] at [institution] will have access to video and other data collected during this session. We will also have access to your account profile, demographic survey, and the child profile for the child who is participating, including changes you make in the future to any of this information. We may study your child’s responses in connection with his or her previous responses to this or other studies run by our group, siblings’ responses to this or other studies run by our group, or demographic survey responses."
        You may want to note what measures you will actually be coding for (looking time, facial expressions, parent-child interaction, etc.) and other more specific information about your use of data from this study here. For instance, you would note if you were building a corpus of naturalistic data that may be used to answer a variety of questions (rather than just collecting data for a single planned study).
        @property {String} datause
        */
        datause: {
            type: 'string',
            description: 'Study-specific data use statement'
        },

        /**
        Whether to include a section on GDPR; only used in template consent_002 + .
        @property {String} gdpr
        @default false
        */
        gdpr: {
            type: 'boolean',
            description: 'Whether to include a section on GDPR',
            default: false
        },

        /**
        List of types of personal information collected, for GDPR section only. Do not include special category information, which is listed separately.
        @property {String} gdpr_personal_data
        */
        gdpr_personal_data: {
            type: 'string',
            description: 'List of types of personal information collected'
        },

        /**
        List of types of special category information collected, for GDPR section only. Include all that apply: racial or ethnic origin; political opinions; religious or philosophical beliefs; trade union membership; processing of genetic data; biometric data; health data; and/or sex life or sexual orientation information
        @property {String} gdpr_sensitive_data
        */
        gdpr_sensitive_data: {
            type: 'string',
            description: 'List of types of special category information collected'
        },

        /**
        Statement about rights of research subjects and how to contact IRB.  Used only in template consent_002+. For instance, MIT's standard language is: You are not waiving any legal claims, rights or remedies because of your participation in this research study.  If you feel you have been treated unfairly, or you have questions regarding your rights as a research subject, you may contact [CONTACT INFO].
        @property {String} research_rights_statement
        */
        research_rights_statement: {
            type: 'string',
            description: ' Statement about rights of research subjects and how to contact IRB'
        },

        /**
        List of additional custom sections of the consent form, e.g. US Patriot Act Disclosure. These are subject to Lookit approval and in general can only add information that was true anyway but that your IRB needs included; please contact us before submitting your study to check.
        @property {Array} additional_segments
        @default []
        */
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

        /**
        Which consent document template to use. If you are setting up a new study,
        use the most recent (highest number) of these options. Options: consent_001,
        consent_002, consent_003.
        @property {String} template
        */
        template: {
            type: 'string',
            enum: ['consent_001', 'consent_002', 'consent_003'],
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
        let validTemplateNames = ['consent_001', 'consent_002', 'consent_003'];
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
