.. _permute:

permute
==============================================

Overview
------------------

Randomizer to allow random ordering of a list of frames. Intended to be
useful for e.g. randomly permuting the order of particular stimuli or blocks of trials. Frames don't need to be
of the same kind to permute.

To use, define a frame with "kind": "choice" and "sampler": "permute",
as shown below, in addition to the parameters described below.

Example
----------------

Half the time, this will show "Let's think about hippos!" first, followed by "Let's think about dolphins!" The other
half, this will show "Let's think about dolphins!" first.

.. code:: javascript

    "test-trials": {
        "sampler": "permute",
        "kind": "choice",
        "commonFrameProperties": {
            "showPreviousButton": false
        },
        "frameOptions": [
            {
                "blocks": [
                    {
                        "emph": true,
                        "text": "Let's think about hippos!",
                        "title": "hippos!"
                    },
                    {
                        "text": "Some more about hippos..."
                    }
                ],
                "kind": "exp-lookit-text"
            },
            {
                "blocks": [
                    {
                        "emph": false,
                        "text": "Let's think about dolphins!",
                        "title": "dolphins!"
                    }
                ],
                "kind": "exp-lookit-text"
            }
        ]
    }


Parameters
----------------

frameOptions [Array]
    List of frames to be created by this randomizer. Each frame is an
    object with any necessary frame-specific properties specified. The
    'kind' of frame can be specified either here (per frame) or in
    commonFrameProperties. If a property is defined for a given frame both
    in this frame list and in commonFrameProperties, the value in the frame
    list will take precedence.

    (E.g., you could include ``'kind': 'normal-frame'`` in
    commmonFrameProperties, but for a single frame in frameOptions, include
    ``'kind': 'special-frame'``.)

orderedFrameOptions [Array]
    List of objects containing frame properties. The list should be the same length as frameOptions.
    The properties in the first element of this list will be added to the frame shown first, the
    properties in the second element of this list will be added to the frame shown second, and so on.

    This allows you to, for instance, do something different during the first or last
    trial (e.g., treating the first three trials as practice/training), or provide audio indicating
    progress through the study based on which trial number you're on - even though you're shuffling the
    order with permute!

    If ``parameterSets`` is included as one of the properties in ``orderedFrameOptions[n]``,
    the values will be *added* to any parameterSets property on the existing frame
    (value-by-value, iterating through corresponding parameterSets)
    rather than overwriting the whole property.

commonFrameProperties [Object | ``{}``]
    Object describing common parameters to use as defaults for every frame created
    by this randomizer. Parameter names and values are as described in
    the documentation for the frameType used.


Data collected
----------------

The information returned by this randomizer will be available in ``expData["conditions"]["THIS-RANDOMIZER-ID"]``. The
randomizer ID will depend on its order in the study - for instance, ``6-test-trials``.

frameList [Array]
    the list of frames used, in the final shuffled order