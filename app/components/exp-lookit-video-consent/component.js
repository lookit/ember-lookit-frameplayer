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

`consent_001`: Original Lookit consent document (2019)
`consent_002`: Added optional GDPR section and research subject rights statement

To look up the exact text of the consent document, see https://github.com/lookit/ember-lookit-frameplayer/blob/master/app/components/exp-lookit-video-consent/template.hbs

The consent document can be downloaded as PDF document by participant.

```json
"frames": {
    "video-consent": {
        "kind": "exp-lookit-video-consent",
        "template": "consent_002",
        "PIName": "Jane Smith",
        "institution": "Science University",
        "PIContact": "Jane Smith at 123 456 7890",
        "purpose": "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails.",
        "procedures": "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating.",
        "payment": "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience.",
        "datause": "We are primarily interested in your child's emotional reactions to the images and sounds. A research assistant will watch your video to measure the precise amount of delight in your child's face as he or she sees each cat picture."
        "gdpr": false,
        "research_rights_statement": "You are not waiving any legal claims, rights or remedies because of your participation in this research study.  If you feel you have been treated unfairly, or you have questions regarding your rights as a research subject, you may contact the Chairman of the Committee on the Use of Humans as Experimental Subjects, M.I.T., Room E25-143B, 77 Massachusetts Ave, Cambridge, MA 02139, phone 1-617-253 6787.""
    }
}
```

@class ExpLookitVideoConsent
@extends ExpFrameBase

@uses VideoRecord
*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout: layout,
    frameType: 'CONSENT',
    disableRecord: Em.computed('recorder.recording', 'recorder.hasCamAccess', function () {
        return !this.get('recorder.hasCamAccess') || this.get('recorder.recording');
    }),
    startedRecording: false,

    actions: {
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

    meta: {
        name: 'Video Consent Form',
        description: 'A video consent form.',
        parameters: {
            type: 'object',
            properties: {
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
                Brief description of study procedures, including any risks or a statement that there are no anticipated risks. We add a statement about the duration (from your study definition) to the start (e.g., "This study takes about 10 minutes to complete"), so you don't need to include that. It can be in third person or addressed to the parent. E.g., "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating."
                @property {String} procedures
                */
                procedures: {
                    type: 'string',
                    description: 'Brief description of study procedures'
                },

                /**
                Statement about payment/compensation for participation, including a statement that there are no additional benefits anticipated to the participant. E.g., "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience."
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
                    type: 'Boolean',
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
                Statement about rights of research subjects and how to contact IRB.  Used only in template consent_002+. For instance, MIT's standard language is: You are not waiving any legal claims, rights or remedies because of your participation in this research study.  If you feel you have been treated unfairly, or you have questions regarding your rights as a research subject, you may contact the Chairman of the Committee on the Use of Humans as Experimental Subjects, M.I.T., Room E25-143B, 77 Massachusetts Ave, Cambridge, MA 02139, phone 1-617-253 6787.
                @property {String} research_rights_statement
                */
                research_rights_statement: {
                    type: 'string',
                    description: ' Statement about rights of research subjects and how to contact IRB'
                },

                /**
                Which consent document template to use. If you are setting up a new study,
                use the most recent (highest number) of these options. Options: consent_001,
                consent_002.
                @property {String} template
                */
                template: {
                    type: 'string',
                    description: 'Which consent document template to use',
                    default: 'consent001'
                }
            },
            required: ['PIName', 'institution', 'PIContact', 'purpose', 'procedures', 'payment', 'template']
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
        let validTemplateNames = ['consent_001', 'consent_002'];
        if (!validTemplateNames.includes(this.get('template'))) {
            console.warn('Invalid consent form specified. \'template\' parameter of \'exp-lookit-video-consent\' frame should be one of: ' + validTemplateNames.join(' '));
        }
        this.set('consentFormText', $('#consent-form-text').text());
    }
});
