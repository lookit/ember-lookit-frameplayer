.. _exp-lookit-iframe:

exp-lookit-iframe
==============================================

Overview
------------------

A frame to display external websites within a Lookit study, such as surveys or tasks hosted on other platforms. A 'Next' button is 
displayed beneath the iframe box that allows the participant to continue to the next Lookit frame.

This frame is useful for embedding an externally-hosted webpage in the middle of a Lookit study. Importantly, the Lookit study has no 
way of 'knowing' what sorts of interactions the participant has, or has not had, on the external website. For example, there is no way 
to ensure that the participant has made a response on the external site before they click the 'Next' button to continue on with the 
Lookit study. For this reason, if your study methods allow it, we suggest moving any externally-hosted surveys/tasks to the end of the 
Lookit study. You can automatically direct participants to another website at the end of the Lookit study using the study's 
'`Exit URL <https://lookit.readthedocs.io/en/develop/researchers-set-study-fields.html#exit-url>`_'.

If you do need to embed an external website in the middle of a Lookit study, this frame includes the optionalText parameter, which 
allows you to add text underneath the iframe box. You can use this text to help ensure the participant completes everything in the 
iframe box before clicking the frame's 'Next' button, e.g. "Please make sure that you see the message 'Your response has been 
submitted' in the box above before clicking the next button below."

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
        "iframeSrc": "https://example.com",
        "iframeHeight": "700px",
        "iframeWidth": "100%",
        "optionalText": "Message to the participant."
    }

Parameters
----------------

iframeSrc [String]
    The external URL that should be shown in the iframe. The link will be automatically updated to include two pieces of information 
    as URL query parameters: the hashed child ID ('child') and the response ID ('response'). This will allow you to link the study 
    responses and child's Lookit account without having to ask the family to enter additional information. See 
    `this page <https://lookit.readthedocs.io/en/develop/researchers-set-study-fields.html#study-url-external-studies>`_
    for information on how to use these query strings.

iframeHeight [String | ``700px``]
    Set the height of the iframe. You can use CSS units ("700px", "4in"), but not percents ("100%"). Make sure to preview your study 
    to see how the external page looks. Avoid a nested scrolling view by either making your iframeHeight value taller, or including 
    navigation between shorter sections in your external page.

iframeWidth [String | ``100%``]
    Set the width of the iframe. You can use CSS units, including percents ("700px", "4in", "100%").

optionalText [String]
    Add a message underneath the iframe to contextualize what's being displayed. For instance, you can tell the participant how they 
    will know when to click the Next button.

Data collected
----------------

The fields added specifically for this frame type are:

<None>

Events recorded
----------------

The events recorded specifically by this frame are:

<None>
