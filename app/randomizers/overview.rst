.. _randomization:

.. _condition_assignment:

Randomization
===========================================

Options for condition assignment and counterbalancing
-------------------------------------------------------

Generally, you’ll want to show slightly different versions of the study
to different participants: perhaps you have a few different conditions,
and/or need to counterbalance the order of trials or left/right position
of stimuli. You have several options for how to handle this, depending on your preferences
and the complexity of your design:

1. Simple randomization using frame parameters
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A lot of simple randomization, like showing stimuli or questions in a random order, can be achieved simply using frame
parameters to select values from a list you define. See :ref:`Frame parameters<frame parameters>`.


2. Generating your study protocol using Javascript
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You also have the option to provide a Javascript function that generates your study protocol programmatically.
For complex counterbalancing designs, this may be simpler to reason about and debug than using randomizer frames
(next) because you can define variables and write the step-by-step instructions for how to create the study protocol,
without having to learn any special Lookit syntax. See :ref:`'Protocol generators'<generators>` for more information.

A protocol generator function can do anything that a randomizer frame can do. But to set up
:ref:`conditional logic<Conditional logic>` (doing different things depending on what the family does *this session*),
you will still need to use ``generateProperties`` or ``selectNextFrame`` parameters within the protocol you generate.

3. Randomizer frames
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can also use a special frame type called a **randomizer** to select an appropriate sequence of frames for a
particular trial. A randomizer frame is automatically expanded to a list of frames, so that for instance you can
specify your 12 looking-time trials all at once.

Randomizer frames allows you to randomize the study procedure without writing any code.
These can be used to set up counterbalancing or condition assignment.

This section includes documentation about the randomizers :ref:`permute`, :ref:`random-parameter-set`, and :ref:`select`.
To use a randomizer frame, set the frame ``"kind"`` to ``"choice"`` and ``"sampler"`` to the appropriate type of randomizer.
The documentation will tell you how each randomizer works and what parameters you need to give it.


Case study: 2 x 2 x 2 design
------------------------------------------------

Suppose you want to set up a study with a 2 x 2 x 2 design: that is, three types of things
vary, each with two options. For this toy example, all we want to do is tell a short
background story. The conditions will be:

- Character name: JANE or JILL

- Animal type: The character has a DOG or a CAT

- Location: The character lives in the COUNTRY or in the CITY

You want to create a single ``exp-lookit-text`` frame like this:

::

    {
        "kind": "exp-lookit-text",
        "blocks": [
            {
                "text": "CHARACTER_INTRO_TEXT"
            },
            {
                "text": "ANIMAL_INTRO_TEXT"
            },
            {
                "text": "SETTING_TEXT"
            }
        ]
    }

You have a variety of options for how to accomplish random condition assignment:

1. You could use a ``random-parameter-set`` randomizer and simply list all 2 * 2 * 2 = 8 options. Eight is a lot to list manually, but it's not ridiculous. This gives you maximum flexibility if you want to stop running one particular combination, or balance out the particular combinations based on how many kids in sub-age-ranges have completed each version of your study:

::

    {
        "kind": "choice",
        "sampler": "random-parameter-set",
        "frameList": [
            {
                "kind": "exp-lookit-text",
                "blocks": [
                    {
                        "text": "CHARACTER_INTRO_TEXT"
                    },
                    {
                        "text": "ANIMAL_INTRO_TEXT"
                    },
                    {
                        "text": "SETTING_TEXT"
                    }
                ]
            }
        ],
        "parameterSets": [
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jane.",
                "ANIMAL_INTRO_TEXT": "She went everywhere with her dog.",
                "SETTING_TEXT": "They lived in the middle of a big city."
            },
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jane.",
                "ANIMAL_INTRO_TEXT": "She went everywhere with her dog.",
                "SETTING_TEXT": "They lived out in the country."
            },
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jane.",
                "ANIMAL_INTRO_TEXT": "She went everywhere with her cat.",
                "SETTING_TEXT": "They lived in the middle of a big city."
            },
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jane.",
                "ANIMAL_INTRO_TEXT": "She went everywhere with her cat.",
                "SETTING_TEXT": "They lived out in the country."
            },
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jill.",
                "ANIMAL_INTRO_TEXT": "She went everywhere with her dog.",
                "SETTING_TEXT": "They lived in the middle of a big city."
            },
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jill.",
                "ANIMAL_INTRO_TEXT": "She went everywhere with her dog.",
                "SETTING_TEXT": "They lived out in the country."
            },
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jill.",
                "ANIMAL_INTRO_TEXT": "She went everywhere with her cat.",
                "SETTING_TEXT": "They lived in the middle of a big city."
            },
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jill.",
                "ANIMAL_INTRO_TEXT": "She went everywhere with her cat.",
                "SETTING_TEXT": "They lived out in the country."
            }
        ]
    }

2. If you don't want to deal with manually listing those combinations (for instance, because you're actually running a 2 x 2 x 2 x 2 x 2 design, or a 3 x 3 x 3 design...), you can use nested randomizers as discussed further below:

::

    {
        "kind": "choice",
        "sampler": "random-parameter-set",
        "frameList": [
            {
                "kind": "choice",
                "sampler": "random-parameter-set",
                "frameList": [
                    {
                        "kind": "choice",
                        "sampler": "random-parameter-set",
                        "frameList": [
                            {
                                "kind": "exp-lookit-text",
                                "blocks": [
                                    {
                                        "text": "CHARACTER_INTRO_TEXT"
                                    },
                                    {
                                        "text": "ANIMAL_INTRO_TEXT"
                                    },
                                    {
                                        "text": "SETTING_TEXT"
                                    }
                                ]
                            }
                        ],
                        "parameterSets": [
                            {
                                "SETTING_TEXT": "They lived in the middle of a big city."
                            },
                            {
                                "SETTING_TEXT": "They lived out in the country."
                            }
                        ]
                    }
                ],
                "parameterSets": [
                    {
                        "ANIMAL_INTRO_TEXT": "She went everywhere with her cat."
                    },
                    {
                        "ANIMAL_INTRO_TEXT": "She went everywhere with her dog."
                    }
                ]
            }
        ],
        "parameterSets": [
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jane."
            },
            {
                "CHARACTER_INTRO_TEXT": "Once upon a time there was a girl named Jill."
            }
        ]
    }

3. You can use the ``#RAND`` syntax and `frame parameters <https://lookit.github.io/lookit-frameplayer-docs/classes/Exp-frame-base.html#property_parameters>`_ to substitute in one of the two options for each condition:

::

    {
        "kind": "exp-lookit-text",
        "blocks": [
            {
                "text": "CHARACTER_INTRO_TEXT_CHOICES#RAND"
            },
            {
                "text": "ANIMAL_INTRO_TEXT_CHOICES#RAND"
            },
            {
                "text": "SETTING_TEXT_CHOICES#RAND"
            }
        ],
        "parameters": {
            "CHARACTER_INTRO_TEXT_CHOICES": [
                "Once upon a time there was a girl named Jane.",
                "Once upon a time there was a girl named Jill."
            ],
            "ANIMAL_INTRO_TEXT_CHOICES": [
                "She went everywhere with her dog.",
                "She went everywhere with her cat."
            ],
            "SETTING_TEXT_CHOICES": [
                "They lived in the middle of a big city.",
                "They lived out in the country."
            ]
        }
    }

Real randomization will generally be somewhat more complex - rather than setting the text on a single frame, you might be selecting which set of images to use, selecting whether to include a training phase, etc. However, the basic principles will be the same, and if you understand the options above, you will likely have a good idea of how to set up your own study.


Nested randomizers
------------------------------------------------

In more complex experimental designs, the frames created by a randomizer
may themselves be frame groups or randomizers! This nesting allows more modular
specification: for instance, a study might have ten test trials, each of
which consists of three phases. The “outer” randomizer could then
generate a frameList of ten randomizer frames, each of which would be
resolved in turn into three frames. Below is a simplified example with
only two test trials, each of which has three phases:

Here’s an example. Notice that ``"kind": "choice"``,
``"sampler": "random-parameter-set"``, ``"frameList": ...``, and
``commonFrameProperties`` are ``commonFrameProperties`` of the outer
frame ``nested-trials``. That means that every “frame” we’ll create as
part of ``nested-trials`` will itself be a random-parameter-set
generated list with the same frame sequence, although we’ll be
substituting in different parameter values. (This doesn’t have to be the
case - we could show different types of frames in the list - but in the
simplest case where you’re using randomParameterSet just to group
similar repeated frame sequences, this is probably what you’d do.) The
only thing that differs across the two (outer-level) **trials** is the
``parameterSet`` used, and we list only one parameter set for each
trial, to describe (deterministically) how the outer-level
``parameterSet`` values should be applied to each particular frame.

.. code:: json

   {
         "sampler": "random-parameter-set",
         "frameList": [
           {
             "parameterSets": [
                {
                  "NTRIAL": 1,
              "PHASE1STIM": "T1P1",
              "PHASE2STIM": "T1P2",
              "PHASE3STIM": "T1P3"
                }
             ]
           },
           {
             "parameterSets": [
                {
                  "NTRIAL": 2,
              "PHASE1STIM": "T2P1",
              "PHASE2STIM": "T2P2",
              "PHASE3STIM": "T2P3"
                }
             ]
           }
         ],
         "parameterSets": [
           {
               "T1P1": "mouse",
               "T1P2": "rat",
               "T1P3": "chipmunk",
               "T2P1": "horse",
               "T2P2": "goat",
               "T2P3": "cow"
           },
           {
               "T1P1": "guppy",
               "T1P2": "tadpole",
               "T1P3": "goldfish",
               "T2P1": "whale",
               "T2P2": "manatee",
               "T2P3": "shark"
           }

         ],
         "commonFrameProperties": {
            "sampler": "random-parameter-set",
            "frameList": [
                   {
                       "nPhase": 1,
                   "animal": "PHASE1STIM"
                   },
                   {
                       "nPhase": 2,
                   "animal": "PHASE2STIM"
                   },
                   {
                       "nPhase": 3,
                   "animal": "PHASE3STIM"
                   }
            ],
            "commonFrameProperties": {
              "nTrial": "NTRIAL",
              "kind": "question-about-animals-frame"
            }
         }
   }

To evaluate this experiment frame, the Lookit experiment player starts
with the list of frames in the outer ``frameList``, adding the key:value
pairs in the outer ``commonFrameProperties`` to each frame, which yields
the following list of frames:

::

   [
           {
           "parameterSets": [
                   {
                       "NTRIAL": 1,
                   "PHASE1STIM": "T1P1",
                   "PHASE2STIM": "T1P2",
                   "PHASE3STIM": "T1P3"
                }
             ],
           "sampler": "random-parameter-set",
           "frameList": [
               {
                   "nPhase": 1,
               "animal": "PHASE1STIM"
               },
               {
                   "nPhase": 2,
               "animal": "PHASE2STIM"
               },
               {
                   "nPhase": 3,
               "animal": "PHASE3STIM"
               }
           ],
           "commonFrameProperties": {
               "nTrial": "NTRIAL",
               "kind": "question-about-animals-frame"
           }
           },
           {
               "parameterSets": [
                   {
                       "NTRIAL": 2,
                   "PHASE1STIM": "T2P1",
                   "PHASE2STIM": "T2P2",
                   "PHASE3STIM": "T2P3"
                   }
               ],
           "sampler": "random-parameter-set",
           "frameList": [
               {
                   "nPhase": 1,
               "animal": "PHASE1STIM"
               },
               {
                   "nPhase": 2,
               "animal": "PHASE2STIM"
               },
               {
                   "nPhase": 3,
               "animal": "PHASE3STIM"
               }
           ],
           "commonFrameProperties": {
               "nTrial": "NTRIAL",
               "kind": "question-about-animals-frame"
           }
       }
   ]

One of the two (outer) ``parameterSets`` is then selected randomly;
suppose the second one (aquatic instead of land animals) is selected.
Now any substitutions are made based on the keys in this parameterSet.
The first frame in the sequence is now:

.. code:: json

       {
           "parameterSets": [
                   {
                       "NTRIAL": 1,
                   "PHASE1STIM": "guppy",
                   "PHASE2STIM": "tadpole",
                   "PHASE3STIM": "goldfish"
                }
             ],
           "sampler": "random-parameter-set",
           "frameList": [
               {
                   "nPhase": 1,
               "animal": "PHASE1STIM"
               },
               {
                   "nPhase": 2,
               "animal": "PHASE2STIM"
               },
               {
                   "nPhase": 3,
               "animal": "PHASE3STIM"
               }
           ],
           "commonFrameProperties": {
               "nTrial": "NTRIAL",
               "kind": "question-about-animals-frame"
           }
       }

Next, each frame is expanded since it is in turn another randomizer (due
to ``"sampler": "random-parameter-set"``). The frame above, representing
Trial 1, will be turned into three frames. First, again, we start with
the ``frameList``, and merge the ``commonFrameProperties`` into each
frame:

::

    [
       {
           "nPhase": 1,
           "animal": "PHASE1STIM",
           "nTrial": "NTRIAL",
               "kind": "question-about-animals-frame"
       },
       {
           "nPhase": 2,
           "animal": "PHASE2STIM",
           "nTrial": "NTRIAL",
               "kind": "question-about-animals-frame"
       },
       {
           "nPhase": 3,
           "animal": "PHASE3STIM",
           "nTrial": "NTRIAL",
               "kind": "question-about-animals-frame"
       }
   ]

Finally, a parameter set is selected from ``parameterSets``. Only one
parameter set is defined for this trial, which is deliberate; it simply
selects the correct stimuli for this trial. Substituting in the values
from the parameter set yields the following list of frames:

::

   [
       {
           "nPhase": 1,
           "animal": "guppy",
           "nTrial": 1,
               "kind": "question-about-animals-frame"
       },
       {
           "nPhase": 2,
           "animal": "tadpole",
           "nTrial": 1,
               "kind": "question-about-animals-frame"
       },
       {
           "nPhase": 3,
           "animal": "goldfish",
           "nTrial": 1,
               "kind": "question-about-animals-frame"
       }
   ]

The ``random-parameter-set`` randomizer is expected to be general enough
to capture most experimental designs that researchers put on Lookit, but
additional more specific randomizers will also be designed to provide
simpler syntax for common use cases.
