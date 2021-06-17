import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import Ember from 'ember';

let {
    $
} = Ember;


/*
 * A frame to display text-only instructions, etc. to the user.
 */

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-survey-consent',
    layout: layout,
    frameType: 'CONSENT',

    frameSchemaProperties: {
        showPreviousButton: {
            type: 'boolean',
            default: true
        },
        multipleChoiceValidationText: {
            type: 'string',
            default: '* You must answer this question to participate'
        },
        checkboxValidationText: {
            type: 'string',
            default: '* You must agree to this item to participate'
        },
        formValidationText: {
            type: 'string',
            default: 'Some items were missing - please review your answers. If you do not want to participate, you can use the Back button on your browser or close this window.'
        },
        items: {
            type: 'array',
            items: {
                type: 'object',
                kind: {
                    oneOf: ['multiple-choice', 'checkbox-item', 'text-block'],
                    type: 'string'
                }
            },
            default: []
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {
                items: {
                    type: 'array'
                }
            }
        }
    },

    showValidation: false,

    validate() {
        let _this = this;
        let formValid = true;
        this.get('items').forEach((item) => {
            if (['checkbox-item', 'multiple-choice'].includes(item.kind)) {
                let answer = _this.get(`answer_${item.label}`);
                Ember.set(item, 'showValidation', !answer);
                if (!answer) {
                    formValid = false;
                }
            }
        });
        this.set('showValidation', !formValid);
        return formValid;
    },

    actions: {
        finish() {
            let formValid = this.validate();
            if (formValid) {
                this.send('next');
            } else {
                $('div.exp-lookit-survey-form').scrollTop(0);
            }
        }
    },

    didInsertElement() {
        let used_labels = [];

        this.get('items').forEach((item, index) => {
            if (['checkbox-item', 'multiple-choice'].includes(item.kind)) { // Only process labels for questions, not text
                // Turn the question label into a string, strip out any non-alphanumeric characters, make sure it's unique
                let proposed_label = String(item.label ? item.label : index);
                proposed_label = proposed_label.replace(/[^\w]+/g, "");
                let repeat = 1;
                while (used_labels.includes(proposed_label)) {
                    proposed_label = `${proposed_label}_${repeat}`;
                    repeat += 1;
                }
                Ember.set(item, 'label', proposed_label); // Update label in template
                used_labels.push(proposed_label);
                switch (item.kind) {
                case 'checkbox-item':
                    this.meta.data.properties[`answer_${proposed_label}`] = {type: 'boolean'};
                    this.set(`answer_${proposed_label}`, false);
                    Ember.set(item, 'validationText', this.get('checkboxValidationText'));
                    break;
                case 'multiple-choice':
                    this.meta.data.properties[`answer_${proposed_label}`] = {type: 'string'};
                    this.set(`answer_${proposed_label}`, '');
                    Ember.set(item, 'validationText', this.get('multipleChoiceValidationText'));
                    break;
                }
            }
        });
        this._super(...arguments);
    }
});
