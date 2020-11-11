.. _exp-video-config:

exp-video-config
==============================================

Overview
------------------

Video configuration frame guiding user through making sure permissions are set
appropriately and microphone is working, with troubleshooting text. Almost all content is
hard-coded, to provide a general-purpose technical setup frame.


What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-video-config.png
    :alt: Example screenshot from exp-video-config frame


More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)
- :ref:`video-record`


Examples
----------------

This frame just shows the standard video config frame.

.. code:: javascript

    "video-config": {
        "kind": "exp-video-config",
        "troubleshootingIntro": ""
    }

This frame shows a friendly message offering tech support by the lab via phone.

.. code:: javascript

    "video-config": {
        "kind": "exp-video-config",
        "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to call the XYZ lab at (123) 456-7890 and we'd be glad to help you out!"
    }



Parameters
----------------

troubleshootingIntro [String | ``''``]
    Text to show as the introduction to the troubleshooting tips section


Data collected
----------------

The fields added specifically for this frame type are:

<None>

Events recorded
----------------

The events recorded specifically by this frame are:

<None>>
