.. _frame parameters:

Frame parameters
=================

Overview
----------

Frame parameters can be used to reuse or randomize values in any Lookit frame.

Rather than inserting actual values for frame properties such as stimulus image locations,
you may want sometimes want to use a variable the way you would in a programming language -
for instance, so that you can show the same cat picture throughout a group of frames, without
having to replace it in ten separate places if you decide to use a different one.
You can accomplish this (and more, including selecting randomly from or cycling through lists
of values) by setting the ``"parameters"`` property on any frame (including frame groups and
randomizers).

Syntax
--------

You can pass frame parameters to any frame by including ``"parameters": { ... }`` in the frame definition, like
this:

.. code::

    {
        'kind': 'FRAME_KIND',
        'parameters': {
            'FRAME_KIND': 'exp-lookit-text'
        }
    }

Any property *values* in this frame that match any of the property *names* in ``parameters``
will be replaced by the corresponding parameter value. For example, the frame above will be resolved to
have ``'kind': 'exp-lookit-text'``.

Frame parameters are useful if you need to repeat values for different properties or across multiple frames, especially
if your frame is actually a randomizer or group. You may use parameters nested within objects (at any depth) or
within lists.

You can also use selectors to randomly sample from or permute
a list defined in ``parameters``. Suppose ``STIMLIST`` is defined in
``parameters``, e.g. a list of potential stimuli. Rather than just using ``STIMLIST``
as a value in your frames, you can also:

- Select the Nth element (0-indexed) of the value of ``STIMLIST``: (Will cause error if ``N >= THELIST.length``)

  ``'parameterName': 'STIMLIST#N'``

- Select (uniformly) a random element of the value of ``STIMLIST``:

  ``'parameterName': 'STIMLIST#RAND'``

- Set ``parameterName`` to a random permutation of the value of ``STIMLIST``:

  ``'parameterName': 'STIMLIST#PERM'``

- Select the next element in a random permutation of the value of ``STIMLIST``, which is used across all
  substitutions in this randomizer. This allows you, for instance, to provide a list
  of possible images in your ``parameterSet``, and use a different one each frame with the
  subset/order randomized per participant. If more ``STIMLIST#UNIQ`` parameters than
  elements of ``STIMLIST`` are used, we loop back around to the start of the permutation
  generated for this randomizer.

  ``'parameterName': 'STIMLIST#UNIQ'``


Case study: randomizing the order of options in a survey
--------------------------------------------------------

Suppose you're including a survey where you ask participants to record whether their child performed a certain task, and you want to present the options in a random order to avoid systematically biasing the results towards either option. You start with a survey frame like this (see the frame docs for more information about this frame):

.. code:: javascript

    "example-survey": {
        "kind": "exp-lookit-survey",
        "formSchema": {
            "schema": {
                "type": "object",
                "title": "And now, a thrilling survey!",
                "properties": {
                    "didit": {
                        "enum": ["yes", "no"],
                        "type": "string",
                        "title": "Did your child do the thing?",
                        "default": ""
                    }
                }
            },
            "options": {
                "fields": {
                    "didit": {
                        "type": "radio",
                        "validator": "required-field"
                    }
                }
            }
        }
    },

To randomize the options, we'll need to make a few small changes. First, add ``"sort": false`` to the options for your ``didit`` field, so that AlpacaJS doesn't automatically sort the options alphabetically.

Next, you want the ``enum`` list for ``didit`` to actually be in random order. To achieve that, you can add a property like ``DIDIT_OPTIONS`` as a frame property, and then specify that the value of ``enum`` should be a random permutation of that list, like this:

.. code:: javascript

    "example-survey": {
        "kind": "exp-lookit-survey",
        "formSchema": {
            "schema": {
                "type": "object",
                "title": "And now, a thrilling survey!",
                "properties": {
                    "didit": {
                        "enum": "DIDIT_OPTIONS#PERM",
                        "type": "string",
                        "title": "Did your child do the thing?",
                        "default": ""
                    }
                }
            },
            "options": {
                "fields": {
                    "didit": {
                        "sort": false,
                        "type": "radio",
                        "validator": "required-field"
                    }
                }
            }
        },
        "parameters": {
            "DIDIT_OPTIONS": ["yes", "no"]
        }
    },
