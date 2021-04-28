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

/*
 * Basic survey frame allowing researcher to specify question text and types; wrapper for AlpacaJS.
 *
 * Current limitations: you are NOT
 * able to provide custom functions (e.g. validators, custom dataSource functions)
 * directly to the formSchema.
 */

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-survey',
    layout: layout,

    frameSchemaProperties: {
        showPreviousButton: {
            type: 'boolean',
            default: true
        },
        nextButtonText: {
            type: 'string',
            default: 'Next'
        },
        /*
        Object specifying the content of the form. This is in the same format as
        the example definition of the const 'schema' at http://toddjordan.github.io/ember-cli-dynamic-forms/#/demos/data:
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

