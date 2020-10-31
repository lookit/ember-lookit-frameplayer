.. _exp-lookit-calibration:

exp-lookit-calibration
==============================================

Overview
------------------

Frame to do calibration for looking direction. Shows a small video/image in a sequence
of locations so you'll have video of the child looking to those locations at known times.

The attention-grabber can be either a small video or an image (see examples below of each).
Images can be animated (spinning or bouncing).

The image or video can be displayed at center, left, or right of the screen. You can specify the sequence
of positions or use the default ['center', 'left', 'right', 'center']. Each time it moves,
the video (if any) and audio restart, and an event is recorded with the location and time (and time
relative to any video recording) of the segment start.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-calibration.png
    :alt: Example screenshot from exp-lookit-calibration frame

Recording
~~~~~~~~~~

Generally you will want to have webcam video of this frame. You can set doRecording to true to
make a video clip just for this frame. Recording will begin at the same time the first calibration
stimulus is shown. Alternately, you can use session-level recording (set
startSessionRecording to true on this or a previous frame). If either type of recording
is starting on this frame, it waits until recording starts to display the first calibration
segment.

Fullscreen display
~~~~~~~~~~~~~~~~~~~

This frame is displayed fullscreen, to match the frames you will likely want to compare
looking behavior on. If the participant leaves fullscreen, that will be
recorded as an event, and a large "return to fullscreen" button will be displayed. Don't
use video coding from any intervals where the participant isn't in fullscreen mode - the
position of the attention-grabbers won't be as expected.

If the frame before this is not fullscreen, that frame
needs to include a manual "next" button so that there's a user interaction
event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
without a user event.)

Specifying where files are
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Several of the parameters for this frame can be specified either by providing a list of full URLs and file types, or
by providing just a filename that will be interpreted relative to the ``baseDir``. See the :ref:`expand-assets` tool that this frame uses.

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`video-record`
- :ref:`expand-assets`


Examples
----------------

This frame will show an image at center, left, and right, along with chimes each time.

.. code:: javascript

    "calibration-with-image": {
        "kind": "exp-lookit-calibration",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "audioTypes": [
            "ogg",
            "mp3"
        ],
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "calibrationImage": "peekaboo_remy.jpg",
        "calibrationLength": 3000,
        "calibrationPositions": [
            "center",
            "left",
            "right"
        ],
        "calibrationAudio": "chimes",
        "calibrationImageAnimation": "spin"
    }

This frame will show a small video at center, left, and right, along with chimes each time.

.. code:: javascript

    "calibration-with-video": {
        "kind": "exp-lookit-calibration",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "audioTypes": [
            "ogg",
            "mp3"
        ],
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "calibrationLength": 3000,
        "calibrationPositions": [
            "center",
            "left",
            "right"
        ],
        "calibrationAudio": "chimes",
        "calibrationVideo": "attentiongrabber"
    }

Parameters
----------------

.. glossary::

    doRecording [Boolean | ``true``]
        Whether to do any video recording during this frame. Default true. Set to false for e.g. last frame where just doing an announcement.

    backgroundColor [String | ``white``]
        Color of background. See `CSS specs <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value>`__
        for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
        rgb hex values (e.g. '#800080' - include the '#')

    calibrationLength [Number | ``3000``]
        Length of each calibration segment in ms

    calibrationPositions [Array | ``['center', 'left', 'right', 'center']``]
        Ordered list of positions to show calibration segment in. Options are
        "center", "left", "right". Ignored if calibrationLength is 0.


    calibrationAudio [String or Array | ``[]``]
        Audio to play when the attention-grabber is placed at each location (will be
        played once from the start, but cut off if it's longer than calibrationLength).

        This can either be an array of `{src: 'url', type: 'MIMEtype'}` objects for
        calibration audio, or just a string to use the full URLs based on `baseDir`.

    calibrationVideo [String or Array | ``[]``]
        Calibration video (played from start at each calibration position). Supply
        either a calibration video or calibration image, not both.

        This can be either an array of {src: 'url', type: 'MIMEtype'} objects or
        just a string like `attentiongrabber` to rely on the `baseDir` and `videoTypes`
        to generate full paths.

    calibrationImage [String | ``''``]
        Image to use for calibration - will be placed at each location. Supply
        either a calibration video or calibration image, not both.

        This can be either a full URL or just the filename (e.g. "star.png") to
        use the full path based on `baseDir` (e.g. `baseDir/img/star.png`).

    calibrationImageAnimation [String | ``'spin'``]
        Which animation to use for the calibration image. Options are 'bounce', 'spin',
        or '' (empty to not animate).


Data collected
----------------

No data is recorded specifically by this frame type.

Events recorded
----------------

The events recorded specifically by this frame are:

:startCalibration: Beginning of each calibration segment

    :location: [String]
        The location of calibration image/video, relative to child: 'left', 'right', or 'center'