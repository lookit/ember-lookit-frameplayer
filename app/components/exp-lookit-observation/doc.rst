.. _exp-lookit-observation:

exp-lookit-observation
==============================================

Overview
------------------

A frame to collect a video observation with the participant's help. By default the
webcam is displayed to the participant and they can choose when to start, pause, and
resume recording. The duration of an individual recording can optionally be limited
and/or recording can be started automatically. This is intended for cases where we
want the parent to perform some test or behavior with the child, rather than
presenting stimuli ourselves. E.g., you might give instructions to conduct a structured
interview and allow the parent to control recording.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-observation.png
    :alt: Example screenshot from exp-lookit-observation frame

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`video-record`


Examples
----------------

This frame will play through a central video of Kim introducing an apple two times, then proceed.

.. code:: javascript

    "observation": {
        "kind": "exp-lookit-observation",
        "blocks": [
            {
                "title": "Lorem ipsum dolor sit amet",
                "listblocks": [
                    {
                        "text": "consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    },
                    {
                        "text": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                    }
                ]
            }
        ],
        "hideWebcam": true,
        "hideControls": false,
        "recordSegmentLength": 10,
        "startRecordingAutomatically": false,
        "nextButtonText": "move on",
        "showPreviousButton": false
    }



Parameters
----------------

hideWebcam [Boolean | ``false``]
    Whether to hide webcam view when frame loads (participant will still be able to show manually)

blocks [Array]
    Array of blocks specifying specifying text/images of instructions to display,
    rendered by :ref:`exp-text-block`

showPreviousButton [Boolean | ``true``]
    Whether to show a 'previous' button

nextButtonText [String | ``'Next'``]
    Text to display on the 'next frame' button

recordSegmentLength [Number | ``300``]
    Number of seconds to record for before automatically pausing. Use 0 for no limit.

startRecordingAutomatically [Boolean | ``false``]
    Whether to automatically begin recording upon frame load

recordingRequired [Number | ``0``]
    Whether a recording must be made to proceed to next frame. 'Next' button
    will be disabled until recording is made if so. 0 to not require recording;
    any positive number to require that many seconds of recording

hideControls [Boolean | ``false``]
    Whether to hide video recording controls (only use with startRecordingAutomatically)

Data collected
----------------

No fields are added specifically for this frame type.


Events recorded
----------------

The events recorded specifically by this frame are:

:webcamHidden: Webcam display hidden at start of frame due to ``hideWebcam`` parameter

:hideWebcam: Webcam display toggled off by participant

:showWebcam: Webcam display toggled on by participant

:recorderTimeout: Video recording automatically paused upon reaching time limit