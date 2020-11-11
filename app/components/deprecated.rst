exp-lookit-composite-video-trial
==============================================

This frame has been removed as of release 2.0.0.
Please see `the old docs <https://lookit.github.io/lookit-frameplayer-docs/releases/v1.3.1/classes/Exp-lookit-composite-video-trial.html>`__.



Consider instead
------------------

- :ref:`exp-lookit-video` to play a video and optional audio, with more configurability & better timing precision for the recording. (:ref:`Update guide <update_composite_to_video>`)
- :ref:`exp-lookit-calibration` to show a calibration stimulus at specific locations, again with more configurability and better timing precision (:ref:`Update guide <update_composite_to_calibration>`)

There are up to four phases in the exp-lookit-composite-video-trial frame, each of which will become a new frame:

- An "announcement" with audio and a small attention-getter video. If using, turn this into a separate exp-lookit-video frame.
- Calibration where a video is shown at various locations. If using, turn this into an exp-lookit-calibration frame.
- An "intro" video which is played once through.  If using, turn this into a separate exp-lookit-video frame.
- A test video which can be played N times or for N seconds, along with optional audio. If using, turn this into a separate exp-lookit-video frame.


exp-lookit-dialogue-page
==============================================

This frame has been removed as of release 2.0.0.
Please see `the old docs <https://lookit.github.io/lookit-frameplayer-docs/releases/v1.3.1/classes/Exp-lookit-dialogue-page.html>`__.

Consider instead
------------------

- :ref:`exp-lookit-images-audio`, which should be able to do everything this frame can, but more reliably and with more options! (:ref:`Update guide <update_dialogue_to_images>`)


exp-lookit-geometry-alternation
==============================================

This frame has been removed as of release 2.0.0.
Please see `the old docs <https://lookit.github.io/lookit-frameplayer-docs/releases/v1.3.1/classes/Exp-lookit-geometry-alternation.html>`__.

Consider instead
------------------

The more general-purpose :ref:`exp-lookit-change-detection` frame which shows streams of images on each side, or
:ref:`exp-lookit-video` if you'd rather provide premade videos.

exp-lookit-geometry-alternation-open
==============================================

This frame has been removed as of release 2.0.0.
Please see `the old docs <https://lookit.github.io/lookit-frameplayer-docs/releases/v1.3.1/classes/Exp-lookit-geometry-alternation-open.html>`__.

Consider instead
------------------

The more general-purpose :ref:`exp-lookit-change-detection` frame which shows streams of images on each side, or
:ref:`exp-lookit-video` if you'd rather provide premade videos.

exp-lookit-preferential-looking
==============================================

This frame has been removed as of release 2.0.0.
Please see `the old docs <https://lookit.github.io/lookit-frameplayer-docs/releases/v1.3.1/classes/Exp-lookit-preferential-looking.html>`__.


Consider instead
------------------

- :ref:`exp-lookit-video` to play a video and optional audio, with more configurability & better timing precision for the recording.  (:ref:`Update guide <update_preferential_to_video>`)
- :ref:`exp-lookit-calibration` to show a calibration stimulus at specific locations, again with more configurability and better timing precision  (:ref:`Update guide <update_preferential_to_calibration>`)
- :ref:`exp-lookit-images-audio` to display images and play audio. (:ref:`Update guide <update_preferential_to_images>`)

exp-lookit-story-page
==============================================

This frame has been removed as of release 2.0.0.
Please see `the old docs <https://lookit.github.io/lookit-frameplayer-docs/releases/v1.3.1/classes/Exp-lookit-story-page.html>`__.

Consider instead
------------------

- :ref:`exp-lookit-images-audio`, which should be able to do everything this frame can, but more reliably and with more options! (:ref:`Update guide <update_dialogue_to_images>`)