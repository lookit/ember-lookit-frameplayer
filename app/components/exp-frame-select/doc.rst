.. _exp-frame-select:

exp-frame-select
==============================================

Overview
------------------

Frame that allows you to specify a list of possible frames to show, plus an index or
list of indices of which ones to actually show.

The frame(s) will be inserted into the sequence of frames for this study on the fly, so that you can use a custom
:ref:`generateProperties<generateProperties>` function to select which frame(s) to show. (For more information on
making study behavior conditional on data collected, see :ref:`Conditional Logic<conditional_logic>`.)

This frame serves as a wrapper for the randomizer :ref:`select<select>`,
which is evaluated during experiment parsing and cannot be modified on the fly.

Warning: no ``selectNextFrame`` available
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To avoid unpredictable behavior, this frame does not itself use any
:ref:`selectNextFrame<selectnextframe>` passed to it. (Frames *within* the ``frameOptions`` list are welcome to make use of
``selectNextFrame``, though!)

Finding data from frames created by exp-lookit-select
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Data will be stored for this frame so that any ``generatedProperties`` are available
for future use; however, it will proceed immediately upon loading to the first frame
that is specified (or the next frame in the original sequence, if it turns out that `whichFrames` is an empty
list).

In ``expData``, the frame keys for all frames generated by this frame will be prefixed
by this frame's ID, with an index within ``whichFrames`` appended to the end of the ID.
For instance, if this frame's ID is ``1-study-procedure``, and it generates three frames,
we would have keys ``1-study-procedure``, ``1-study-procedure-0``, ``1-study-procedure-1``, and
``1-study-procedure-2``.

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)

Examples
----------------

This frame would show one frame if the child is eligible to participate based on a previous survey, and another if not.
(Note: this is just an example to show how you could use this frame. It will not work if you copy and paste it without
the eligibility survey the "generateProperties" function is referencing!)

.. code:: javascript

    "study-procedure": {
        "kind": "exp-frame-select",
        "frameOptions": [
            {
                "kind": "exp-lookit-text",
                "blocks": [
                    {
                        "emph": true,
                        "text": "Cats are great"
                    },
                    {
                        "text": "We are measuring how much your child loves cats now. Beep boop!"
                    }
                ]
            },
            {
                "kind": "exp-lookit-text",
                "blocks": [{
                        "emph": true,
                        "text": "Your child is not eligible for this study"
                    },
                    {
                        "text": "Either you do not have any cats or your child does not love cats."
                    }
                ]
            }
        ],
        "generateProperties": "function(expData, sequence, child, pastSessions) {var formData = expData['0-eligibility-survey'].formData; if (formData.nCats >= 1 && formData.loveCats == 'yes') { console.log('eligible'); return { 'whichFrames': 0, 'ELIGIBLE': true } } else { console.log('ineligible'); return { 'whichFrames': 1,  'ELIGIBLE': false } } }"
    }



Parameters
----------------

frameOptions [Array | ``[]``]
    List of frames that can be created by this randomizer. Each frame is an
    object with any necessary frame-specific properties specified. The
    'kind' of frame can be specified either here (per frame) or in
    commonFrameProperties. If a property is defined for a given frame both
    in this frame list and in commonFrameProperties, the value in the frame
    list will take precedence.

    (E.g., you could include 'kind': 'normal-frame' in
    commmonFrameProperties, but for a single frame in frameOptions, include
    'kind': 'special-frame'.)

commonFrameProperties [Object | ``{}``]
    Object describing common parameters to use in EVERY frame created
    by this randomizer. Parameter names and values are as described in
    the documentation for the frameType used.

whichFrames [Array or Number | ``-1``]
    Index or indices (0-indexed) within frameOptions to actually use. This can be either a number
    (e.g., 0 or 1 to use the first or second option respectively) or an array providing
    an ordered list of indices to use (e.g., [0, 1] or [1, 0] to use the first then
    second or second then first options, respectively). All indices must be integers >= 0 and
    < frameOptions.length.

    If not provided or -1, the entire frameOptions list is used in order. (If empty
    list is provided, however, that is respected and no frames are inserted by this
    randomizer.)

Data collected
----------------

No data is stored specifically by this frame.

Events recorded
----------------

No events are recorded specifically by this frame.
