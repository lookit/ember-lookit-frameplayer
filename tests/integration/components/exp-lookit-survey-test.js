import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { fillIn, click } from '@ember/test-helpers';

// To make it easier to make use of the parent component's actions, which are used when moving between frames,
// we primarily test frame components within the context of the exp-player component. This has been left as an
// example of how we can test a single frame component in isolation.

const RENDER_DELAY_MS = 500;
let short_delay = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, RENDER_DELAY_MS);
});

module('Integration | Component | exp lookit survey', function(hooks) {
    setupRenderingTest(hooks);

    test('Exp-lookit-survey frame renders', async function (assert) {

        let formSchema = {
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
        };

        this.set('formSchema', formSchema);

        let study = {
            id: '12345',
            name: 'My Study',
            structure:{
                frames: {},
                sequence: []
            }
        };
        let pastResponses = Ember.A([1,2,3]);
        let noop = () => {};
        let response = Ember.Object.create({
            id: 'abcde',
            conditions: [],
            expData: {},
            sequence: [],
            completed: false,
            study: study,
            save: noop,
            pastSessions: pastResponses
        });
        // Note: the values study, response, pastResponses are loaded from the object this, not from the context here
        // - so need to explicitly set them
        this.set('study', study);
        this.set('response', response);

        await this.render(
            hbs`{{exp-lookit-survey
                    nextButtonText="Moving on"
                    formSchema=formSchema
                    showPreviousButton=true
                    session=response
                    experiment=study
                }}`
        );

        // After awaiting render, only the title and next/previous buttons are actually rendered - need more time for
        // questions to actually render.
        await short_delay();

        assert.equal(this.element.querySelector('legend').textContent.trim(), 'Tell us about your pet!', 'Title of survey rendered');
        assert.equal(this.element.querySelector('button#nextbutton').textContent.trim(), 'Moving on', 'Custom next button text rendered');
        assert.equal(this.element.querySelector('button.pull-left').textContent.trim(), 'Previous', 'Previous button displayed');

        // Quickly check that question titles and options are rendered appropriately, no validation text shown, and
        // no 'none' option shown.
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'Tellusaboutyourpet!AgeNameWhattypeofanimal?dogcatfishbirdraccoonPreviousMovingon', 'Correct text rendered on survey page');

        // Check that removeDefaultNone option is respected

        formSchema.options.fields.species.removeDefaultNone = false;
        await this.render(
            hbs`{{exp-lookit-survey
                    nextButtonText="Moving on"
                    formSchema=formSchema
                    showPreviousButton=true
                    session=response
                    experiment=study
                }}`
        );
        await short_delay();
        console.log(this.element);
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'Tellusaboutyourpet!AgeNameWhattypeofanimal?NonedogcatfishbirdraccoonPreviousMovingon', 'None option displayed unless explicitly removed');

        // Input values for 2/3 required questions and try to move on; check that we see validation message
        await fillIn('.alpaca-field-text input', 'Fido');
        await fillIn('.alpaca-field-integer input', '12');
        await short_delay();
        await click('#nextbutton');
        await short_delay();
        assert.ok(this.element.textContent.includes('Seriously, what species??'), 'Validation message displayed when needed');

        // Now input value for final question and check validation disappears
        await click('.radio.alpaca-control input[value="dog"]');
        assert.notOk(this.element.textContent.includes('Seriously, what species??'), 'Validation message not displayed when not needed');

        // Don't check that we move on/save data because we don't have access to the parent's saveFrame action.
        // Would need to stub that here - but simpler and more reliable to use actual function and check expData.

    });
});
