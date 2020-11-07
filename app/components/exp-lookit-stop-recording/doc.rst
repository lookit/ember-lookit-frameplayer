.. _exp-lookit-stop-recording:

exp-lookit-stop-recording
==============================================

Overview
------------------

Dedicated frame to stop session recording.

This frame will take a few seconds to upload an ongoing session-level recording, then proceed
immediately to the next frame.  (See
:ref:`Lookit docs <recording-video>`
for information about session-level vs. individual-frame recording.)

It will time out after a default of 5 minutes of waiting for the upload to complete, or
after 5 seconds of not seeing any progress (i.e. something went wrong with starting the
upload process). If there is no active session recording, it proceeds immediately.

(You could also set stopSessionRecording to true on any frame, but you generally wouldn't
get any specialized functionality for displaying a nice message about upload progress.)

Just like for :ref:`exp-lookit-calibration`, you can display a video or an optionally animated
image (see below for examples of each) as a placeholder while getting recording started.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-stop-recording.png
    :alt: Example screenshot from exp-lookit-stop-recording frame


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

This frame will stop a session-level recording, showing a spinning image until the recording is uploaded:

.. code:: javascript

    "stop-recording-with-image": {
        "kind": "exp-lookit-stop-recording",
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "image": "peekaboo_remy.jpg",
        "imageAnimation": "spin"
        "displayFullscreen": true
    }

This frame will stop a session-level recording, showing a looping video until the recording is uploaded:

.. code:: javascript

    "stop-recording-with-video": {
        "kind": "exp-lookit-stop-recording",
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

sessionMaxUploadSeconds: [Number | ``3000``]
    Maximum time allowed for whole-session video upload before proceeding, in seconds.
    Can be overridden by researcher, based on tradeoff between making families wait and
    losing data.

Data collected
----------------

No fields are added specifically for this frame type.

Events recorded
----------------

The events recorded specifically by this frame are:

:warningNoActiveSessionRecording: If there's no active session recording so this frame is proceeding immediately.

:warningUploadTimeoutError: If no progress update about upload is available within 10s, and
    frame proceeds automatically. Otherwise if the upload has started
    (e.g. we know it is 10% done) it will continue waiting.