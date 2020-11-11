.. _exp-lookit-instruction-video:

exp-lookit-instruction-video
==============================================

Overview
------------------

A frame to display video instructions to the user.

A video is displayed to the left, and a transcript or summary in a scrolling box to the right. (The transcript can
be omitted if desired, but in that case you must provide complete captioning for the video!)

The participant is required to either scroll to the bottom of the transcript or watch the video to proceed.


What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-instruction-video.png
    :alt: Example screenshot from exp-lookit-instruction-video frame

Specifying where files are
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Several of the parameters for this frame can be specified either by providing a list of full URLs and file types, or
by providing just a filename that will be interpreted relative to the ``baseDir``. See the :ref:`expand-assets` tool that this frame uses.

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`expand-assets`


Examples
----------------

This frame will show an instruction video & summary.

.. code:: javascript

     "intro-video": {
        "kind": "exp-lookit-instruction-video",
        "instructionsVideo": [
            {
                "src": "https://raw.github.com/UCDOakeslab/Baby_MR_Lookit/master/Lookit Introduction Part 1_Edited.mp4",
                "type": "video/mp4"
            }
        ],
        "introText": "Welcome to the study! Please watch this video to get started. \n(Or you can read the summary to the right if you prefer.)",
        "transcriptTitle": "Video summary",
        "transcriptBlocks": [
            {
                "title": "Background information about the study",
                "listblocks": [
                    {
                        "text": "Your baby does not need to be with you at this point in the study. We will let you know when it is time to get your baby."
                    },
                    {
                        "text": "Mental rotation, or the ability to manipulate internal representations of objects, is an important spatial ability. Spatial abilities are important for understanding objects, reading maps, mathematical reasoning, and navigating the world. Thus, the development of mental rotation is an important milestone. In the current study, we are interested in examining whether babies in general can mentally rotate simple objects."
                    }
                ]
            },
            {
                "title": "Preview of what your baby will see"
            },
            {
                "listblocks": [
                    {
                        "text": "Your baby will be shown two identical Tetris shapes on the screen; one on the left and one on the right. The shapes appear and disappear, changing their orientation each time they reappear. On one side, the rotation will always be possible. Sometimes, on the other side, a mirror image of the shape will be presented. If babies can mentally rotate objects, they should spend different amounts of time watching these two kinds of stimuli."
                    }
                ]
            },
            {
                "title": "What's next?",
                "listblocks": [
                    {
                        "text": "Because this is an online study, we will check to make sure that your webcam is set up and working properly on the next page, so we can record your baby’s looking behavior during the study."
                    },
                    {
                        "text": "Following that page, you will be given an opportunity to review the consent information and we will ask that you record a short video of yourself giving consent to participate in this study."
                    },
                    {
                        "text": "We will then ask you questions about your baby's motor abilities."
                    },
                    {
                        "text": "After you are finished with the consent page and questions, you will be provided with more detailed information about what to do during the study and how to get started."
                    }
                ]
            }
        ],
        "warningText": "Please watch the video or read the transcript before proceeding.",
        "nextButtonText": "Next",
        "title": "Study instructions",
        "showPreviousButton": false
    }


Parameters
----------------

title [String]
    Title to show at top of frame

introText [String | ``'Welcome! Please watch this video to learn how the study will work. You can read the transcript to the right if you prefer.'``]
    Intro text to show at top of frame

warningText [String | ``'Please watch the video or read the transcript before proceeding.'``]
    Text to show above Next button if participant has not yet watched video or read transcript

instructionsVideo [String or Array]
    The location of the instructions video to play. This can be either
    an array of {'src': 'https://...', 'type': '...'} objects (e.g. providing both
    webm and mp4 versions at specified URLS) or a single string relative to baseDir/<EXT>/.

transcriptTitle [String | ``'Video transcript'``
    Title to show above video transcript/overview. Generally this should be either "Video transcript" or
    "Video summary" depending on whether you're providing a word-for-word transcript or a condensed summary.

transcriptBlocks [Array]
    Array of blocks for :ref:`exp-text-block`, providing a transcript of the video
    or an overview of what it said. A transcript can be broken down into bullet points to make it more readable.

    If you've also provided closed captions throughout the video, you can use this space just to provide key
    points.

    If this is left blank (``[]``) no transcript is displayed.

    Each block may have...

    :title: [String]
        Title of this section
    :text: [String]
        Text of this section
    :listblocks: [Array]
        Bullet points for this section. Each bullet may have...

        :text: Text of this bullet point
        :image: [Object] Image for this bullet point, with fields:

           :src: [String] URL of image
           :alt: [String] Alt text for image

requireWatchOrRead [Boolean | ``true``]
    Whether to require that the participant watches the whole video (or reads the whole transcript) to move on.
    Set to false for e.g. a debriefing video where it's optional to review the information.

showPreviousButton [Boolean | ``true``]
    Whether to show a 'previous' button

nextButtonText [String | ``'Start the videos! \n (You\'ll have a moment to turn around.)'``]
    Text to display on the 'next frame' button

Data collected
----------------

No additional data is collected specifically by this frame type.


Events recorded
----------------

No events are recorded specifically by this frame.
