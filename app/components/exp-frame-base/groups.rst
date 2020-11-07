.. _frame groups:

Frame groups
=================

Overview
----------

Sometimes it may be convenient to group several frames together. For instance, you might want to randomize the order
of several blocks of trials, but keep the blocks together.

To create a frame group, set the frame ``"kind"`` to ``"group"``.

You will also need to provide a ``"frameList"`` which is a list of frames that go in this group.

You can optionally provide a ``"commonFrameProperties"`` object which provides default parameter-value pairs to add to
each frame in the list (any parameters additionally defined in the ``frameList`` will take precedence).

As with other frames, ``"parameters"`` can be defined on the frame group to allow substitution of values. This can
be a convenient way to substitute in common values across several frames, or even across your entire study - for instance,
if you want to use the same ``baseDir`` in every frame that supports it.

Example
----------

Here is an example of a frame group that just contains two text frames:

.. code:: javascript

    "testFrameGroup": {
        "kind": "group",
        "frameList": [
            {
                "id": "first-test-trial",
                "blocks": [
                    {
                        text: "Hello and welcome to the study"
                    }
                ]
            },
            {
                "id": "second-test-trial",
                "blocks": [
                    {
                        text: "Some more info"
                    }
                ]
            }
        ],
        "commonFrameProperties": {
            "kind":  "exp-lookit-text"
        }
    }

Parameters
----------------

.. glossary::

    frameList [Array]
        List of frames to be included in this group. All frames will be displayed in order. Each frame is an
        object with any necessary frame-specific properties specified. The
        'kind' of frame can be specified either here (per frame) or in
        commonFrameProperties. If a property is defined for a given frame both
        in this frame list and in commonFrameProperties, the value in the frame
        list will take precedence.

        (E.g., you could include ``'kind': 'normal-frame'`` in
        commmonFrameProperties, but for a single frame in frameOptions, include
        ``'kind': 'special-frame'``.)

    commonFrameProperties [Object]
        Object describing common parameters to use as defaults for every frame created
        by this randomizer. Parameter names and values are as described in
        the documentation for the frameType used.
