.. _exp-lookit-video-assent:

exp-lookit-video-assent
==============================================

Overview
------------------

Video assent frame for Lookit studies for older children to agree to participation,
separately from parental consent.

A series of assent form "pages" is displayed, each one displaying some combination of
(a) an image or the participant's webcam view or a video, (b) audio, and (c) text. You can
optionally record webcam video during the whole assent procedure or on the last page.

How the child assents
~~~~~~~~~~~~~~~~~~~~~~

Once the family has viewed all pages, the
child can answer a question about whether to participate. If they choose yes, they proceed;
if they choose no, they are sent to the exit URL.

You can either simply have children click on "Yes" or "No," or you can add audio/video on
the last page that instructs them to answer verbally, and do webcam recording on that page.
For instance, you might show a video of yourself asking "Do you want to participate in this study?
You can say "yes" or "no." Parents, once your child has answered, please click on their answer
to the right."

Showing images, videos, webcam view, and audio
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In general it is expected that only one of webcam view, video, and image will be provided per
page, although it is ok to have only text or only text plus audio. If audio or video is provided for a page,
the participant must finish it to proceed. (If both audio and video are provided they will
be played simultaneously and both must finish for the participant to proceed.) They only
need to complete the audio/video for a given page once, in case they navigate using the
previous/next buttons.

Showing this frame only to older children
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This frame can optionally be shown only when the child is at least N years old, in case
some participants will need to give assent and others will rely only on parent consent.


What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-video-assent.png
    :alt: Example screenshot from exp-lookit-video-assent frame


Specifying where files are
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Several of the parameters for this frame can be specified either by providing a list of full URLs and file types, or
by providing just a filename that will be interpreted relative to the ``baseDir``.
See the :ref:`expand-assets` tool that this frame uses.

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

    "video-assent": {
        "kind": "exp-lookit-video-assent",
        "pages": [
            {
                "imgSrc": "two_cats.JPG",
                "altText": "two cats",
                "textBlocks": [
                    {
                        "text": "My name is Jane Smith. I am a scientist who studies why children love cats."
                    }
                ],
                "audio": "sample_1",
                "type": "audio/mp3"
            },
            {
                "imgSrc": "three_cats.JPG",
                "altText": "picture of sample game",
                "textBlocks": [
                    {
                        "text": "In this study, you will play a game about cats."
                    }
                ]
            },
            {
                "showWebcam": true,
                "textBlocks": [
                    {
                        "text": "During the study, your webcam will record a video of you. We will watch this video later to see how much you love cats."
                    }
                ]
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "participationQuestion": "Do you want to participate in this study?",
        "minimumYearsToAssent": 7
     }



Parameters
----------------

pages [Array]
    A list of pages of assent form text/pictures/video for the participant to read through. Each has fields:

    :altText: [String]
        Alt-text used for the image displayed, if any
    :video: [String or Array]
         String indicating video path relative to baseDir, OR Array of {src: 'url', type: 'MIMEtype'} objects. Video will be displayed (with controls shown) and participant must complete to proceed.
    :audio: [String or Array]
        String indicating audio path relative to baseDir, OR Array of {src: 'url', type: 'MIMEtype'} objects. Audio will be played (with controls shown) and participant must complete to proceed.
    :imgSrc: [String]
        URL of image to display; can be full path or relative to baseDir
    :textBlocks: [Array]
        list of text blocks to show on this page, processed by :ref:`exp-text-block`. Can use HTML.
    :showWebcam: [Boolean]
        Whether to display the participant webcam on this page

nextStimulusText [String | ``'Next'``]
    Text on the button to proceed to the next example video/image

previousStimulusText [String | ``'Previous'``]
    Text on the button to proceed to the previous example video/image

recordLastPage [Boolean | ``false``]
    Whether to record webcam video on the last page

recordWholeProcedure [Boolean | ``false``]
    Whether to record webcam video during the entire assent frame (if true, overrides recordLastPage)

participationQuestion [String | ``'Do you want to participate in this study?'``]
     Text of the question to ask about whether to participate. Answer options are Yes/No; No means study will stop, Yes means it will proceed.

minimumYearsToAssent [Number | ``0``]
     How many years old the child has to be for this page to be shown. If child
     is younger, the page is skipped. Leave at 0 to always show. This is an
     age in 'calendar years' - it will line up with the child's birthday,
     regardless of leap years etc.

Data collected
----------------

The fields added specifically for this frame type are:

assentFormText [String]
    the exact text shown in the assent document during this frame

childResponse [String]
    The child's response to the assent question - Yes or No

Events recorded
----------------

The events recorded specifically by this frame are:

:nextAssentPage: Participant proceeded to next assent page

    :pageNumber: [Number] which assent page was viewed (zero-indexed)

:previousAssentPage: Participant returned to previous assent page

    :pageNumber: [Number] which assent page was viewed (zero-indexed)

:assentQuestionSubmit: Participant submitted assent question answer

    :childResponse: [String] child response submitted ('Yes' or 'No')

:downloadAssentForm: When participant downloads assent form