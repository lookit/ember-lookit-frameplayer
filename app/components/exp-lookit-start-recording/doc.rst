.. _exp-lookit-start-recording:

exp-lookit-start-recording
==============================================

Overview
------------------

Dedicated frame to start session recording.

This frame will take a few seconds to get a session-level recording started, then proceed
immediately to the next frame. (See
:ref:`Lookit docs <recording-video>` for information about session-level vs. individual-frame recording.)

(You could also set startSessionRecording to true on any frame, but then you need to rely
on that individual frame's setup for waiting for recording before getting started.)

Just like for :ref:`exp-lookit-calibration`, you can display a video or an optionally animated
image (see below for examples of each) as a placeholder while getting recording started.


What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-start-recording.png
    :alt: Example screenshot from exp-lookit-start-recording frame


Display
~~~~~~~~~~

This can be displayed full-screen or not. If the following frame is full-screen, make this one full-screen too since there
will not be a user button press to start the next frame.

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

This frame will start a session-level recording, showing a spinning image until the recording starts:

.. code:: javascript

    "start-recording-with-image": {
        "kind": "exp-lookit-start-recording",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "image": "peekaboo_remy.jpg",
        "imageAnimation": "spin"
        "displayFullscreen": true
    }

This frame will start a session-level recording, showing a looping video until the recording starts:

.. code:: javascript

    "start-recording-with-video": {
        "kind": "exp-lookit-start-recording",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "video": "attentiongrabber",
        "displayFullscreen": true
    }



Parameters
----------------

displayFullscreen [Boolean | ``true``]
    Whether to display this frame in full-screen mode

backgroundColor [String | ``'white'``]
    Color of background. See `CSS specs <https://developer.mozilla.org/en-US/docs/Web/CSS/color_value>`__
    for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
    rgb hex values (e.g. '#800080' - include the '#')

video [String or Array]
    Video to play (looping) while waiting. You can optionally supply either a video or image, not both.

    This can be either an array of {src: 'url', type: 'MIMEtype'} objects or
    just a string like `attentiongrabber` to rely on the `baseDir` and `videoTypes`
    to generate full paths.

image [String]
    Image to display while waiting. You can optionally supply either a video or image, not both.

    This can be either a full URL or just the filename (e.g. "star.png") to
    use the full path based on `baseDir` (e.g. `baseDir/img/star.png`).

imageAnimation [String | ``'spin'``]
    Which animation to use for the image. Options are 'bounce', 'spin', or '' (empty to not animate).

Data collected
----------------

No fields are added specifically for this frame type.

Events recorded
----------------

No events are recorded specifically by this frame.