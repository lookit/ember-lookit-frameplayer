Welcome to the Lookit experiment runner's documentation!
=========================================================

Building a study on Lookit and using Lookit's own experiment runner? You're in the right place to learn how to put
together the study protocol you have in mind. To the left you can find information about...

Features common to all frames
------------------------------

There are some features that are common to all frames, like being able to set a ``generateProperties`` function to
adjust parameters on-the-fly based on what the child has done so far:

.. toctree::
    :maxdepth: 2
    :caption: Common to all frames
    :hidden:

    components/exp-frame-base/doc.rst

Specific frames
----------------

These are you can use in your Lookit study, like instructions pages or looking-time trials.
The documentation will tell you how each frame works, what data it collects, and what parameters you need to give it.

.. toctree::
   :maxdepth: 2
   :caption: Frames
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

   components/exp-lookit-composite-video-trial/doc.rst

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

   mixins/expand-assets-doc.rst
   mixins/infant-controlled-timing-doc.rst
   mixins/video-record-doc.rst

Randomizers
------------

This special type of frame allows you to randomize the study procedure without writing any code.
These can be used to set up counterbalancing or condition assignment. The randomizers described here correspond to
values for 'sampler' when you define a frame with type 'choice'. The documentation will tell you how each randomizer
works and what parameters you need to give it.

.. toctree::
   :maxdepth: 2
   :caption: Randomizers
   :hidden:

Utilities
-------------


.. toctree::
   :maxdepth: 2
   :caption: Utilities
   :hidden:

   components/exp-text-block/doc.rst


.. toctree::
   :maxdepth: 2
   :caption: Deprecated frames
   :hidden:

   components/exp-lookit-composite-video-trial/doc.rst
   components/exp-lookit-dialogue-page/doc.rst
   components/exp-lookit-geometry-alternation/doc.rst
   components/exp-lookit-geometry-alternation-open/doc.rst
   components/exp-lookit-preferential-looking/doc.rst
   components/exp-lookit-story-page/doc.rst
