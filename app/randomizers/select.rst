.. _select:

select
==============================================

Overview
------------------

Randomizer to allow selection of one (or arbitrary sequence) of defined frames.

This is unlikely to be useful on its own! It is intended to be used either:

- within a :ref:`random-parameter-set` randomizer, with different ``parameterSets`` picking out
  different values for ``whichFrames``)
- via the :ref:`exp-frame-select` frame, which allows you to set `whichFrames` using a custom
  ``generateProperties`` function. (Note that you can't add a ``generateProperties`` function
  directly to a randomizer - that's why you'd use the regular frame instead.)

To use, define a frame with ``"kind": "choice"`` and ``"sampler": "select"``,
as shown below, in addition to the parameters described under 'properties'.

Example
----------------

This will always show "Let's think about hippos!" because it picks out the first frame (``"whichFrames": 0``):

.. code:: javascript

    "select-randomizer-test": {
        "sampler": "select",
        "kind": "choice",
        "whichFrames": 0,
        "commonFrameProperties": {
            "kind": "exp-lookit-text"
        },
        "frameOptions": [
            {
                "blocks": [
                    {
                        "emph": true,
                        "text": "Let's think about hippos!",
                        "title": "FRAME 1"
                    },
                    {
                        "text": "Some more about hippos..."
                    }
                ]
            },
            {
                "blocks": [
                    {
                        "emph": false,
                        "text": "Let's think about dolphins!",
                        "title": "FRAME 2"
                    }
                ]
            }
        ]
    }

.. _select-parameters:

Parameters
----------------

frameOptions [Array]
    List of frames that can be created by this randomizer. Each frame is an
    object with any necessary frame-specific properties specified. The
    'kind' of frame can be specified either here (per frame) or in
    commonFrameProperties. If a property is defined for a given frame both
    in this frame list and in commonFrameProperties, the value in the frame
    list will take precedence.

    (E.g., you could include 'kind': 'normal-frame' in
    commmonFrameProperties, but for a single frame in frameOptions, include
    'kind': 'special-frame'.)


commonFrameProperties [Object]
    Object describing common parameters to use in EVERY frame created
    by this randomizer. Parameter names and values are as described in
    the documentation for the frameType used.

whichFrames [Number or Array]
    Index or indices (0-indexed) within ``frameOptions`` to actually use. This can be either a number
    (e.g., 0 to use the first option or 1 to use the second option) or an array providing
    an ordered list of indices to use (e.g., [1, 0] to use the second then first options).
    All indices must be integers in [0, frameOptions.length).

    If not provided or -1, the entire ``frameOptions`` list is used in order. (If an empty
    list is provided, however, that is respected and no frames are inserted by this
    randomizer.)


Data collected
----------------

The information returned by this randomizer will be available in ``expData["conditions"]["THIS-RANDOMIZER-ID"]``. The
randomizer ID will depend on its order in the study - for instance, ``6-test-trials``.

whichFrames [Array]
    the index/indices of the frame(s) used, as provided to this frame