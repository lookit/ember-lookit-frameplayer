.. _exp-lookit-webcam-display:

exp-lookit-webcam-display
==============================================

Overview
------------------

A frame to display the user's webcam stream, along with a small amount of optional text.
Expected use is as a break during an experiment, e.g. to check positioning, but could
also be used as a lightweight frame for data collection or during setup.

Not fullscreen by default, but can be displayed fullscreen as shown in example below.
Can optionally record video.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-webcam-display.png
    :alt: Example screenshot from exp-lookit-webcam-display frame


More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`video-record`


Example
----------------

.. code:: javascript

    "webcam-display-break": {
        "kind": "exp-lookit-webcam-display",
        "blocks": [
            {
                "title": "Let's take a quick break",
                "listblocks": [
                    {
                        "text": "Please check that your child is still visible"
                    },
                    {
                        "text": "You can make some silly faces!"
                    }
                ]
            }
        ],
        "nextButtonText": "Next",
        "showPreviousButton": false,
        "displayFullscreenOverride": true,
        "startRecordingAutomatically": false
    }



Parameters
----------------

blocks [Array]
    Array of blocks specifying text/images of instructions to display, rendered by :ref:`exp-text-block`.

startRecordingAutomatically [Boolean | ``false``]
    Whether to automatically begin recording upon frame load

nextButtonText
    Text to display on the 'next frame' button

showPreviousButton
    Whether to show a 'previous' button

Data collected
----------------

The fields added specifically for this frame type are:

<None>

Events recorded
----------------

The events recorded specifically by this frame are:

<None>