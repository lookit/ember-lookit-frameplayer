exp-lookit-composite-video-trial
==============================================

Composite video display for typical looking measures trials (e.g. preferential looking,
looking time). (Previously called exp-lookit-video.)

Overview of phases
------------------

The trial consists of four phases, each of which is optional.

1. **Announcement:** The audio in audioSources is played while the attnSources video is played centrally, looping as needed. This lasts for announceLength seconds or the duration of the audio, whichever is longer. To skip this phase, set announceLength to 0 and do not provide audioSources.

2. **Intro:** The introSources video is played centrally until it ends. To skip this phase, do not provide introSources.

3. **Calibration:** The video in calibrationVideoSources is played (looping as needed) in each of the locations specified in calibrationPositions in turn, remaining in each position for calibrationLength ms. At the start of each position the audio in calibrationAudioSources is played once. (Audio will be paused and restarted if it is longer than calibrationLength.) Set calibrationLength to 0 to skip calibration.

4. **Test:** The video in sources and audio in musicSources (optional) are played until either: testLength seconds have elapsed (with video looping if needed), or the video has been played testCount times. If testLength is set, it overrides testCount - for example if testCount is 1 and testLength is 30, a 10-second video will be played 3 times. If the participant pauses the study during the test phase, then after restarting the trial, the video in altSources will be used again (defaulting to the same video if altSources is not provided). To skip this phase, do not provide sources.

Display
-------

This frame is displayed fullscreen. If the previous frame is not fullscreen, then that frame
needs to include a manual "next" button so that there's a user interaction
event to trigger fullscreen mode. (Browsers don't allow us to switch to fullscreen mode
without a user event.)


Specifying media locations
---------------------------

For any parameters that expect a list of audio/video sources, you have two options:

1. You can provide a list of src/type pairs with full paths, like this:

.. code:: javascript

    [
        {
            'src': 'http://.../video1.mp4',
            'type': 'video/mp4'
        },
        {
            'src': 'http://.../video1.webm',
            'type': 'video/webm'
        }
    ]

2. You can provide a single string 'stub', which will be expanded based on the parameter ``baseDir`` and the media types expected (either ``audioTypes`` or
``videoTypes`` as appropriate).

For example, if you provide the audio source
```intro```, ``baseDir`` is ``https://mystimuli.org/mystudy/``, and ``audioTypes`` is ``['mp3', 'ogg']``, then this
will be expanded to:

.. code:: javascript

     [
            {
                src: 'https://mystimuli.org/mystudy/mp3/intro.mp3',
                type: 'audio/mp3'
            },
            {
                src: 'https://mystimuli.org/mystudy/ogg/intro.ogg',
                type: 'audio/ogg'
            }
    ]

This allows you to simplify your JSON document a bit and also easily switch to a
new version of your stimuli without changing every URL. You can mix source objects with
full URLs and those using stubs within the same directory. However, any stimuli
specified using stubs MUST be
organized as expected under ``baseDir/MEDIATYPE/filename.MEDIATYPE``.


