.. _pause-unpause:

pause-unpause mixin
==============================================

Overview
------------------

This mixin provides shared functionality for frames that allow the family to pause and resume the study.

This "just works" out of the box; the default behavior allows the user to pause by pressing the space bar and
shows a simple text message. But you can customize pausing behavior by specifying:

- Whether to allow the user to pause (``allowUserPause``) and whether to pause when exiting fullscreen (``pauseWhenExitingFullscreen``)
- A key (``pauseKey``) that they press to pause/resume
- An image (``pauseImage``) or video (``pauseVideo``) displayed while the study is paused
- Audio to play when pausing (``pauseAudio``) and unpausing (``unpauseAudio``) the study
- What text to show while the study is pausing (``pausingText``) and paused (``pausedText``)
- What color the background of the paused screen should be (``pauseColor``)
- Whether to stop session recording when pausing (``stopSessionRecordingOnPause``)
- What frame to go to upon resuming the study (``frameOffsetAfterPause``) - e.g. to repeat the same frame upon resuming,
  vs. moving on to the next one, or restarting a whole block of trials

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Pause-unpause.png
    :alt: Example screenshot from paused study

Webcam recording
~~~~~~~~~~~~~~~~~~

If a frame-specific recording (``"doRecording": true``) is being made during the frame, that recording will stop when
the study pauses. The ``pausingText`` will be displayed until the recording is fully uploaded and the recorder is
destroyed. (You can adjust how long we wait before continuing even if we aren't sure the recording is fully uploaded by
adjusting ``maxUploadSeconds``; see :ref:`video-record`. You may want to use a relatively short interval here if you don't
plan to analyze data from trials that were paused anyway.)

If a session-level recording is ongoing during this frame, by default it continues while the study is paused. You can
alternately set ``stopSessionRecordingOnPause`` to ``true`` and it will work as described above. If you do this, you will
likely want to re-start session recording when the family resumes the study. Here is an example of pausing session recording
upon pausing the study during a calibration frame, and returning to the previous frame to re-start session recording
upon resuming:

.. code:: javascript

    {
        "frames": {
            ...
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
                "calibrationImageAnimation": "spin",
                "waitForUploadImage": "peekaboo_remy.jpg",

                "pauseVideo": "attentiongrabber",
                "pauseAudio": "pause",
                "unpauseAudio": "return_after_pause",

                "stopSessionRecordingOnPause": true,
                "doRecording": false,
                "frameOffsetAfterPause": -1
            },
            "start-recording": {
                "kind": "exp-lookit-start-recording"
            }
        },
        "sequence": [
            ...
            "start-recording",
            "calibration-with-image",
            ...
        ]
    }

Returning to previous frames: what collected data will look like
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If a family pauses and repeats the current frame or a previous one, the ID for that frame in your data will be suffixed
with ``'-repeat-1'`` (the first time), ``'-repeat-2'`` (the second time), and so on. For example, suppose your initial frame
sequence was

.. code::

    0-video-config
    1-video-consent
    2-start-recording
    3-test-trial
    4-stop-recording
    5-exit-survey

but the family paused the test trial twice and was sent back to start-recording. You would see data for frames:

.. code::

    0-video-config
    1-video-consent
    2-start-recording
    3-test-trial
    2-start-recording-repeat-1
    3-test-trial-repeat-1
    2-start-recording-repeat-2
    3-test-trial-repeat-2
    4-stop-recording
    5-exit-survey


Parameters
----------------

Any frame that uses this mixin will accept the following parameters in addition to the regular frame parameters:

pauseKey [String | ``' '``]
    Key parent can press to pause the study. Space bar by default; other (lowercase) characters can be specified (e.g. ``'x'``).

pausedText [String | ``'Study paused \n\n Press space to resume'``]
    Text to display when the study is paused. Edit this if your ``pauseKey`` is something besides the space bar!

pausingText [String | ``'Study pausing... \n\n Please wait'``]
    Text to display while the study is pausing (e.g., while webcam video is uploading).

pauseColor [String | ``'white'``]
     Background color of pause screen. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
     for acceptable syntax: can use either color names ('blue', 'red', 'green', etc.), or
     rgb hex values (e.g. '#800080' - include the '#'). The text on top of this will be either black or white
     depending on which will have higher contrast.

pauseVideo [String or Array]
    Video to show (looping) when trial is paused. This can either be an array of
    ``{'src': 'https://...', 'type': '...'}`` objects (e.g. providing both webm and mp4 versions at specified URLS)
    or a single string relative to ``baseDir/<EXT>/``. Either ``pauseVideo`` or ``pauseImage`` can be specified.

pauseImage [String]
    Image to show when trial is paused. This can either be a full URL or a filename relative to ``baseDir/img/``.
    Either ``pauseVideo`` or ``pauseImage`` can be specified.

pauseAudio [String or Array]
    Audio to play [one time] upon pausing study, e.g. "Study paused." This can be either an array of
    ``{src: 'url', type: 'MIMEtype'}`` objects or a single string relative to ``baseDir/<EXT>``.

unpauseAudio [String or Array]
    Audio to play [one time] when participant resumes the study, before actually resuming. E.g. this might give them
    a chance to get back in position. This can be either an array of
    ``{src: 'url', type: 'MIMEtype'}`` objects or a single string relative to ``baseDir/<EXT>``.

allowUserPause [Boolean | ``true``]
    Whether to allow the user to pause the study by pressing the ``pauseKey``

frameOffsetAfterPause [Number | ``0``]
    How many frames to proceed when restarting after pausing. 0 to restart this frame; 1 to proceed to next frame;
    -1 to start at previous frame; etc.

pauseWhenExitingFullscreen [Boolean]
    Whether to pause automatically upon exiting fullscreen mode. Default behavior is set by the frame using this mixin,
    and can be overridden by the researcher.

stopSessionRecordingOnPause [Boolean | ``false``]
    Whether to stop any ongoing session recording upon pausing - see discussion above.

Data collected
----------------

<None>

Events recorded
----------------

In addition to events recorded by the regular version of the frame, a frame that uses this mixin will record the following events:

:pauseStudy: When study begins pausing, due to user keypress or leaving fullscreen mode

:resumeStudy: When study begins resuming, due to user keypress