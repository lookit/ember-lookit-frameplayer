.. _protocol configuration:

Protocol configuration
===================================

Researchers specify how their Lookit study works by writing a "protocol configuration" for their study. This configuration is written in JSON, which stands for JavaScript Object Notation - this is just a special text format, not code.

Your study protocol configuration tells the Lookit experiment runner what sequence of "frames" to use in your study, and set all the options for those frames like what pictures or videos to show and for how long.

.. _JSON Overview:

JSON format
---------------------------

No programming is required to design a study: `JSON <http://www.json.org/>`_ is a simple,
human-readable text format for describing data. A JSON object is an unordered set of key – value pairs, with the following rules:

- The object itself is enclosed in curly braces.
- Keys are unique strings enclosed in double quotes.
- A key and value are separated by a colon.
- Key-value pairs are separated by commas.

A JSON value can be any of the following:

- a string (enclosed in double quotes)
- a number
- a JSON object (as described above)
- an array (an ordered list of JSON values, separated by commas and enclosed by square brackets)
- true
- false
- null

There are no requirements for specific formatting of a JSON document (whitespace that isn't part of a string is ignored). Here is an example JSON object to illustrate these principles:

.. code:: json

   {
       "name": "Jane",
       "age": 43,
       "favoritefoods": [
           "eggplant",
           "apple",
           "lima beans"
       ],
       "allergies": {
           "peanut": "mild",
           "shellfish": "severe"
       }
   }

The keys are the strings ``name``, ``age``, ``favoritefoods``, and
``allergies``. Favorite foods are stored as an array, or ordered list;
allergies are stored as a JSON object mapping food names to severity of
reaction. The same object could also be written as follows, in a
different order and with none of the formatting:
\`\ ``{"age": 43, "allergies": {"peanut": "mild", "shellfish": "severe"}, "name": "Jane", "favoritefoods": ["eggplant", "apple", lima beans"]}``

A helpful resource to check your JSON Schema for simple errors like
missing or extra commas, unmatched braces, etc. is
`jsonlint <http://jsonlint.com/>`_.

The JSON you write for your protocol configuration gets interpreted by Lookit's experiment runner, which expects to find specific types of information in the configuration file. (Formally, it expects the data to conform to a custom `JSON
schema <http://json-schema.org/examples.html>`_.)

Study protocol structure
--------------------------

Studies on Lookit are broken into a set of fundamental units called
**frames**, which can also be thought of as "pages" of the study. A
single experimental trial (e.g. looking time measurement) would
generally be one frame, as are the video consent procedure and exit survey.
Your JSON must have two keys: ``frames`` and
``sequence``. The ``frames`` value defines the frames used in this
study: it must be a JSON object mapping frame nicknames (any unique
strings chosen by the researcher) to frame objects (defined next). The
``sequence`` value must be an ordered list of the frames to use in this
study. Values in this list must be IDs from the “frames”
value.

.. admonition:: Frame IDs can't have underscores in them

   Frame IDs must be made of only numbers, letters, and dashes (e.g., "motor-skills-survey-23" is fine, but "motor_skills_survey" is not).

   You will see an error in the browser console if you try to use a frame ID with an underscore in it!

   Frame IDs **also can't end with** ``-repeat-N`` (e.g., '-repeat-3'), because that suffix is used when the participant navigates back to repeat a frame.

Here is the JSON for a very minimal Lookit study:

.. code:: json

   {
       "frames": {
           "my-text-frame": {
               "blocks": [
                   {
                       "title": "About the study",
                       "text": "This isn’t a real study."
                   }
               ]
           },
           "my-exit-survey": {
               "kind": "exp-lookit-exit-survey",
               "debriefing": {
                    "title": "Thank you!",
                    "text": "You participated."
               }
           }
       },
       "sequence": [
           "my-text-frame",
           "my-exit-survey"
       ]
   }

This JSON specifies a Lookit study with two frames, consent and an exit
survey. Note that the frame nicknames ``my-text-frame`` and
``my-exit-survey`` that are defined in ``frames`` are also used in the
``sequence``. Frames may be specified but not used in ``sequence``.
Here’s the object associated with the ``my-exit-survey`` frame:

.. code:: json

    {
        "kind": "exp-lookit-exit-survey",
        "debriefing": {
            "title": "Thank you!",
            "text": "You participated."
        }
    }

Within each frame object, a ``kind`` must be specified. This determines
the frame type that will be used. Additional data may be included in the
frame object to customize the behavior of the frame, for instance to
specify instruction text or the stimuli to use for a test trial. The
keys that may (or must) be included in a frame object are determined by
the frame type; each frame definition includes a JSON Schema describing
the expected data to be passed. Multiple frames of the same kind may be
included in a study – for instance, test trials using different stimuli.

The separation of frame definitions and sequence allows researchers to
easily and flexibly edit and test study protocols – for instance, the
order of frames may be altered or a particular frame removed for testing
purposes without altering any frame definitions.
