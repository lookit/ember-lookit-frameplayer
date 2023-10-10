.. _exp-lookit-iframe:

exp-lookit-iframe
==============================================

Overview
------------------

A frame to display external websites, such as surveys, to the participant. 

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-iframe.png
    :alt: Example screenshot from exp-lookit-iframe frame

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)

Examples
----------------

.. code:: javascript

    "study-survey": {
        "kind": "exp-lookit-iframe",
        "iframeSrc": "https://mit.co1.qualtrics.com/jfe/form/SV_do6kyKJkwl19USW",
        "iframeHeight": "700px",
        "iframeWidth": "100%",
        "optionalText": "Message to the participant."
    }

Parameters
----------------

iframeSrc [String]
    Page that should be shown in IFrame.  Additionally, we update the query string with child's hash id using the key value 'child'
    and the response id using the key value 'response'.

iframeHeight [String | ``700px``]
    Set the height of the iframe.  This can be most CSS units, but percents don't work here as the parent elements restrict the height 
    of the frame.  Also, take in to account the height of the page being loaded into the iframe.  It might be awkward for the user to 
    have to deal with nested scrolling view. 

iframeWidth [String | ``100%``]
    Set width of the iframe.  The default seems to work pretty well, but any CSS value should work here.  

optionalText [String]
    Add some text to the frame to contextualize what's being displayed in the iframe. 

Data collected
----------------

The fields added specifically for this frame type are:

<None>

Events recorded
----------------

The events recorded specifically by this frame are:

<None>
