exp-lookit-video
==============================================

.. js:autoclass:: ExpLookitVideo
   :members: *


Overview
------------------

Video display frame. This may be used for displaying videos to older children or parents, as well as for
typical looking measures trials or as brief filler in between test trials.

(Note: this frame replaced the previous exp-lookit-video frame, which is now called
:class:`ExpLookitCompositeVideoTrial`.)

This is very customizable: you can...
 - position the video wherever you want on the screen, including specifying that it should fill the screen (while maintaining aspect ratio)
 - choose the background color
 - optionally specify audio that should play along with the video
 - have the frame proceed automatically (``autoProceed``), or enable a Next button when the user can move on
 - allow parents to press a key to pause the video (and then either restart when they un-pause, or move on to the next frame)

Extends:
~~~~~~~~~

Below is information specific to this particular frame. There may also be parameters, events, and data collected that come from more general "mixins" it uses:

- video-record
- expand-assets

Recording
~~~~~~~~~~

Video (and audio if provided) start as soon as any recording begins, or right away if there is no recording starting.

Pausing
~~~~~~~~~~

If the user pauses using the ``pauseKey``, or if the user leaves fullscreen mode, the study will be paused. If you don't want to allow pausing during the
frame, set the ``pauseKey`` to an empty string (``""``).

While paused, the video/audio are stopped and not displayed, and instead a looping ``pauseVideo`` and text are displayed.

Specifying trial duration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

There are several ways you can specify how long the trial should last. The frame will continue until ALL of the following are true:

  - the video has been played all the way through ``requireVideoCount`` times
  - the audio has been played all the way through ``requireAudioCount`` times
  - ``requiredDuration`` seconds have elapsed since beginning the video

You do not need to use all of these. For instance, to play the video one time and then proceed, set
``requireVideoCount`` to 1 and the others to 0. You can also specify whether the audio and video should loop (beyond
what is necessary to reach the required counts).

Display
~~~~~~~~~~

This frame is displayed fullscreen; if the frame before it is not, that frame
needs to include a manual "next" button so that there's a user interaction
event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
without a user event.)


Examples
----------------

.. code:: json

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
  },

Parameters
----------------

Data collected
----------------

Events recorded
----------------
