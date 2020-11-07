.. _exp-lookit-video-consent:

exp-lookit-video-consent
==============================================

Overview
------------------

Video consent frame for Lookit studies, with consent document displayed at left and instructions to start recording, read a statement out loud, and send. A standard consent
document is displayed, with additional study-specific information provided by the researcher, in accordance with the Lookit terms of use.

The consent document can be downloaded as a PDF document by the participant.

Researchers can select from the following named templates:

- `consent_001`: Original Lookit consent document (2019)
- `consent_002`: Added optional GDPR section and research subject rights statement
- `consent_003`: Same as consent_002 except that the 'Payment' section is renamed 'Benefits, risks, and payment' for institutions that prefer that
- `consent_004`: Same as consent_003 except that sentences in 'Data collection and webcam recording' are rearranged to make it clearer what happens if you withdraw video data, and the prompt says to read "out loud (or in ASL)" instead of just "out loud" for accessibility.

Looking up exact templates
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
To look up the exact text of each consent template for your IRB protocol, and to understand the context for
each piece of text to be inserted, please see `the templates <https://github.com/lookit/research-resources/tree/master/Legal>`__.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-video-consent.png
    :alt: Example screenshot from exp-lookit-video-consent frame


More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`video-record`
- :ref:`expand-assets`


Example
----------------

.. code:: javascript

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



Parameters
----------------

template [String | ``'consent_001'``]
    Which consent document template to use. If you are setting up a new study, we recommend
    using the most recent (highest number) of these options. Options: ``consent_001``,
    ``consent_002``, ``consent_003``, ``consent_004``.

PIName
    Name of PI running this study

institution
    Name of institution running this study (if ambiguous, list institution whose IRB approved the study)'

PIContact
    Contact information for PI or lab in case of participant questions or concerns. This will directly follow the phrase "please contact", so format accordingly: e.g., "the XYZ lab at xyz@science.edu" or "Mary Smith at 123 456 7890".

purpose
    Brief description of purpose of study - 1-2 sentences that describe what you are trying to find out. Language should be as straightforward and accessible as possible! E.g., "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails."

procedures
    Brief description of study procedures. For consent templates 001 and 002, this should include any
    risks or a statement that there are no anticipated risks. (For consent template 003, that is included
    in `payment`). We add a statement about the duration (from your study definition) to the start (e.g.,
    "This study takes about 10 minutes to complete"), so you don't need to include that. It can be in
    third person or addressed to the parent. E.g., "Your child will be shown pictures of lots of different
    cats, along with noises that cats make like meowing and purring. We are interested in which pictures
    and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing
    your child's responses. There are no anticipated risks associated with participating."

prompt_all_adults [Boolean | ``false``]
    Whether to include an addition step #4 prompting any other adults present to read a statement of consent
    (I have read and understand the consent document. I also agree to participate in this study.)

    Please only set this to true if your IRB requires it.

payment
    Statement about payment/compensation for participation, including a statement that there are no additional
    benefits anticipated to the participant. E.g., "After you finish the study, we will email you a $5 BabyStore
    gift card within approximately three days. To be eligible for the gift card your child must be in the age
    range for this study, you need to submit a valid consent statement, and we need to see that there is a
    child with you. But we will send a gift card even if you do not finish the whole study or we are not able
    to use your child's data! There are no other direct benefits to you or your child from participating, but
    we hope you will enjoy the experience."

    For consent templates 003+, this section is titled Benefits, risks,
    and payment; it should include information about risks as well.

datause
    Study-specific data use statement (optional). This will follow the following more general text: "The research group led by [PIName] at [institution] will have access to video and other data collected during this session. We will also have access to your account profile, demographic survey, and the child profile for the child who is participating, including changes you make in the future to any of this information. We may study your child’s responses in connection with his or her previous responses to this or other studies run by our group, siblings’ responses to this or other studies run by our group, or demographic survey responses."
    You may want to note what measures you will actually be coding for (looking time, facial expressions, parent-child interaction, etc.) and other more specific information about your use of data from this study here. For instance, you would note if you were building a corpus of naturalistic data that may be used to answer a variety of questions (rather than just collecting data for a single planned study).

gdpr [Boolean | ``false``]
    Whether to include a section on GDPR; only used in template consent_002 + .

gdpr_personal_data [String]
    List of types of personal information collected, for GDPR section only. Do not include special category information, which is listed separately.

gdpr_sensitive_data [String]
    List of types of special category information collected, for GDPR section only. Include all that apply: racial or ethnic origin; political opinions; religious or philosophical beliefs; trade union membership; processing of genetic data; biometric data; health data; and/or sex life or sexual orientation information

research_rights_statement [String]
    Statement about rights of research subjects and how to contact IRB.  Used only in template consent_002+. For instance, MIT's standard language is: You are not waiving any legal claims, rights or remedies because of your participation in this research study.  If you feel you have been treated unfairly, or you have questions regarding your rights as a research subject, you may contact [CONTACT INFO].

additional_segments [Array]
    List of additional custom sections of the consent form, e.g. US Patriot Act Disclosure. These are subject to Lookit approval and in general can only add information that was true anyway but that your IRB needs included; please contact us before submitting your study to check.

    Each section can have fields:

        :title: [String] title of section
        :text: [String] text of section


Data collected
----------------

The fields added specifically for this frame type are:

consentFormText
    the exact text shown in the consent document during this frame

Events recorded
----------------

The events recorded specifically by this frame are:

:downloadConsentForm: When participant downloads consent form