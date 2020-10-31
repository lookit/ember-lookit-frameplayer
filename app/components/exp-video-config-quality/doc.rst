exp-lookit-
==============================================

Overview
------------------

Video display frame. This may be used for looking measures (looking time, preferential looking, etc.) as well as
for brief filler between test trials or for displaying videos to older children or parents.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-video.png
    :alt: Example screenshot from exp-lookit-video frame



Recording
~~~~~~~~~~

Video (and audio if provided) start as soon as any recording begins, or right away if there is no recording starting.

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
  }



Parameters
----------------

.. glossary::

    video [Object | ``{}`` ]
        Object describing the video to show. It can have the following properties:

        :source: [String or Array]
            The location of the main video to play. This can be either
            an array of ``{'src': 'https://...', 'type': '...'}`` objects (e.g., to provide both
            webm and mp4 versions at specified URLS) or a single string relative to ``baseDir/<EXT>/``.

Data collected
----------------

The fields added specifically for this frame type are:

.. glossary::

    videoShown [String]
        Source of video  shown during this trial. Just stores first URL if multiple formats are offered.


Events recorded
----------------

The events recorded specifically by this frame are:

:videoStarted: When video begins playing (recorded each time video starts if played through more than once)
