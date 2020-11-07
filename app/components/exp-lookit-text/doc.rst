.. _exp-lookit-text:

exp-lookit-text
==============================================

Overview
------------------

A frame to display simple text-only instructions, etc. to the participant.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-text.png
    :alt: Example screenshot from exp-lookit-text frame

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)

Examples
----------------

.. code:: javascript

    "study-intro": {
        "blocks": [
            {
                "emph": true,
                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "title": "Lorem ipsum"
            },
            {
                "text": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                "listblocks": [
                    {
                        "text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                    },
                    {
                        "text": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                    }
                ]
            },
            {
                "text": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
            }
        ],
        "showPreviousButton": false,
        "kind": "exp-lookit-text"
    }

Parameters
----------------

showPreviousButton [Boolean | ``true``]
    Whether to show a 'previous' button

blocks [Array]
    Array of text blocks to display, rendered using :ref:`exp-text-block`.

Data collected
----------------

The fields added specifically for this frame type are:

<None>

Events recorded
----------------

The events recorded specifically by this frame are:

<None>
