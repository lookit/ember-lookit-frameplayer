exp-lookit-composite-video-trial
==============================================

This frame is deprecated and will not be included in release 2.x.
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


