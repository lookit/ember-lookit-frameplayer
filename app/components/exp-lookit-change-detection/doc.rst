.. _exp-lookit-change-detection:

exp-lookit-change-detection
==============================================

Overview
------------------

Frame for a preferential looking "alternation" or "change detection" paradigm trial,
in which separate streams of images are displayed on the left and right of the screen.

Typically, on one side images would be alternating between two categories - e.g., images
of 8 vs. 16 dots, images of cats vs. dogs - and on the other side the images would all
be in the same category.

The frame starts with an optional brief "announcement" segment, where an attention-getter
video is displayed and audio is played. During this segment, the trial can be paused
and restarted.

You can customize the appearance of the frame: background color overall, color of the
two rectangles that contain the image streams, and border of those rectangles. You can
also specify how long to present the images for, how long to clear the screen in between
image pairs, and how long the test trial should be altogether.

You provide four lists of images to use in this frame: `leftImagesA`, `leftImagesB`,
`rightImagesA`, and `rightImagesB`. The left stream will alternate between images in
`leftImagesA` and `leftImagesB`. The right stream will alternate between images in
`rightImagesA` and `rightImagesB`. They are either presented in random order (default)
within those lists, or can be presented in the exact order listed by setting
`randomizeImageOrder` to false.

The timing of all image presentations and the specific images presented is recorded in
the event data.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-change-detection.png
    :alt: Example screenshot from exp-lookit-change-detection frame

Recording
~~~~~~~~~~

If ``doRecording`` is true (default), then we wait for recording to begin before the
actual test trial can begin. We also always wait for all images to pre-load, so that
there are no delays in loading images that affect the timing of presentation.

Display
~~~~~~~~~~

This frame is displayed fullscreen; if the frame before it is not, that frame
needs to include a manual "next" button so that there's a user interaction
event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
without a user event.)

Pausing
~~~~~~~~~~

This frame supports flexible pausing behavior due to the use of :ref:`pause-unpause`. See that link for more detailed
information about how to adjust pausing behavior.

If the user pauses using the ``pauseKey`` (space bar by default), or leaves fullscreen mode, the study will be paused. You can optionally disable
either form of pausing; see :ref:`pause-unpause`. While paused, audio is paused and stimuli are
not displayed, and instead a ``pauseImage`` or looping ``pauseVideo`` and some ``pausedText`` are displayed. Audio can be played upon pausing and
upon unpausing.

Upon unpausing, either this frame will restart (default) or the study can proceed to a frame of your choice (see the
``frameOffsetAfterPause`` parameter in :ref:`pause-unpause`.

If ``doRecording`` is true and you are recording webcam video during this frame, that recording will stop when the study
is paused. If you are doing session-level recording, you can optionally stop that upon pausing; if you do that, you
will probably want to send families back to an exp-lookit-start-recording frame upon unpausing.

Specifying where files are
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Several of the parameters for this frame can be specified either by providing a list of full URLs and file types, or
by providing just a filename that will be interpreted relative to the ``baseDir``. See the :ref:`expand-assets` tool that this frame uses.

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`pause-unpause`
- :ref:`video-record`
- :ref:`expand-assets`


Example
----------------

This frame will alternate between fruit and shapes on the left, and just fruit on the right.

.. code:: javascript

    "alt-trial": {
        "kind": "exp-lookit-change-detection",

        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": ["mp4", "webm"],
        "audioTypes": ["mp3", "ogg"],

        "unpauseAudio": "return_after_pause",
        "pauseAudio": "pause",
        "pauseVideo": "attentiongrabber",
        "frameOffsetAfterPause": 0,

        "trialLength": 15,
        "attnLength": 2,
        "videoSources": "attentiongrabber",
        "musicSources": "music_01",
        "audioSources": "video_01",
        "endAudioSources": "all_done",

        "border": "thick solid black",
        "leftImagesA": ["apple.jpg", "orange.jpg"],
        "rightImagesA": ["square.png", "tall.png", "wide.png"],
        "leftImagesB": ["apple.jpg", "orange.jpg"],
        "rightImagesB": ["apple.jpg", "orange.jpg"],
        "startWithA": true,
        "randomizeImageOrder": true,
        "displayMs": 500,
        "blankMs": 250,

        "containerColor": "white",
        "backgroundColor": "#abc"
    }



Parameters
----------------

doRecording [Boolean | ``true``]
    Whether to do webcam recording on this frame

attnLength [Number | ``0``]
    minimum amount of time to show attention-getter in seconds. If 0, attention-getter segment is skipped.

trialLength [Number | ``60``]
    length of alternation trial in seconds. This refers only to the section of the
    trial where the alternating image streams are presented - it does not count
    any announcement phase.

audioSources [String or Array | ``[]``]
    Array of {src: 'url', type: 'MIMEtype'} objects for instructions during attention-getter video, OR
    string relative to ``baseDir``. The entire audio file will play before moving on, even if it's longer than
    ``attnLength``.

musicSources [String or Array | ``[]``]
    Array of {src: 'url', type: 'MIMEtype'} objects, OR string relative to ``baseDir``, for music during trial.
    This will loop for the duration of the trial.

endAudioSources [String or Array | ``[]``]
    Array of {src: 'url', type: 'MIMEtype'} objects for audio, OR string relative to ``baseDir``, to play
    after completion of trial (optional; used for last trial "okay to open your eyes now" announcement)

videoSources [String or Array | ``[]``]
    Array of {src: 'url', type: 'MIMEtype'} objects for attention-getter video, OR string relative to ``baseDir``.
    Will play in a loop for announcement phase.

startWithA [Boolean | ``true``]
    Whether to start with the 'A' image list on both left and right. If true, both
    sides start with their respective A image lists; if false, both lists start with
    their respective B image lists.

randomizeImageOrder [Boolean | ``true``]
    Whether to randomize image presentation order within the lists ``leftImagesA``,
    ``leftImagesB``, ``rightImagesA``, and ``rightImagesB``. If true (default), the order
    of presentation is randomized. Each time all the images in one list have been
    presented, the order is randomized again for the next 'round.' If false, the
    order of presentation is as written in the list. Once all images are presented,
    we loop back around to the first image and start again.

    Example of randomization: suppose we have defined

    .. code:: javascript

        leftImagesA: ['apple', 'banana', 'cucumber'],
        leftImagesB: ['aardvark', 'bat'],
        randomizeImageOrder: true,
        startWithA: true

    And suppose the timing is such that we end up with 10 images total. Here is a
    possible sequence of images shown on the left:

    ``['banana', 'aardvark', 'apple', 'bat', 'cucumber', 'bat', 'cucumber', 'aardvark', 'apple', 'bat']``

displayMs [Number | ``750``]
    Amount of time to display each image, in milliseconds

blankMs [Number | ``250``]
    Amount of time for blank display between each image, in milliseconds

border [String | ``thin solid gray``]
    Format of border to display around alternation streams, if any. See
    https://developer.mozilla.org/en-US/docs/Web/CSS/border for syntax.

backgroundColor [String | ``'white'``]
    Color of background. See `CSS specs <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value>`__
    for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
    rgb hex values (e.g. '#800080' - include the '#')

containerColor [String | ``'white'``]
    Color of image stream container, if different from overall background.
    Defaults to backgroundColor if one is provided.
    See `CSS specs <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value>`__
    for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
    rgb hex values (e.g. '#800080' - include the '#')

leftImagesA [Array | ``[]``]
    Set A of images to display on left of screen. Left stream will alternate between
    images from set A and from set B. Elements of list can be full URLs or relative
    paths starting from `baseDir`.

leftImagesB [Array | ``[]``]
    Set B of images to display on left of screen. Left stream will alternate between
    images from set A and from set B. Elements of list can be full URLs or relative
    paths starting from `baseDir`.

rightImagesA [Array | ``[]``]
    Set A of images to display on right of screen. Right stream will alternate between
    images from set A and from set B. Elements of list can be full URLs or relative
    paths starting from `baseDir`.

rightImagesB [Array | ``[]``]
    Set B of images to display on right of screen. Right stream will alternate between
    images from set A and from set B. Elements of list can be full URLs or relative
    paths starting from `baseDir`.

Data collected
----------------

The fields added specifically for this frame type are:

leftSequence [Array]
    Sequence of images shown on the left

rightSequence [Array]
    Sequence of images shown on the right

hasBeenPaused [Boolean]
    Whether the trial was paused at any point

Events recorded
----------------

The events recorded specifically by this frame are:

:stoppingCapture: Just before stopping webcam video capture

:startIntro: Immediately before starting intro/announcement segment

:startTestTrial: Immediately before starting test trial segment

:clearImages: Records each time images are cleared from display

:presentImages: Immediately after making images visible

    :left: url of left image
    :right: url of right image