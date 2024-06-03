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

If you do need to embed an external website in the middle of a Lookit study, this frame includes the instructionText parameter, which 
allows you to add text above the iframe box. You can use this text to help ensure the participant completes everything in the 
iframe box before clicking the frame's 'Next' button, e.g. "Please make sure that you see the message 'Your response has been 
submitted' in the box above before clicking the next button below."

Another reason to use this frame is if you want to capture webcam video of participants while they are completing a task on 
a site that doesn't provide webcam monitoring. While the participant is interacting with the externally-hosted webpage, you 
can record webcam video for this frame by including the session recording frame 
`exp-lookit-start-recording <https://lookit.readthedocs.io/projects/frameplayer/en/latest/components/exp-lookit-start-recording/doc.html#exp-lookit-start-recording>`_. 
Note that any timing information collected by the external site (e.g. externally recorded response time after the external 
page loads) will not necessarily correspond precisely to the Lookit frame timing information or exact onset of the resulting 
video file (link to documentation: https://lookit.readthedocs.io/en/develop/researchers-lag-issues.html).

More generally, remember that the Lookit study has no way of 'knowing' what sorts of interactions the participant has, or has 
not had, on the external website. For example, there is no way to ensure that the participant has made a response on the 
external site before they click the 'Next' button to continue on with the Lookit study.

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

This will present the website "example.com" inside an iframe within the Lookit experiment. The `iframe` frame will automatically add two 
query parameters to the end of the `iframeSrc` link: "child" (the child ID) and "response" (the response ID). This allows researchers to 
automatically link responses obtained via the external site embedded in the iframe to Lookit data.

.. code:: javascript

    "embedded-survey": {
        "kind": "exp-lookit-iframe",
        "iframeSrc": "https://example.com",
        "iframeHeight": "700px",
        "iframeWidth": "100%",
        "instructionText": "Please complete the survey above. When finished, click the green 'Next' button to continue with the experiment."
    }

Some external websites require specific names for URL query parameters. In this case, researchers can use the `generateProperties` 
parameter to dynamically create an iframe URL that uses custom names for the child and response query parameters. In the example below, 
the `generateProperties` function generates the `iframeSrc` value during each session by combining the base URL ("https://example.com") 
with two query parameters: one called 'a1', which contains the child ID, and one called 'a2', which contains the response ID. This same 
approach can be used to add any other information to the iframe URL query parameters using the information that the `generateProperties` 
function has access to, such as the randomized condition, previous responses, and child's demographics (language, gender, age etc.).

.. code:: javascript

    "custom-query-parameters": {
        "kind": "exp-lookit-iframe",
        "iframeHeight": "1000px",
        "iframeWidth": "100%",
        "instructionText": "Please schedule a time to participate. When you are finished, click the green 'Next' button to move on.",
        "generateProperties": "function(expData, sequence, child, pastSessions, conditions) { return { 'iframeSrc': `https://example.com?a1=${pastSessions[0].get('hash_child_id')}&a2=${pastSessions[0].get('id')}` }; }"
    }

Here's an example of how to set the warning message.

.. code:: javascript

    "embedded-survey": {
        "kind": "exp-lookit-iframe",
        "iframeSrc": "https://example.com",
        "iframeHeight": "700px",
        "iframeWidth": "100%",
        "instructionText": "Please complete the survey above. When finished, click the green 'Next' button to continue with the experiment.",
        "warningMessageText": "Please confirm that you have finished the survey above before continuing to the next part of the study. You should see a screen that says 'Thank you, your response has been recorded'."
    }

Parameters
----------------

iframeSrc [String]
    The external URL that should be shown in the iframe. The link will be automatically updated to include two pieces of information 
    as URL query parameters: the hashed child ID ('child') and the response ID ('response'). This will allow you to link the study 
    responses and child's Lookit account without having to ask the family to enter additional information. See 
    `this page <https://lookit.readthedocs.io/en/develop/researchers-set-study-fields.html#study-url-external-studies>`_
    for information on how to use these query strings.
    If you need to customize the names of your query parameters, you can use the `generateProperties` parameter to generate your `iframeSrc` - see the example above.

iframeHeight [String | ``700px``]
    Set the height of the iframe. You can use CSS units ("700px", "4in"), but not percents ("100%"). Make sure to preview your study 
    to see how the external page looks. Avoid a nested scrolling view by either making your iframeHeight value taller, or including 
    navigation between shorter sections in your external page.

iframeWidth [String | ``100%``]
    Set the width of the iframe. You can use CSS units, including percents ("700px", "4in", "100%").

instructionText [String]
    Add a message above the iframe to contextualize what's being displayed. For instance, you can tell the participant how they 
    will know when to click the Next button.

optionalExternalLink [Boolean | ``false``]
    Allow participants to click on a link to open the external URL in a new tab if the iframe doesn't load correctly. This 
    message displays under the iframe and reads "If you don't see anything in the space above, there might have 
    been a problem loading this part of the study. Click [here] to open this part of the study in a new tab. Make sure to keep 
    this tab open so you can continue to the rest of the study."

nextButtonText [String | ``Next`` ]
    Text to display on the 'next frame' button.

warningMessageText [String | ``Please confirm that you have finished the task above! When you have finished, click the button to continue.``]
    Red text displayed above next button to confirm that the user understands that there's a task above to be completed before moving 
    to next frame. If no value is given, the default text (shown above) will be used, otherwise you can provide a custom message. This 
    message will appear after the user first clicks the 'Next' button, at which point the 'Next' button will be briefly disabled to 
    encourage users to check that they've finished the iframe task and are clicking the correct button.

Data collected
----------------

The fields added specifically for this frame type are:

<None>

Events recorded
----------------

The events recorded specifically by this frame are:

<None>
