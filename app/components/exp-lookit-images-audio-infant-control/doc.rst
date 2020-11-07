.. _exp-lookit-images-audio-infant-control:

exp-lookit-images-audio-infant-control
==============================================

Overview
------------------

Infant-controlled version of the :ref:`exp-lookit-images-audio` frame. This works the same way as
``exp-lookit-images-audio`` except that you can enable the parent to:

- end the trial by pressing the ``endTrialKey`` key
- hold down the ``lookawayKey`` (or the mouse button) to indicate that the child is not looking; the trial will automatically end
  after the lookaway criterion is met. If the 'lookawayTone' is not 'none' a noise is played while the child is looking
  away to help the parent know the looking coding is working.

You can disable either of these behaviors by setting the corresponding key to ``''``.

The frame will still end when it would have anyway if neither of these things happen! For instance, if you would have
displayed an image for 30 seconds, then after 30 seconds the frame will move on, serving as a "ceiling" on looking time.

Lookaway criterion
~~~~~~~~~~~~~~~~~~~~~~~

You have two options for how to determine when the child has looked away long enough to proceed.

1. Set the ``lookawayType`` to ``"total"`` to accumulate lookaway time until the child has looked away for a total of
`lookawayThreshold` seconds. (For instance, if the ``lookawayThreshold`` is 2, then the trial will end after the child
looks away for 0.5s, then 1s, then 0.5s.)
2. Set the ``lookawayType`` to ``"continuous"`` to require that the child look
away for a continuous ``lookawayThreshold``-second interval. (For instance, if the ``lookawayThreshold`` is 2, then the
child might look away for 1s, 1.5s, and 1s but the trial would continue until she looked away for 2s.)

When looking time is measured
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The looking time measurement begins only when the video starts, not while a video connection is established.

If a ``lookawayKey`` is defined, lookaways are recorded the entire time the frame is running. However, the looking
time measurement only starts once images are displayed (or the "delay" timer starts counting down, for images
shown at a delay - but e.g., not during webcam connection). Lookaways at the very
start don't count! If the child is not looking at the start, the measurement begins once they look
for the first time.

Examples
----------------

This frame will display an image of some cats for up to 30 seconds. Once the child looks away for more
than 2 s total, as coded by the parent holding down the P key, it will proceed.

.. code:: javascript

    "looking-time-ceil-30s": {
        "kind": "exp-lookit-images-audio-infant-control",
        "lookawayKey": "p",
        "lookawayType": "total",
        "lookawayThreshold": 2,
        "endTrialKey": "q",
        "lookawayTone": "noise",
        "lookawayToneVolume": 0.25,

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
        "durationSeconds": 30,
        "maximizeDisplay": true
    }



Parameters
----------------

The parameters for this frame are the same as for :ref:`exp-lookit-images-audio`, plus the additional parameters
provided by the :ref:`infant-controlled-timing mixin`.

Data collected
----------------

This frame collects the same data as :ref:`exp-lookit-images-audio`, plus the additional data
provided by the :ref:`infant-controlled-timing mixin`.

Events recorded
----------------

This frame records the same events as :ref:`exp-lookit-images-audio`, plus the additional events
recorded by the :ref:`infant-controlled-timing mixin`.