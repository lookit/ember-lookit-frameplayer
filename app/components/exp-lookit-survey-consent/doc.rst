.. _exp-lookit-survey-consent:

exp-lookit-survey-consent
==============================================

Overview
------------------

A frame to display a survey-style consent form (no video recording) to the participant. Can show blocks of text,
checkbox items, and multiple-choice questions in any order. Participant must check all checkboxes and answer all
multiple-choice questions to proceed.

Note: in general, all studies on Lookit should use the :ref:`video consent<exp-lookit-video-consent>` frame for
consent. This survey frame is provided for rare cases where, for legal reasons, it is not possible to collect video
consent.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-survey-consent.png
    :alt: Example screenshot from exp-lookit-survey-consent frame

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)

Examples
----------------

.. code:: javascript

    "survey-consent": {
            "kind": "exp-lookit-survey-consent",
            "title": "Informed Consent Form for Caregivers of Minors (Under 18) \n TITLE OF STUDY",
            "items": [
                {
                    "kind": "text-block",
                    "text": "Please contact the lead researcher (CONTACT INFO) if you have any questions regarding this form."
                },
                {
                    "kind": "text-block",
                    "title": "General"
                },
                {
                    "kind": "checkbox-item",
                    "text": "I confirm I have read and understood the Information Sheet for the above-named study. The information has been fully explained to me and I have been able to contact the researchers with enquiries.",
                    "label": "read_sheet"

                },
                {
                    "kind": "checkbox-item",
                    "text": "I understand that participation in this study is entirely voluntary, and if I decide that I do not want my child to take part, they can stop taking part in this study at any time without giving a reason.",
                    "label": "voluntary"
                },
                {
                    "kind": "checkbox-item",
                    "text": "I understand that I will be receiving a small remuneration of €XXX for participation in this study.",
                    "label": "compensation"
                },
                {
                    "kind": "checkbox-item",
                    "text": "I know how to contact the research team if I need to.",
                    "label": "contact"
                },
                {
                    "kind": "checkbox-item",
                    "text": "I agree to take part in this research study with my child having been fully informed of the risks, benefits and alternatives which are set out in full in the information leaflet which I have been provided with.",
                    "label": "fully_informed"
                },
                {
                    "kind": "text-block",
                    "title": "Data processing"
                },
                {
                    "kind": "checkbox-item",
                    "text": "I give my permission for my data to be used in line with the aims of the research study, as outlined in the information sheet.",
                    "label": "use_data"
                },
                {
                    "kind": "checkbox-item",
                    "text": "I understand that results from analysis of my child’s personal information will not be given to me.",
                    "label": "no_personal_results"
                },
                {
                    "kind": "checkbox-item",
                    "text": "I understand that confidentiality may be breached in circumstances in which: <ol><li>The research team has a strong belief or evidence exists that there is a serious risk of harm or danger to either the participant or another individual.  This may relate to issues surrounding physical, emotional and/or sexual abuse, concerns for child protection, rape, self-harm, suicidal intent or criminal activity.</li><li>Disclosure is required as part of a legal process or Garda investigation. In such instances, information may be disclosed to significant others or appropriate third parties without permission being sought.  Where possible, a full explanation will be given to the participant regarding the necessary procedures and also the intended actions that may need to be taken.</li></ol>",
                    "label": "confidentiality_limits"
                },
                {
                    "kind": "multiple-choice",
                    "question": "PUBLIC DATABASE: I give permission for my personal data, in the form of webcam recordings to be shared with the scientific community and the general public via a fully open database on the internet. <b>Agreeing to publicly sharing your data is NOT required for participation in this study.</b> This data will be de-identified as much as possible (that is, all efforts will be taken by the research team to remove any identifying features in the footage, and no names, dates of birth, addresses, etc will be provided with the data). I understand that data shared in this way will be accessible to researchers and members of the public anywhere in the world, not just the EEA, and thus may be transferred outside the EEA. I understand that by sharing data in this way, my data might be used for other, future research projects in addition to the study I am currently participating in. Those future projects can focus on any topic and might be completely unrelated to the goals of this study. <br><br>I understand that although the study team may destroy/withdraw the original dataset from the open database, once the data are shared, it cannot be guaranteed that no copy will remain. I understand that it is possible that some of the research conducted using my shared information eventually could lead to the development of new research methods, new diagnostic tests, new drugs, or other commercial products. I understand that should this occur, there is no plan to provide me, the study team, or TCD with any part of the profits generated from such products, nor will I, the study team, or TCD have any ownership rights in the products.",
                    "answers": [
                        "Yes",
                        "No"
                    ],
                    "label": "public_database"
                }
            ]
        }

Parameters
----------------

showPreviousButton [Boolean | ``true``]
    Whether to show a 'previous' button

blocks [Array]
    Array of text blocks to display, rendered using :ref:`exp-text-block`.

multipleChoiceValidationText [String | ``'* You must answer this question to participate'``]
    Text to show beneath multiple choice questions if the user tries to proceed without selecting an option

checkboxValidationText [String | ``'* You must agree to this item to participate'``]
    Text to show beneath checkbox items if the user tries to proceed without checking the box

items [Array]
    List of items in the consent form. Each one is an object (enclosed in `{}`). It should have "kind" set to
    either ``"multiple-choice"``, ``"checkbox-item"``, or ``"text-block"``.

    * If 'kind' is set to ``"text-block"``, the item will be rendered using :ref:`exp-text-block`. It can have fields
      ``"text"``, ``"title"``, etc.
    * If 'kind' is set to ``"checkbox-item"``, set ``"text"`` to the text of the question. This can include HTML.
    * If 'kind' is set to ``"multiple-choice"``, set ``"question"`` to the text of the question (which can include HTML)
      and ``"answers"`` to a list of possible answers.

    Checkbox and multiple choice items can also have a field ``"label"`` which will be used to label the participant's
    answer in the data collected. Labels should contain only characters, numbers, and underscores.


Data collected
----------------

The fields added specifically for this frame type are:

answer_<label> [String]
    The answer to the question with label ``<label>``. E.g., if you set label to ``"public_database"`` the corresponding
    answer will be called ``answer_public_database``. If a question does not have a label, it will be numbered
    according to its zero-indexed position in ``items`` (the first item is ``answer_0``, the next is ``answer_1``, etc.)

    For multiple-choice questions, the value of the answer is the same as one of the items in the ``answers`` list.
    For checkbox questions, the value of a checked box is ``true`` and the value of an unchecked box is ``false``.
    (You will only see ``true`` values because participants have to check all the boxes to proceed and save their data.)

Events recorded
----------------

The events recorded specifically by this frame are:

<None>
