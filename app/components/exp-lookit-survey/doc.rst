.. _exp-lookit-survey:

exp-lookit-survey
==============================================

Overview
------------------

Basic survey frame allowing researcher to specify question text and types.

If a participant returns to this frame after continuing, via a 'Previous' button on the
next frame, then the values in this form are pre-filled.

AlpacaJS
~~~~~~~~~~~~

This frame uses ember-cli-dynamic-forms as a wrapper for alpacajs, a powerful
library for generating online forms. To specify the structure of your form
(questions, answer types, validation), you provide a single 'formSchema' structure.
The 'formSchema' consists of a 'schema' object and an 'options' object, described
under Properties.

You can choose from any question types listed at http://www.alpacajs.org/documentation.html.
In that documentation, you will see that each field type - e.g., Checkbox, Radio, Text -
has some 'Schema' properties and some 'Options' properties. The properties under 'Schema'
will be defined in the 'schema' object of your formSchema. The properties under 'Options'
will be defined in the 'options' object of your formSchema.

Many question types allow you to easily validate answers. For instance, for a "number"
field you can set minimum and maximum values, and entries will automatically be
required to be numeric (http://www.alpacajs.org/docs/fields/number.html). You can also
either set ``required: true`` in the schema->properties entry for this field OR set
``validator: required-field`` in the options->fields entry if you want to require that the
participant enters something. A validation error message will be displayed next to
any fields that fail validation checks and the participant will not be able to proceed until
these are addressed.

Alpacajs is fairly powerful, and you are essentially using it directly. In general, you can copy
and paste any object passed to alpaca in the alpaca docs right in as your formSchema to
see that example in action on Lookit. Not all features of alpaca are detailed here,
but they can be used: e.g., advanced users can enter 'views' and 'data' in the
formSchema to customize the layout of their forms and the initial data. A 'dataSource'
may be specified under options to populate a question's potential answers (e.g., to
load a list of countries from some other source rather than hard-coding it, or to
provide checkboxes with vocabulary items from an externally-defined inventory).

Formatting
~~~~~~~~~~~

Note that question titles are interpreted as HTML and can include images, audio/video
elements, and inline CSS.

The form itself occupies a maximum of 800px horizontally and takes up 80% of the vertical
height of the window (it will scroll to fit).

Conditional questions
~~~~~~~~~~~~~~~~~~~~~~

You can use `alpacajs's "dependencies" functionality <http://www.alpacajs.org/docs/api/conditional-dependencies.html>`__ to
set up fields that depend on other fields - e.g., asking if the child speaks any
language besides English in the home and only if so displaying a dropdown to select the
language(s), or asking if the child likes Elmo or Grover better and then asking a question
specific to the preferred character. Or if you have questions only relevant to the
birth mother of the child, you could ask if the participant is the birth mother and show
those questions conditionally. See below for an example.




Ordering questions
~~~~~~~~~~~~~~~~~~

By default, questions should be presented in the order they're defined in your schema.
If they are not, you can use the "order" option to arrange them; see `the Alpaca docs <http://www.alpacajs.org/docs/api/ordering.html>`__.

Ordering options
~~~~~~~~~~~~~~~~

By default, Alpaca sorts options alphabetically for fields with radio buttons or checkboxes.
That's usually not what you want. Add ``"sort": false`` under formSchema -> options ->
fields -> <your field> to list them in the order you define them.

Current limitations
~~~~~~~~~~~~~~~~~~~

You are NOT able to provide custom functions (e.g. validators,
custom dataSource functions) directly to the formSchema.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-survey.png
    :alt: Example screenshot from exp-lookit-survey frame

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)

Examples
----------------

Simple pet survey
~~~~~~~~~~~~~~~~~~~

Here is an example of a reasonably simple survey using this frame:

.. code:: javascript

    "pet-survey": {
        "kind": "exp-lookit-survey",
        "formSchema": {
            "schema": {
                "type": "object",
                "title": "Tell us about your pet!",
                "properties": {
                    "age": {
                        "type": "integer",
                        "title": "Age",
                        "maximum": 200,
                        "minimum": 0,
                        "required": true
                    },
                    "name": {
                        "type": "string",
                        "title": "Name",
                        "required": true
                    },
                    "species": {
                        "enum": [
                            "dog",
                            "cat",
                            "fish",
                            "bird",
                            "raccoon"
                        ],
                        "type": "string",
                        "title": "What type of animal?",
                        "default": ""
                    }
                }
            },
            "options": {
                "fields": {
                    "age": {
                        "numericEntry": true
                    },
                    "name": {
                        "placeholder": "a name..."
                    },
                    "species": {
                        "type": "radio",
                        "message": "Seriously, what species??",
                        "validator": "required-field",
                        "removeDefaultNone": true,
                        "sort": false
                    }
                }
            }
        },
        "nextButtonText": "Moving on..."
    }

Conditional dependence: show a question based on the answer to another question
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: javascript

    "language-survey": {
        "kind": "exp-lookit-survey",
        "formSchema": {
            "schema": {
                "type": "object",
                "properties": {
                    "multilingual": {
                        "type": "string",
                        "title": "Is your child regularly exposed to any languages besides English?",
                        "enum": [
                            "Yes",
                            "No"
                        ]
                    },
                    "languages": {
                        "type": "text",
                        "title": "What other languages is he or she learning?"
                    }
                },
                "dependencies": {
                    "languages": [
                        "multilingual"
                    ]
                }
            },
            "options": {
                "fields": {
                    "multilingual": {
                        "type": "radio",
                        "message": "Please select an answer",
                        "validator": "required-field",
                        "sort": false,
                        "removeDefaultNone": true,
                        "order": 1
                    },
                    "languages": {
                        "type": "text",
                        "message": "Please write in an answer",
                        "validator": "required-field",
                        "dependencies": {
                            "multilingual": "Yes"
                        },
                        "order": 2
                    }
                }
            }
        }
    }

Reproducing the mood survey
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

And here is an example of re-implementing the exp-lookit-mood-questionnaire frame, using
custom formatting, time-pickers, dependencies, and question groups.

.. code:: javascript

    "mood-survey": {
        "kind": "exp-lookit-survey",
        "formSchema": {
            "view": {
                "fields": {
                    "/child/happy": {
                        "templates": {
                            "control": "<div>{{#if options.leftLabel}}<label class='label-left'>{{{options.leftLabel}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.rightLabel}}<label class='label-right'>{{{options.rightLabel}}}</label>{{/if}}</div>"
                        }
                    },
                    "/child/active": {
                        "templates": {
                            "control": "<div>{{#if options.leftLabel}}<label class='label-left'>{{{options.leftLabel}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.rightLabel}}<label class='label-right'>{{{options.rightLabel}}}</label>{{/if}}</div>"
                        }
                    },
                    "/child/rested": {
                        "templates": {
                            "control": "<div>{{#if options.leftLabel}}<label class='label-left'>{{{options.leftLabel}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.rightLabel}}<label class='label-right'>{{{options.rightLabel}}}</label>{{/if}}</div>"
                        }
                    },
                    "/child/healthy": {
                        "templates": {
                            "control": "<div>{{#if options.leftLabel}}<label class='label-left'>{{{options.leftLabel}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.rightLabel}}<label class='label-right'>{{{options.rightLabel}}}</label>{{/if}}</div>"
                        }
                    },
                    "/parent/energetic": {
                        "templates": {
                            "control": "<div>{{#if options.leftLabel}}<label class='label-left'>{{{options.leftLabel}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.rightLabel}}<label class='label-right'>{{{options.rightLabel}}}</label>{{/if}}</div>"
                        }
                    },
                    "/parent/parentHappy": {
                        "templates": {
                            "control": "<div>{{#if options.leftLabel}}<label class='label-left'>{{{options.leftLabel}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.rightLabel}}<label class='label-right'>{{{options.rightLabel}}}</label>{{/if}}</div>"
                        }
                    },
                    "/parent/ontopofstuff": {
                        "templates": {
                            "control": "<div>{{#if options.leftLabel}}<label class='label-left'>{{{options.leftLabel}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.rightLabel}}<label class='label-right'>{{{options.rightLabel}}}</label>{{/if}}</div>"
                        }
                    }
                },
                "layout": {
                    "bindings": {
                        "child": "#child",
                        "parent": "#parent",
                        "lastEat": "#lastEat",
                        "nextNap": "#nextNap",
                        "napWakeUp": "#napWakeUp",
                        "doingBefore": "#doingBefore",
                        "usualNapSchedule": "#usualNapSchedule"
                    },
                    "template": "<div class='row exp-text exp-lookit-mood-questionnaire'><h4>{{{options.formTitle}}}</h4><p>{{{options.introText}}}</p><div id='child'></div><div id='parent'></div><div id='napWakeUp'></div><div id='usualNapSchedule'></div><div id='nextNap'></div><div id='lastEat'></div><div id='doingBefore'></div></div>"
                },
                "parent": "bootstrap-edit"
            },
            "schema": {
                "type": "object",
                "properties": {
                    "child": {
                        "type": "object",
                        "title": "How is your CHILD feeling right now?",
                        "properties": {
                            "happy": {
                                "enum": [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7"
                                ],
                                "required": true
                            },
                            "active": {
                                "enum": [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7"
                                ],
                                "required": true
                            },
                            "rested": {
                                "enum": [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7"
                                ],
                                "required": true
                            },
                            "healthy": {
                                "enum": [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7"
                                ],
                                "required": true
                            }
                        }
                    },
                    "parent": {
                        "type": "object",
                        "title": "How are YOU feeling right now?",
                        "properties": {
                            "energetic": {
                                "enum": [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7"
                                ],
                                "required": true
                            },
                            "parentHappy": {
                                "enum": [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7"
                                ],
                                "required": true
                            },
                            "ontopofstuff": {
                                "enum": [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7"
                                ],
                                "required": true
                            }
                        }
                    },
                    "lastEat": {
                        "title": "About how long ago did your child last eat or drink?",
                        "required": true
                    },
                    "nextNap": {
                        "title": "About how much longer until his/her next nap (or bedtime)?",
                        "required": true
                    },
                    "napWakeUp": {
                        "title": "About how long ago did your child last wake up from sleep or a nap?",
                        "required": true
                    },
                    "doingBefore": {
                        "title": "What was your child doing before this?",
                        "required": true
                    },
                    "usualNapSchedule": {
                        "enum": [
                            "yes",
                            "no",
                            "yes-overdue"
                        ],
                        "title": "Does your child have a usual nap schedule?",
                        "required": true
                    }
                },
                "dependencies": {
                    "nextNap": [
                        "usualNapSchedule"
                    ]
                }
            },
            "options": {
                "fields": {
                    "child": {
                        "fields": {
                            "happy": {
                                "type": "radio",
                                "order": 3,
                                "vertical": false,
                                "leftLabel": "Fussy",
                                "fieldClass": "aligned-radio-group",
                                "rightLabel": "Happy",
                                "optionLabels": [
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    ""
                                ]
                            },
                            "active": {
                                "type": "radio",
                                "order": 4,
                                "vertical": false,
                                "leftLabel": "Calm",
                                "fieldClass": "aligned-radio-group",
                                "rightLabel": "Active",
                                "optionLabels": [
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    ""
                                ]
                            },
                            "rested": {
                                "type": "radio",
                                "order": 1,
                                "vertical": false,
                                "leftLabel": "Tired",
                                "fieldClass": "aligned-radio-group",
                                "rightLabel": "Rested",
                                "optionLabels": [
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    ""
                                ]
                            },
                            "healthy": {
                                "type": "radio",
                                "order": 2,
                                "vertical": false,
                                "leftLabel": "Sick",
                                "fieldClass": "aligned-radio-group",
                                "rightLabel": "Healthy",
                                "optionLabels": [
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    ""
                                ]
                            }
                        }
                    },
                    "parent": {
                        "fields": {
                            "energetic": {
                                "type": "radio",
                                "order": 1,
                                "vertical": false,
                                "leftLabel": "Tired",
                                "fieldClass": "aligned-radio-group",
                                "rightLabel": "Energetic",
                                "optionLabels": [
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    ""
                                ]
                            },
                            "parentHappy": {
                                "type": "radio",
                                "order": 3,
                                "vertical": false,
                                "leftLabel": "Upset",
                                "fieldClass": "aligned-radio-group",
                                "rightLabel": "Happy",
                                "optionLabels": [
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    ""
                                ]
                            },
                            "ontopofstuff": {
                                "type": "radio",
                                "order": 2,
                                "vertical": false,
                                "leftLabel": "Overwhelmed",
                                "fieldClass": "aligned-radio-group",
                                "rightLabel": "On top of things",
                                "optionLabels": [
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    ""
                                ]
                            }
                        }
                    },
                    "lastEat": {
                        "size": 10,
                        "type": "time",
                        "picker": {
                            "useCurrent": "day"
                        },
                        "dateFormat": "HH:mm",
                        "placeholder": "hours:minutes"
                    },
                    "nextNap": {
                        "size": 10,
                        "type": "time",
                        "picker": {
                            "useCurrent": "day"
                        },
                        "dateFormat": "HH:mm",
                        "placeholder": "hours:minutes",
                        "dependencies": {
                            "usualNapSchedule": "yes"
                        }
                    },
                    "napWakeUp": {
                        "size": 10,
                        "type": "time",
                        "picker": {
                            "useCurrent": "day"
                        },
                        "dateFormat": "HH:mm",
                        "placeholder": "hours:minutes"
                    },
                    "doingBefore": {
                        "type": "text",
                        "placeholder": "examples: having lunch, playing outside, going to the store with me"
                    },
                    "usualNapSchedule": {
                        "sort": false,
                        "type": "select",
                        "hideNone": false,
                        "noneLabel": "",
                        "optionLabels": [
                            "Yes",
                            "No",
                            "Yes, and he/she is already due for a nap"
                        ],
                        "removeDefaultNone": false
                    }
                },
                "formTitle": "Mood Questionnaire",
                "introText": "How are you two doing? We really want to know: we’re interested in how your child’s mood affects which sorts of surprising physical events he/she notices. You can help us find out what babies are really learning as they get older... and what they already knew, but weren’t calm and focused enough to show us!",
                "hideInitValidationError": true
            }
        },
        "nextButtonText": "Next"
    }



Parameters
----------------

showPreviousButton [Boolean | ``true``]
    Whether to show a 'previous' button

nextButtonText [String | ``'Next'``]
    Text to display on the 'next frame' button

formSchema [Object]
    Object specifying the content of the form. This is in the same format as
    the example definition of the const 'schema' at http://toddjordan.github.io/ember-cli-dynamic-forms/#/demos/data:
    a schema and options are designated separately. Each field of the form
    must be defined in schema. Options may additionally be specified in options. This object has fields:

        :schema: [Object]
            The schema defines the fields in this form. It has the following properties:

            :type: [String]
                This MUST be the string ``'object'``.\
            :title: [String]
                A form title for display
            :properties: [Object]
                An object defining the set of questions in this form and
                their associated data types, at minimum. Each key:value pair in this object is of
                the form ``'FIELDNAME': {...}``. The ``FIELDNAME`` is something you select, like ``age``; it should be
                unique within this form. The object contains at least 'type' and 'title' values,
                as well as any additional desired parameters that belong to the 'Schema' for the
                desired field described at http://www.alpacajs.org/documentation.html.

        :options: [Object]
            The options allow additional customization of the forms specified in the schema. This
            object should have a single key 'fields' mapping to an object. Each key:value pair in this object is of
            the form FIELDNAME:object, with FIELDNAMEs the same as in the schema.
            The potential parameters to use are those that belong to the 'Options' for the
            desired field described at  http://www.alpacajs.org/documentation.html.

Data collected
----------------

The fields added specifically for this frame type are:

formSchema [Object]
    The same formSchema that was provided as a parameter to this frame, for ease of analysis if randomizing or
    iterating on experimental design.

formData [Object]
    Data corresponding to the fields defined in formSchema['schema']['properties'].
    The keys of formData are the FIELDNAMEs used there, and the values are the participant's responses.
    Note that if the participant does not answer a question, that key may be absent, rather than being present with a null value.

Events recorded
----------------

No events are recorded specifically by this frame.
