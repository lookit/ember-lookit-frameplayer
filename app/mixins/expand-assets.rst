.. _expand-assets:

expand-assets mixin
==============================================

Overview
----------------

Frames that use this mixin allow you to specify some media locations (i.e., where your audio, video, or image is located)
relative to a base directory with a specific file structure, rather than always giving the full URL. This can make your
protocol configuration easier to read, reason about, and share productively (you can provide a copy of your stimuli
directory to someone looking to replicate your work, for instance).

Directory structure
~~~~~~~~~~~~~~~~~~~~~

The files inside your base directory must be structured in a particular way for the experiment runner to find them!

Inside your base directory, you should have an ``img`` directory for images, and then one directory for each audio or
video format you use - named exactly the same as the filename extension, like ``mp3`` or ``mp4``.

Here's an example of what your directory might look like if you have mp3 and mp4 files:

.. code::

    baseDir
        img
            cat.jpg
            dog.jpg
        mp3
            meow.mp3
            ruff.mp3
        mp4
            cat_yawning.mp4
            dog_playing.mp4

If you choose to provide multiple file formats for your media files, the alternate versions should have exactly the same
filenames except for the extensions. Here's an example like the above, except that we have both mp3 and ogg files for
audio, and both mp4 and webm for video:

.. code::

    baseDir
        img
            cat.jpg
            dog.jpg
        mp3
            meow.mp3
            ruff.mp3
        ogg
            meow.ogg
            ruff.ogg
        mp4
            cat_yawning.mp4
            dog_playing.mp4
        webm
            cat_yawning.webm
            dog_playing.webm


Images
~~~~~~~

Include extensions in your image filenames when specifying them on a frame that uses the expand-assets mixin.
Anything without ``://`` in the string will be assumed to be a relative image source, and the experiment runner will
look in your base directory's ``img`` directory. For instance, the following two image specifications would be
equivalent for specifying which image to use during calibration in the :ref:`exp-lookit-calibration` frame:

.. code::

    "calibrationImage": "cat.jpg"
    "baseDir": "MYBASEDIR"

.. code::

    "calibrationImage": "MYBASEDIR/img/cat.jpg"

"MYBASEDIR" is a placeholder for whatever the URL to your base directory is - it might be something like
``https://raw.githubusercontent.com/kimberscott/lookit-stimuli-template/master/`` if you're using the GitHub stimuli
template, or something like ``https://www.mit.edu/~kimscott/placeholderstimuli/`` if you're using your university's
web hosting.

Audio files
~~~~~~~~~~~~~

Do not include the extensions when specifying audio files relative to the base directory. Specify all the audio types that
are available (all the subdirectories you have for audio extensions) in the ``audioTypes`` parameter. If you wanted had a directory
structure like the first one above, with mp3 files only for audio, you could specify the "meow.mp3" file to use during
calibration in the :ref:`exp-lookit-calibration` frame:

.. code::

    "calibrationAudio": "meow",
    "audioTypes": [ "mp3" ],
    "baseDir": "MYBASEDIR"

If you have both mp3 and ogg file formats, you would instead write:

.. code::

    "calibrationAudio": "meow",
    "audioTypes": [ "mp3", "ogg" ],
    "baseDir": "MYBASEDIR"

Alternately, you can still provide full paths to your audio files. To provide full paths to audio files,
you enter a **list** of "sources". Each element in the list provides both the URL
and the file type, like this:

.. code:: json

   [
       {
           "src": "https://stimuli.org/myAudioFile.mp3",
           "type": "audio/mp3"
       },
       {
           "src": "https://stimuli.org/myAudioFile.ogg",
           "type": "audio/ogg"
       }
   ]

If you only have one file type, you would still need to provide a list, but it would only have one thing in it:

.. code:: json

   [
       {
           "src": "https://stimuli.org/myAudioFile.mp3",
           "type": "audio/mp3"
       }
   ]

Video files
~~~~~~~~~~~~~

Do not include the extensions when specifying video files relative to the base directory. Specify all the video types that
are available (all the subdirectories you have for video extensions) in the ``videoTypes`` parameter. If you wanted had a directory
structure like the first one above, with mp4 files only for mp4, you could specify the "cat_yawning.mp4" file to use during
calibration in the :ref:`exp-lookit-calibration` frame:

.. code::

    "calibrationVideo": "cat_yawning",
    "videoTypes": [ "mp4" ],
    "baseDir": "MYBASEDIR"

If you have both mp4 and webm file formats, you would instead write:

.. code::

    "calibrationVideo": "cat_yawning",
    "videoTypes": [ "mp4", "webm" ],
    "baseDir": "MYBASEDIR"

Alternately, you can still provide full paths to your video files. To provide full paths to video files,
you enter a **list** of "sources". Each element in the list provides both the URL
and the file type, like this:

.. code:: json

   [
       {
           "src": "https://stimuli.org/myVideoFile.mp4",
           "type": "video/mp4"
       },
       {
           "src": "https://stimuli.org/myVideoFile.webm",
           "type": "video/webm"
       }
   ]

If you only have one file type, you would still need to provide a list, but it would only have one thing in it:

.. code:: json

   [
       {
           "src": "https://stimuli.org/myVideoFile.mp4",
           "type": "video/mp4"
       }
   ]


The Lookit stimuli template on Github
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

One option for hosting your stimuli is to put them in a GitHub repo which has the directory structure described above
already built-in. You can make your own copy by following the directions at `Lookit stimuli template repo <https://github.com/lookit/lookit-stimuli-template>`__.
This is best for smallish stimuli (not for long video files >10MB). For a discussion of other options for hosting your
files, see :ref:`the main Lookit docs <docs:putting-stimuli-online>`.

Troubleshooting
~~~~~~~~~~~~~~~~

If media files aren't displaying as expected, the most important thing to do is to :ref:`check the browser console for
relevant error messages <docs:browser-console>`.
Generally you will see a 404 error saying that a file wasn't found, so you can check where the
experiment runner is *looking* for the file to understand if there's a discrepancy between that and where you have it.

Parameters
----------------

If your frame uses the expand-assets mixin, you can specify the following in addition to frame-specific parameters:

.. glossary::

    baseDir [String]
        Base directory for where to find stimuli. Any image src
        values that are not full paths will be expanded by prefixing
        with ``baseDir`` + ``img/``. Any audio/video src values provided as
        strings rather than objects with ``src`` and ``type`` will be
        expanded out to ``baseDir/avtype/[stub].avtype``, where the potential
        avtypes are given by ``audioTypes`` and ``videoTypes``.

        ``baseDir`` should include a trailing slash
        (e.g., `http://stimuli.org/myexperiment/`); if a value is provided that
        does not end in a slash, one will be added.

    audioTypes [Array | ``['mp3', 'ogg']``]
        List of audio types to expect for any audio specified just
        with a string rather than with a list of src/type objects.
        If audioTypes is `['typeA', 'typeB']` and an audio source
        is given as `intro`, the audio source will be
        expanded out to

        .. code:: javascript

            [
                {
                    src: 'baseDir' + 'typeA/intro.typeA',
                    type: 'audio/typeA'
                },
                {
                    src: 'baseDir' + 'typeB/intro.typeB',
                    type: 'audio/typeB'
                }
            ]

    videoTypes [Array | ``['mp4', 'webm']``]
        List of video types to expect for any audio specified just
        with a string rather than with a list of src/type objects.
        If videoTypes is `['typeA', 'typeB']` and a video source
        is given as `intro`, the video source will be
        expanded out to

        .. code:: javascript

            [
                {
                    src: 'baseDir' + 'typeA/intro.typeA',
                    type: 'video/typeA'
                },
                {
                    src: 'baseDir' + 'typeB/intro.typeB',
                    type: 'video/typeB'
                }
            ]



Data collected
----------------

No additional data is collected.

Events recorded
----------------

No additional events are recorded.
