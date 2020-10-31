.. _exp-lookit-images-audio:

exp-lookit-images-audio
==============================================

Overview
------------------

Frame to display image(s) and play audio, with optional video recording. Options allow
customization for looking time, storybook, forced choice, and reaction time type trials,
including training versions where children (or parents) get feedback about their responses.

This can be used in a variety of ways - for example:

- Display an image for a set amount of time and measure looking time
- Display two images for a set amount of time and play audio for a looking-while-listening paradigm
- Show a "storybook page" where you show images and play audio, having the parent/child press 'Next' to proceed. If desired,
  images can appear and be highlighted at specific times
  relative to audio. E.g., the audio might say "This [image of Remy appears] is a boy
  named Remy. Remy has a little sister [image of Zenna appears] named Zenna.
  [Remy highlighted] Remy's favorite food is brussel sprouts, but [Zenna highlighted]
  Zenna's favorite food is ice cream. [Remy and Zenna both highlighted] Remy and Zenna
  both love tacos!"
- Play audio asking the child to choose between two images by pointing or answering
  verbally. Show text for the parent about how to help and when to press Next.
- Play audio asking the child to choose between two images, and require one of those
  images to be clicked to proceed (see "choiceRequired" option).
- Measure reaction time as the child is asked to choose a particular option on each trial
  (e.g., a central cue image is shown first, then two options at a short delay; the child
  clicks on the one that matches the cue in some way)
- Provide audio and/or text feedback on the child's (or parent's) choice before proceeding,
  either just to make the study a bit more interactive ("Great job, you chose the color BLUE!")
  or for initial training/familiarization to make sure they understand the task. Some
  images can be marked as the "correct" answer and a correct answer required to proceed.
  If you'd like to include some initial training questions before your test questions,
  this is a great way to do it.

In general, the images are displayed in a designated region of the screen with aspect
ratio 7:4 (1.75 times as wide as it is tall) to standardize display as much as possible
across different monitors. If you want to display things truly fullscreen, you can
use `autoProceed` and not provide `parentText` so there's nothing at the bottom, and then
set `maximizeDisplay` to true.

Any number of images may be placed on the screen, and their position
specified. (Aspect ratio will be the same as the original image.)

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-images-audio.png
    :alt: Example screenshot from exp-lookit-images-audio frame

Recording
~~~~~~~~~~

Webcam recording may be turned on or off; if on, stimuli are not displayed and audio is
not started until recording begins. (Using the frame-specific `isRecording` property
is good if you have a smallish number of test trials and prefer to have separate video
clips for each. For reaction time trials or many short trials, you will likely want
to use session recording instead - i.e. start the session recording before the first trial
and end on the last trial - to avoid the short delays related to starting/stopping the video.)

Display
~~~~~~~~~~

This frame is displayed fullscreen, but is not paused or otherwise disabled if the
user leaves fullscreen. A button appears prompting the user to return to
fullscreen mode.

If the frame before it is not fullscreen, that frame
needs to include a manual "next" button so that there's a user interaction
event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
without a user event.)

Specifying where files are
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Several of the parameters for this frame can be specified either by providing a list of full URLs and file types, or
by providing just a filename that will be interpreted relative to the ``baseDir``. These are: ``audio``
(``source`` property), ``pauseAudio``, ``unpauseAudio``, ``pauseVideo``, and ``video`` (``source``
property). See the :ref:`expand-assets` tool that this frame uses.

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`video-record`
- :ref:`expand-assets`


Examples
----------------

The examples below show a variety of usages.

1. Single image displayed full-screen, maximizing area on monitor, for 8 seconds.

    .. code:: javascript

        "image-1": {
            "kind": "exp-lookit-images-audio",
            "images": [
                {
                    "id": "cats",
                    "src": "two_cats.png",
                    "position": "fill"
                }
            ],
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "autoProceed": true,
            "doRecording": true,
            "durationSeconds": 8,
            "maximizeDisplay": true
        }

2. Single image displayed at specified position, with 'next' button to move on

    .. code:: javascript

        "image-2": {
            "kind": "exp-lookit-images-audio",
            "images": [
                {
                    "id": "cats",
                    "src": "three_cats.JPG",
                    "top": 10,
                    "left": 30,
                    "width": 40
                }
            ],
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "autoProceed": false,
            "doRecording": true,
            "parentTextBlock": {
                "text": "Some explanatory text for parents",
                "title": "For parents"
            }
        }

3.  Image plus audio, auto-proceeding after audio completes and 4 seconds go by

    .. code:: javascript

        "image-3": {
            "kind": "exp-lookit-images-audio",
            "audio": "wheresremy",
            "images": [
                {
                    "id": "remy",
                    "src": "wheres_remy.jpg",
                    "position": "fill"
                }
            ],
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "audioTypes": [
                "mp3",
                "ogg"
            ],
            "autoProceed": true,
            "doRecording": false,
            "durationSeconds": 4,
            "parentTextBlock": {
                "text": "Some explanatory text for parents",
                "title": "For parents"
            },
            "showProgressBar": true
        }

4. Image plus audio, with 'next' button to move on

    .. code:: javascript

        "image-4": {
            "kind": "exp-lookit-images-audio",
            "audio": "peekaboo",
            "images": [
                {
                    "id": "remy",
                    "src": "peekaboo_remy.jpg",
                    "position": "fill"
                }
            ],
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "audioTypes": [
                "mp3",
                "ogg"
            ],
            "autoProceed": false,
            "doRecording": false,
            "parentTextBlock": {
                "text": "Some explanatory text for parents",
                "title": "For parents"
            }
        }

5.  Two images plus audio question asking child to point to one of the images, demonstrating different timing of image display & highlighting of images during audio

    .. code:: javascript

        "image-5": {
            "kind": "exp-lookit-images-audio",
            "audio": "remyzennaintro",
            "images": [
                {
                    "id": "remy",
                    "src": "scared_remy.jpg",
                    "position": "left"
                },
                {
                    "id": "zenna",
                    "src": "love_zenna.jpg",
                    "position": "right",
                    "displayDelayMs": 1500
                }
            ],
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "highlights": [
                {
                    "range": [
                        0,
                        1.5
                    ],
                    "imageId": "remy"
                },
                {
                    "range": [
                        1.5,
                        3
                    ],
                    "imageId": "zenna"
                }
            ],
            "autoProceed": false,
            "doRecording": true,
            "parentTextBlock": {
                "text": "Some explanatory text for parents",
                "title": "For parents"
            }
        }

6. Three images with audio prompt, family has to click one of two to continue

    .. code:: javascript

        "image-6": {
            "kind": "exp-lookit-images-audio",
            "audio": "matchremy",
            "images": [
                {
                    "id": "cue",
                    "src": "happy_remy.jpg",
                    "position": "center",
                    "nonChoiceOption": true
                },
                {
                    "id": "option1",
                    "src": "happy_zenna.jpg",
                    "position": "left",
                    "displayDelayMs": 2000
                },
                {
                    "id": "option2",
                    "src": "annoyed_zenna.jpg",
                    "position": "right",
                    "displayDelayMs": 2000
                }
            ],
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "autoProceed": false,
            "doRecording": true,
            "choiceRequired": true,
            "parentTextBlock": {
                "text": "Some explanatory text for parents",
                "title": "For parents"
            },
            "canMakeChoiceBeforeAudioFinished": true
        }

7.  Three images with audio prompt, family has to click correct one to continue - audio feedback on incorrect answer

    .. code:: javascript

        "image-7": {
            "kind": "exp-lookit-images-audio",
            "audio": "matchzenna",
            "images": [
                {
                    "id": "cue",
                    "src": "sad_zenna.jpg",
                    "position": "center",
                    "nonChoiceOption": true
                },
                {
                    "id": "option1",
                    "src": "surprised_remy.jpg",
                    "position": "left",
                    "feedbackAudio": "negativefeedback",
                    "displayDelayMs": 3500
                },
                {
                    "id": "option2",
                    "src": "sad_remy.jpg",
                    "correct": true,
                    "position": "right",
                    "displayDelayMs": 3500
                }
            ],
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "autoProceed": false,
            "doRecording": true,
            "choiceRequired": true,
            "parentTextBlock": {
                "text": "Some explanatory text for parents",
                "title": "For parents"
            },
            "correctChoiceRequired": true,
            "canMakeChoiceBeforeAudioFinished": false
        }

8. Three images with audio prompt, family has to click correct one to continue - text feedback on incorrect answer

    .. code:: javascript

        "image-8": {
            "kind": "exp-lookit-images-audio",
            "audio": "matchzenna",
            "images": [
                {
                    "id": "cue",
                    "src": "sad_zenna.jpg",
                    "position": "center",
                    "nonChoiceOption": true
                },
                {
                    "id": "option1",
                    "src": "surprised_remy.jpg",
                    "position": "left",
                    "feedbackText": "Try again! Remy looks surprised in that picture. Can you find the picture where he looks sad, like Zenna?",
                    "displayDelayMs": 3500
                },
                {
                    "id": "option2",
                    "src": "sad_remy.jpg",
                    "correct": true,
                    "position": "right",
                    "feedbackText": "Great job! Remy is sad in that picture, just like Zenna is sad.",
                    "displayDelayMs": 3500
                }
            ],
            "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
            "autoProceed": false,
            "doRecording": true,
            "choiceRequired": true,
            "parentTextBlock": {
                "text": "Some explanatory text for parents",
                "title": "For parents"
            },
            "correctChoiceRequired": true,
            "canMakeChoiceBeforeAudioFinished": false
        }

Parameters
----------------

.. glossary::

    video [Object | ``{}`` ]
        Object describing the video to show. It can have the following properties:

        :source: [String or Array]
            The location of the main video to play. This can be either
            an array of ``{'src': 'https://...', 'type': '...'}`` objects (e.g., to provide both
            webm and mp4 versions at specified URLS) or a single string relative to ``baseDir/<EXT>/``.


    doRecording [Boolean]
        Whether to do webcam recording (will wait for webcam
        connection before starting audio or showing images if so)

    autoProceed [Boolean | ``false``]

        Whether to proceed automatically when all conditions are met, vs. enabling
        next button at that point. If true: the next, previous, and replay buttons are
        hidden, and the frame auto-advances after ALL of the following happen

        (a) the audio segment (if any) completes
        (b) the durationSeconds (if any) is achieved
        (c) a choice is made (if required)
        (d) that choice is correct (if required)
        (e) the choice audio (if any) completes
        (f) the choice text (if any) is dismissed

        If false: the next, previous, and replay buttons (as applicable) are displayed.
        It becomes possible to press 'next' only once the conditions above are met.

    durationSeconds [Number | ``0``]
        Minimum duration of frame in seconds. If set, then it will only
        be possible to proceed to the next frame after both the audio completes AND
        this duration is acheived.

    showProgressBar [Boolean | ``false``]
        [Only used if durationSeconds set] Whether to
        show a progress bar based on durationSeconds in the parent text area.

    showPreviousButton [Boolean | ``true``]
        [Only used if not autoProceed] Whether to
        show a previous button to allow the participant to go to the previous frame

    showReplayButton [Boolean | ``true``]
        [Only used if not autoProceed AND if there is audio] Whether to
        show a replay button to allow the participant to replay the audio

    maximizeDisplay [Boolean | ``false``]
        Whether to have the image display area take up the whole screen if possible.
        This will only apply if (a) there is no parent text and (b) there are no
        control buttons (next, previous, replay) because the frame auto-proceeds.

    audio [String or Array | ``[]``]
        Audio file to play at the start of this frame.
        This can either be an array of {src: 'url', type: 'MIMEtype'} objects, e.g.
        listing equivalent .mp3 and .ogg files, or can be a single string `filename`
        which will be expanded based on `baseDir` and `audioTypes` values (see `audioTypes`).

    parentTextBlock [Object | ``{}``]
        Text block to display to parent.  (Each field is optional)

        :title:
            title to display

        :text:
            text paragraph of text

        :css:
            object specifying any css properties to apply to this section, and their values - e.g.
            ``{'color': 'gray', 'font-size': 'large'}``

    images [Array | ``[]``]
        Array of images to display and information about their placement. For each
        image, you need to specify ``src`` (image name/URL) and placement (either by
        providing left/width/top values, or by using a ``position`` preset).
        Everything else is optional! This is where you would say that an image should
        be shown at a delay, or specify times to highlight particular images.

        :id: [String]
            unique ID for this image
        :src: [String]
            URL of image source. This can be a full
            URL, or relative to baseDir (see baseDir).
        :alt: [String]
            alt-text for image in case it doesn't load and for screen readers
        :left: [Number]
            left margin, as percentage of story area width. If not provided,
            the image is centered horizontally.
        :width: [Number]
            image width, as percentage of story area width. Note:
            in general only provide one of width and height; the other will be adjusted to
            preserve the image aspect ratio.
        :top: [Number]
            top margin, as percentage of story area height. If not provided,
            the image is centered vertically.
        :height: [Number]
            image height, as percentage of story area height. Note:
            in general only provide one of width and height; the other will be adjusted to
            preserve the image aspect ratio.
        :position: [String]
            one of 'left', 'center', 'right', 'fill' to use presets
            that place the image in approximately the left, center, or right third of
            the screen or to fill the screen as much as possible.
            This overrides left/width/top values if given.
        :nonChoiceOption: [Boolean]
            [Only used if ``choiceRequired`` is true]
            whether this should be treated as a non-clickable option (e.g., this is
            a picture of a girl, and the child needs to choose whether the girl has a
            DOG or a CAT)
        :displayDelayMs: [Number]
            Delay at which to show the image after trial
            start (timing will be relative to any audio or to start of trial if no
            audio). Optional; default is to show images immediately.
        :feedbackAudio: [Array or String]
            [Only used if ``choiceRequired`` is true] Audio to play upon clicking this image.
            This can either be an array of
            {src: 'url', type: 'MIMEtype'} objects, e.g. listing equivalent .mp3 and
            .ogg files, or can be a single string ``filename`` which will be expanded
            based on ``baseDir`` and ``audioTypes`` values (see ``audioTypes``).
        :feedbackText: [String]
            [Only used if ``choiceRequired`` is true] Text
            to display in a dialogue window upon clicking the image.

    backgroundColor [String | ``'black'``]
        Color of background. See `CSS specs <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value>`__
        for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
        rgb hex values (e.g. '#800080' - include the '#')

    pageColor [String | ``'white'``]
        Color of area where images are shown, if different from overall background.
        Defaults to backgroundColor if one is provided. See
        `CSS specs <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value>`__
        for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
        rgb hex values (e.g. '#800080' - include the '#')

    choiceRequired [Boolean | ``false``]
        Whether this is a frame where the user needs to click to select one of the
        images before proceeding.

    correctChoiceRequired [Boolean | ``false``]
        [Only used if `choiceRequired` is true] Whether the participant has to select
        one of the *correct* images before proceeding.

    canMakeChoiceBeforeAudioFinished [Boolean | ``false``]
        Whether the participant can make a choice before audio finishes. (Only relevant
        if `choiceRequired` is true.)

    highlights [Array | ``[]``]
        Array representing times when particular images should be highlighted. Each
        element of the array should be of the form ``{'range': [3.64, 7.83], 'imageId': 'myImageId'}``.
        The two `range` values are the start and end times of the highlight in seconds,
        relative to the audio played. The `imageId` corresponds to the `id` of an
        element of `images`.
        Highlights can overlap in time. Any that go longer than the audio will just
        be ignored/cut off.
        One strategy for generating a bunch of highlights for a longer story is to
        annotate using Audacity and export the labels to get the range values.

        :range: [Array]
            ``[startTimeInSeconds, endTimeInSeconds]``, e.g. ``[3.64, 7.83]``
        :imageId: [String]
            ID of the image to highlight, corresponding to the ``id`` field of the element of ``images`` to highlight

Data collected
----------------

The fields added specifically for this frame type are:

.. glossary::

    images [Array]
        Array of images used in this frame [same as passed to this frame, but
        may reflect random assignment for this particular participant]

    selectedImage [String]
        ID of image selected at time of proceeding

    correctImageSelected [Boolean]
        Whether image selected at time of proceeding is marked as correct

Events recorded
----------------

The events recorded specifically by this frame are:

:videoStarted: When video begins playing (recorded each time video starts if played through more than once)

:replayAudio: When main audio segment is replayed

:trialComplete: Trial is complete and attempting to move to next frame; may wait for recording to catch up before proceeding.

:finishAudio: When main audio segment finishes playing

:startTimer: Timer for set-duration trial begins

:endTimer: Timer for set-duration trial ends

:startAudio: When main audio segment starts playing

:failedToStartAudio: When main audio cannot be started. In this case we treat it as if
   the audio was completed (for purposes of allowing participant to
   proceed)

:displayAllImages: When images are displayed to participant (for images without any delay added)

:displayImage: When a specific image is shown at a delay.

    :imageId: [String] ID of image shown

:clickImage:  When one of the image options is clicked during a choice frame

    :imageId: [String] ID of the image selected

    :correct: [Boolean] whether this image is marked as correct

:startImageAudio: When image/feedback audio is started

    :imageId: [String] ID of the associated image

:failedToStartImageAudio: When image/feedback audio cannot be started. In this case we treat it as if
    the audio was completed (for purposes of allowing participant to proceed)

    :imageId: [String] ID of the associated image

:dismissFeedback: When the participant dismisses a feedback dialogue

    :imageId: [String] ID of the associated image