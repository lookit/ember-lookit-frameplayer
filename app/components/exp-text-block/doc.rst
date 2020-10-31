.. _exp-text-block:

exp-text-block
==============================================

Overview
------------------

This is a small utility for displaying text that is used by a variety of frames. If a parameter says it will be rendered
using exp-text-block, see below for how to format that parameter.

Examples
----------------

This frame will play through a central video of Kim introducing an apple up to five times. Once the child looks away for more
than 2 s total, as coded by the parent holding down the P key, it will proceed.

.. code:: javascript

    "play-video-five-times": {
        "kind": "exp-lookit-video-infant-control",
        "lookawayKey": "p",
        "lookawayType": "total",
        "lookawayThreshold": 2,
        "endTrialKey": "q",
        "lookawayTone": "noise",
        "lookawayToneVolume": 0.25,

        "audio": {
            "loop": false,
            "source": "peekaboo"
        },
        "video": {
            "top": 10,
            "left": 25,
            "loop": true,
            "width": 50,
            "source": "cropped_apple"
        },
        "backgroundColor": "white",
        "autoProceed": true,
        "parentTextBlock": {
            "text": "If your child needs a break, just press X to pause!"
        },
        "requiredDuration": 0,
        "requireAudioCount": 0,
        "requireVideoCount": 5,
        "restartAfterPause": true,
        "pauseKey": "x",
        "pauseKeyDescription": "X",
        "pauseAudio": "pause",
        "pauseVideo": "attentiongrabber",
        "pauseText": "(You'll have a moment to turn around again.)",
        "unpauseAudio": "return_after_pause",
        "doRecording": true,
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "audioTypes": [
            "ogg",
            "mp3"
        ],
        "videoTypes": [
            "webm",
            "mp4"
        ]
    }

Parameters
----------------

