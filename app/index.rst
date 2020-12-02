.. _index:

Welcome to the Lookit experiment runner's documentation!
=========================================================

Building a study on Lookit and using Lookit's own experiment runner? You're in the right place to learn how to put
together the study protocol you have in mind. To the left you can find information about...

Specifying your study protocol
-------------------------------

There are some features that are common to all frames, like being able to set a ``generateProperties`` function to
adjust parameters on-the-fly based on what the child has done so far:

.. toctree::
    :maxdepth: 2
    :caption: Study protocol
    :hidden:

    utils/protocol.rst
    utils/protocol-generator.rst


Features common to all frames
------------------------------

There are some features that are common to all frames, like being able to set a ``generateProperties`` function to
adjust parameters on-the-fly based on what the child has done so far:

.. toctree::
    :maxdepth: 2
    :caption: Common to all frames
    :hidden:

    components/exp-frame-base/doc.rst
    components/exp-frame-base/parameters.rst
    components/exp-frame-base/groups.rst
    components/exp-frame-base/conditional_logic.rst

Specific frames
----------------

These are you can use in your Lookit study, like instructions pages or looking-time trials.
The documentation will tell you how each frame works, what data it collects, and what parameters you need to give it.

.. toctree::
   :maxdepth: 2
   :caption: Specific frames
   :hidden:

   components/exp-frame-select/doc.rst
   components/exp-lookit-calibration/doc.rst
   components/exp-lookit-change-detection/doc.rst
   components/exp-lookit-exit-survey/doc.rst
   components/exp-lookit-images-audio/doc.rst
   components/exp-lookit-images-audio-infant-control/doc.rst
   components/exp-lookit-instruction-video/doc.rst
   components/exp-lookit-instructions/doc.rst
   components/exp-lookit-mood-questionnaire/doc.rst
   components/exp-lookit-observation/doc.rst
   components/exp-lookit-start-recording/doc.rst
   components/exp-lookit-stimuli-preview/doc.rst
   components/exp-lookit-stop-recording/doc.rst
   components/exp-lookit-survey/doc.rst
   components/exp-lookit-text/doc.rst
   components/exp-lookit-video/doc.rst
   components/exp-lookit-video-assent/doc.rst
   components/exp-lookit-video-consent/doc.rst
   components/exp-lookit-video-infant-control/doc.rst
   components/exp-lookit-webcam-display/doc.rst
   components/exp-video-config/doc.rst
   components/exp-video-config-quality/doc.rst

Mixins
------------

Some frames use "mixins" that provide some shared functionality. For instance, a few frames use the "infant-controlled-timing"
mixin that allows you to specify a button for the parent to press to indicate the child isn't looking, and move on
after a specified lookaway time. Each frame will say what mixins it uses, but to keep things concise, you'll find
information about what parameters to include and what data will be collected here.

.. toctree::
   :maxdepth: 2
   :caption: Mixins
   :hidden:

   mixins/expand-assets.rst
   mixins/infant-controlled-timing.rst
   mixins/pause-unpause.rst
   mixins/video-record.rst

Randomization
--------------

Generally, you’ll want to show slightly different versions of the study
to different participants: perhaps you have a few different conditions,
and/or need to counterbalance the order of trials or left/right position
of stimuli. You have several options for how to handle this, depending on your preferences
and the complexity of your design.


.. toctree::
   :maxdepth: 2
   :caption: Randomization
   :hidden:

   randomizers/overview.rst
   randomizers/permute.rst
   randomizers/random-parameter-set.rst
   randomizers/select.rst


.. toctree::
   :maxdepth: 2
   :caption: Utilities
   :hidden:

   components/exp-text-block/doc.rst


.. toctree::
   :maxdepth: 2
   :caption: Deprecated frames
   :hidden:

   components/deprecated.rst
