.. _exp-lookit-video:

exp-lookit-video
==============================================

Overview
------------------

Video display frame. This may be used for looking measures (looking time, preferential looking, etc.) as well as
for brief filler between test trials or for displaying videos to older children or parents.

(Note: this frame replaced a now-deprecated exp-lookit-video frame, now called ``exp-lookit-composite-video-trial``.)

This is very customizable: you can...

 - position the video wherever you want on the screen, including specifying that it should fill the screen (while maintaining aspect ratio)
 - choose the background color
 - optionally specify audio that should play along with the video
 - have the frame proceed automatically (``autoProceed``), or enable a Next button when the user can move on
 - allow parents to press a key to pause the video (and then either restart when they un-pause, or move on to the next frame)

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-video.png
    :alt: Example screenshot from exp-lookit-video frame


Specifying trial duration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

There are several ways you can specify how long the trial should last. The frame will continue until ALL of the following are true:

  - the video has been played all the way through ``requireVideoCount`` times
  - the audio has been played all the way through ``requireAudioCount`` times
  - ``requiredDuration`` seconds have elapsed since beginning the video

You do not need to use all of these. For instance, to play the video one time and then proceed, set
``requireVideoCount`` to 1 and the others to 0. You can also specify whether the audio and video should loop (beyond
what is necessary to reach the required counts).

After the required number of video play-throughs, the video will either freeze or continue looping (depending on the
``loop`` property of your ``video`` parameter). Likewise, the audio will either stop or continue looping after
the required number of audio play-throughs.

Recording
~~~~~~~~~~

Video (and audio if provided) start as soon as any recording begins, or right away if there is no recording starting.

Pausing
~~~~~~~~~~

If the user pauses using the ``pauseKey``, or if the user leaves fullscreen mode, the study will be paused. If you don't
want to allow pausing during the frame, set the ``pauseKey`` to an empty string (``""``).

While paused, the video/audio are stopped and not displayed, and instead a looping ``pauseVideo`` and text are displayed.

Leaving fullscreen mode will also pause the trial. For this reason, it's important to specify pause/unpause audio even
if you plan to disable pausing!

Display
~~~~~~~~~~

This frame is displayed fullscreen; if the frame before it is not, that frame
needs to include a manual "next" button so that there's a user interaction
event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
without a user event.)

Specifying where files are
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Several of the parameters for this frame can be specified either by providing a list of full URLs and file types, or
by providing just a filename that will be interpreted relative to the ``baseDir``. These are: ``audio``
(``source`` property), ``pauseAudio``, ``unpauseAudio``, ``pauseVideo``, and ``video`` (``source``
property). See the :ref:`expand-assets` tool that this frame uses.

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`video-record`
- :ref:`expand-assets`


Examples
----------------

This frame will play through a central video of Kim introducing an apple two times, then proceed.

.. code:: javascript

   "play-video-twice": {
      "kind": "exp-lookit-video",

      "video": {
          "top": 10,
          "left": 25,
          "loop": false,
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
      "requireVideoCount": 2,
      "doRecording": true,

      "pauseKey": "x",
      "pauseKeyDescription": "X",
      "restartAfterPause": true,
      "pauseAudio": "pause",
      "pauseVideo": "attentiongrabber",
      "pauseText": "(You'll have a moment to turn around again.)",
      "unpauseAudio": "return_after_pause",

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

This frame plays some audio announcing the next trial while an attention-grabber video loops. It doesn't record
webcam video.

.. code:: javascript

   "announce-next-trial": {
      "kind": "exp-lookit-video",

      "audio": {
          "loop": false,
          "source": "video_01"
      },
      "video": {
          "top": 10,
          "left": 40,
          "loop": true,
          "width": 20,
          "source": "attentiongrabber"
      },
      "backgroundColor": "white",
      "autoProceed": true,
      "parentTextBlock": {
          "text": "If your child needs a break, just press X to pause!"
      },

      "requiredDuration": 0,
      "requireAudioCount": 1,
      "requireVideoCount": 0,
      "doRecording": false,

      "pauseKey": "x",
      "pauseKeyDescription": "X",
      "restartAfterPause": true,
      "pauseAudio": "pause",
      "pauseVideo": "attentiongrabber",
      "pauseText": "(You'll have a moment to turn around again.)",
      "unpauseAudio": "return_after_pause",

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

video [Object]
    Object describing the video to show. It can have the following properties:

    :source: [String or Array]
        The location of the main video to play. This can be either
        an array of ``{'src': 'https://...', 'type': '...'}`` objects (e.g., to provide both
        webm and mp4 versions at specified URLS) or a single string relative to ``baseDir/<EXT>/``.

    :left: [Number]
        left margin, as percentage of screen width. If none of left, width, top, and height is provided,
        the image is centered horizontally at its original size.

    :width: [Number]
        video width, as percentage of screen width. Note: in general only provide one of width and height;
        the other will be adjusted to preserve the video aspect ratio.

    :top: [Number]
        top margin, as percentage of video area height (i.e. 100 = whole screen, unless parent text or next button are
        shown). If no positioning parameters are provided, the image is centered vertically.

    :height: [Number]
        video height, as percentage of video area height. Note: in general only provide one of width and height;
        the other will be adjusted to preserve the video aspect ratio.

    :position: [String]
        set to 'fill' to fill the screen as much as possible while preserving aspect ratio. This overrides any
        left/width/top/height values.

    :loop: [Boolean]
        whether the video should loop, even after any ``requireTestVideoCount`` is satisfied.

audio [Object | ``{}``]
    Object describing the audio to play along with video, if any. Can have properties:

    :source: [String or Object]
        Location of the audio file to play. This can either be an array of {src: 'url', type: 'MIMEtype'} objects, e.g.
        listing equivalent .mp3 and .ogg files, or can be a single string ``filename``
        which will be expanded based on ``baseDir`` and ``audioTypes`` values (see ``audioTypes``).

    :loop: [Boolean]
        whether the video audio loop, even after any ``requireTestAudioCount`` is satisfied.

autoProceed [Boolean | ``true``]
    Whether to proceed automatically when video is complete / requiredDuration is
    achieved, vs. enabling a next button at that point.

    If true, the frame auto-advances after ALL of the following happen

    (a) the requiredDuration (if any) is achieved, counting from the video starting
    (b) the video is played requireVideoCount times
    (c) the audio is played requireAudioCount times

    If false: a next button is displayed. It becomes possible to press 'next'
    only once the conditions above are met.

backgroundColor [String | ``'white'``]
    Color of background. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
    for acceptable syntax: can use color names ('blue', 'red', 'green', etc.), or
    rgb hex values (e.g. '#800080' - include the '#'). We recommend a light background if you need to
    see children's eyes.

pauseVideo [String or Array]
    Video to show (looping) when trial is paused. As with the main video source, this can either be an array of
     ``{'src': 'https://...', 'type': '...'}`` objects (e.g. providing both webm and mp4 versions at specified URLS)
     or a single string relative to ``baseDir/<EXT>/``.

pauseAudio [String or Array]
    Audio to play [one time] upon pausing study, e.g. "Study paused." This can be either an array of
    ``{src: 'url', type: 'MIMEtype'}`` objects or a single string relative to ``baseDir/<EXT>``.

unpauseAudio [String or Array]
    Audio to play [one time] when participant resumes the study, before actually resuming. E.g. this might give them
    a chance to get back in position. This can be either an array of
    ``{src: 'url', type: 'MIMEtype'}`` objects or a single string relative to ``baseDir/<EXT>``.

pauseKey [String | ``' '``]
    Key to pause the trial. Use an empty string, '', to not allow pausing using the keyboard. You can look up the names of keys at
    https://keycode.info. Default is the space bar (' ').

pauseKeyDescription [String | ``'space'``]
    Parent-facing description of the key to pause the study. This is just used to display text
    "Press {pauseKeyDescription} to resume" when the study is paused.

restartAfterPause [Boolean | ``true``]
    Whether to restart this frame upon unpausing, vs moving on to the next frame

pauseText [String | "(You'll have a moment to turn around again.)"]
    Text to show under "Study paused / Press space to resume" when study is paused.

requiredDuration [Number | ``0``]
    Duration to require before proceeding, if any. Set if you want a time-based limit.
    E.g., setting requiredDuration to 20 means that the first 20 seconds of the video will be played, with
    shorter videos looping until they get to 20s. Leave out or set to 0 to play the video through to the end
    a set number of times instead.

requireVideoCount [Number | ``1``]
    Number of times to play test video before moving on.

requireAudioCount [Number | ``0``]
    Number of times to play test audio before moving on

doRecording [Boolean | ``true``]
    Whether to do any (frame-specific) video recording during this frame. Set to false for e.g. last frame where just doing an
    announcement.

parentTextBlock [Object | ``{}``]
    Text block to display to parent. Can have the following fields, each optional:

    :title: String
        title to display

    :text: String
        paragraph of text

    :css: Object
        object specifying any css properties to apply to this section, and their values - e.g.
        ``{'color': 'gray', 'font-size': 'large'}``

Data collected
----------------

The fields added specifically for this frame type are:

videoShown [String]
    Source of video  shown during this trial. Just stores first URL if multiple formats are offered.

audioPlayed [String]
    Source of audio played during this trial. Just stores first URL if multiple formats are offered.

hasBeenPaused [Boolean]
    Whether the video was paused at any point during the trial

Events recorded
----------------

The events recorded specifically by this frame are:

:videoStarted: When video begins playing (recorded each time video starts if played through more than once)

:videoStopped: When video completes playback (recorded each time if played more than once)

:audioStarted: When audio begins playing (recorded each time video starts if played through more than once)

:audioStopped: When audio completes playback (recorded each time if played more than once)

:trialCompleted: When trial is complete and begins cleanup (may still then wait for video upload)

:pauseTrial: When trial is paused

:unpauseTrial: When trial is unpaused (actually proceeding to beginning or next frame, after unpauseAudio)

:nextButtonEnabled: When all requirements for this frame are completed and next button is enabled (only recorded if
    autoProceed is false)
