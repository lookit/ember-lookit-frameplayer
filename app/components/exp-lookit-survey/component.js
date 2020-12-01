import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

let {
    $
} = Ember;

/**
 * Basic survey frame allowing researcher to specify question text and types.
 *
 * This frame uses ember-cli-dynamic-forms as a wrapper for alpacajs, a powerful
 * library for generating online forms. To specify the structure of your form
 * (questions, answer types, validation), you provide a single 'formSchema' structure.
 * The 'formSchema' consists of a 'schema' object and an 'options' object, described
 * under Properties.
 *
 * You can choose from any question types listed at http://www.alpacajs.org/documentation.html.
 * In that documentation, you will see that each field type - e.g., Checkbox, Radio, Text -
 * has some 'Schema' properties and some 'Options' properties. The properties under 'Schema'
 * will be defined in the 'schema' object of your formSchema. The properties under 'Options'
 * will be defined in the 'options' object of your formSchema.
 *
 * Many question types allow you to easily validate answers. For instance, for a "number"
 * field you can set minimum and maximum values, and entries will automatically be
 * required to be numeric (http://www.alpacajs.org/docs/fields/number.html). You can also
 * either set required: true in the schema->properties entry for this field OR set
 * validator: required-field in the options->fields entry if you want to require that the
 * participant enters something. A validation error message will be displayed next to
 * any fields that fail validation checks and the participant will not be able to proceed until
 * these are addressed.
 *
 * Alpacajs is fairly powerful, and you are essentially using it directly. In general, you can copy
 * and paste any object passed to alpaca in the alpaca docs right in as your formSchema to
 * see that example in action on Lookit. Not all features of alpaca are detailed here,
 * but they can be used: e.g., advanced users can enter 'views' and 'data' in the
 * formSchema to customize the layout of their forms and the initial data. A 'dataSource'
 * may be specified under options to populate a question's potential answers (e.g., to
 * load a list of countries from some other source rather than hard-coding it, or to
 * provide checkboxes with vocabulary items from an externally-defined inventory).
 *
 * You can also use alpacajs's "dependencies" and "conditional dependencies" functionality to
 * set up fields that depend on other fields - e.g., asking if the child speaks any
 * language besides English in the home and only if so displaying a dropdown to select the
 * language(s), or asking if the child likes Elmo or Grover better and then asking a question
 * specific to the preferred character. Or if you have questions only relevant to the
 * birth mother of the child, you could ask if the participant is the birth mother and show
 * those questions conditionally.
 *
 * Note that question titles are interpreted as HTML and can include images, audio/video
 * elements, and inline CSS.
 *
 * If a participant returns to this frame after continuing, via a 'Previous' button on the
 * next frame, then the values in this form are pre-filled.
 *
 * No video recording is conducted on this frame.
 *
 * A previous button may optionally be included on this frame.
 *
 * The form itself occupies a maximum of 800px horizontally and takes up 80% of the vertical
 * height of the window (it will scroll to fit).
 *
 * Current limitations: you are NOT
 * able to provide custom functions (e.g. validators, custom dataSource functions)
 * directly to the formSchema.
 *
 * Here is an example of a reasonably simple survey using this frame:


```json
 "frames": {
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
                            "validator": "required-field"
                        }
                    }
                }
            },
            "nextButtonText": "Moving on..."
        }
    }
    * ```
    *
    * And here is an example of re-implementing the exp-lookit-mood-questionnaire, using
    * custom formatting, time-pickers, dependencies, and question groups.

```json
 "frames": {
            "survey-sample-3": {
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

 * ```
 * @class Exp-lookit-survey
 * @extends Exp-frame-base
 */

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-survey',
    layout: layout,

    frameSchemaProperties: {
        /**
         * Whether to show a 'previous' button
         *
         * @property {Boolean} showPreviousButton
         * @default true
         */
        showPreviousButton: {
            type: 'boolean',
            default: true
        },
        /**
         * Text to display on the 'next frame' button
         *
         * @property {String} nextButtonText
         * @default 'Next'
         */
        nextButtonText: {
            type: 'string',
            default: 'Next'
        },
        /**
        Object specifying the content of the form. This is in the same format as
        the example definition of the const 'schema' at http://toddjordan.github.io/ember-cli-dynamic-forms/#/demos/data:
        a schema and options are designated separately. Each field of the form
        must be defined in schema. Options may additionally be specified in options.

        @property {Object} formSchema
            @param {Object} schema The schema defines the fields in this form. It has the following properties:
            'type' (which MUST BE THE STRING 'object'),
            'title' (a form title for display), and
            'properties'. 'properties' is an object defining the set of fields in this form and
                their associated data types, at minimum. Each key:value pair in this object is of
                the form FIELDNAME:object. The FIELDNAME is something you select; it should be
                unique within this form. The object contains at least 'type' and 'title' values,
                as well as any additional desired parameters that belong to the 'Schema' for the
                desired field described at http://www.alpacajs.org/documentation.html.
            @param {Object} options The options allow additional customization of the forms specified in the schema. This
                object should have a single key 'fields' mapping to an object. Each key:value pair in this object is of
                the form FIELDNAME:object, with FIELDNAMEs the same as in the schema.
                The potential parameters to use are those that belong to the 'Options' for the
                desired field described at  http://www.alpacajs.org/documentation.html.
        */
        formSchema: {
            type: 'object',
            properties: {
                schema: {
                    type: 'object'
                },
                options: {
                    type: 'object'
                }
            }
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {
                /**
                * The same formSchema that was provided as a parameter to this frame, for ease of analysis if randomizing or iterating on experimental design.
                * @attribute formSchema
                */
                formSchema: {
                    type: 'object'
                },
                /**
                * Data corresponding to the fields defined in formSchema['schema']['properties']. The keys of formData are the FIELDNAMEs used there, and the values are the participant's responses. Note that if the participant does not answer a question, that key may be absent, rather than being present with a null value.
                * @attribute formData
                */
                formData: {
                    type: 'object'
                }
            }
        }
    },
    form: null,
    formData: null,
    actions: {
        setupForm(form) {
            if (this.get('isDestroyed') || this.get('isDestroying')) {
                return;
            }
            this.set('form', form);
            // If we've gotten here via 'previous' and so already have data, set the
            // JSON value of this form to that data.
            // Look for any expData keys starting with frameIndex-, e.g. '12-'
            var _this = this;
            $.each(this.session.get('expData'), function(key, val) {
                if (key.startsWith(_this.frameIndex + '-')) {
                    _this.get('form').setValue(val.formData);
                    return;
                }
            });

        },
        finish() {
            var _this = this;

            // Don't allow to progress until validation succeeds. It's important
            // to do the check within the refreshValidationState callback rather than
            // separately because otherwise we may proceed before validation can
            // finish and return false.
            this.get('form').refreshValidationState(true, function() {
                $('div.alpaca-message.alpaca-message-notOptional').html('This field is required.');
                if (_this.get('form').isValid(true)) {
                    _this.set('formData', _this.get('form').getValue());
                    _this.send('next');
                } else {
                    _this.get('form').focus();
                    return;
                }
            });

        }
    }

});

