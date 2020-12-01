import Ember from 'ember';
import DS from 'ember-data';
import {moduleForComponent} from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';



module('Integration | Component | exp lookit survey', function(hooks) {
    setupRenderingTest(hooks);

    test('Exp-lookit-survey frame renders', async function (assert) {

        assert.expect(2);
        let formSchema = {
            schema: {
                type: "object",
                title: "Tell us about your pet!",
                properties: {
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
            options: {
                fields: {
                    age: {
                        "numericEntry": true
                    },
                    name: {
                        "placeholder": "a name..."
                    },
                    species: {
                        "type": "radio",
                        "message": "Seriously, what species??",
                        "validator": "required-field"
                    }
                }
            }
        };

        this.set('formSchema', formSchema);
        await this.render(
            hbs`{{exp-lookit-survey
                    nextButtonText="Moving on"
                    formSchema=formSchema
                }}`
        );

        // Note: not all questions appear to be rendered at this time. May need to wait for that separately...
        assert.equal(this.element.querySelector('legend').textContent.trim(), 'Tell us about your pet!');
        assert.equal(this.element.querySelector('button').textContent.trim(), 'Moving on');
    });
});
