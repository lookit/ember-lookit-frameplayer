import { module, test, skip } from 'qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import {render, click, waitFor, settled, fillIn} from '@ember/test-helpers';

// See https://dockyard.com/blog/2018/01/11/modern-ember-testing for transition to newer
// style of integration (template) testing

// To make it easier to make use of the parent component's actions, which are used when moving between frames,
// we primarily test frame components within the context of the exp-player component.

const RENDER_DELAY_MS = 500;
let short_delay = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, RENDER_DELAY_MS);
});

module('exp-player', function(hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function() {
        let study = {
            id: '12345',
            name: 'My Study',
            structure:{
                frames: {},
                sequence: []
            }
        };
        this.set('study', study);
        let pastResponses = Ember.A([1,2,3]);
        let save = function() {
            return new Promise( (resolve, reject) => {
                resolve();
            });
        };
        let response = Ember.Object.create({
            id: 'abcde',
            conditions: [],
            expData: {},
            sequence: [],
            completed: false,
            study: study,
            save: save,
            pastSessions: pastResponses
        });
        // Note: the values study, response, pastResponses are loaded from the object this, not from the context here
        // - so need to explicitly set them

        this.set('response', response);
        this.set('pastResponses', pastResponses);
    });

    test('exp-player renders an exp-lookit-mood-questionnaire frame', async function(assert) {
        let study = {
            id: '12345',
            name: 'My Study',
            structure:{
                frames: {
                   "mood-survey": {
                       "introText": "How are you two doing?",
                       "id": "mood-survey",
                       "kind": "exp-lookit-mood-questionnaire"
                   }
                },
                sequence: ['mood-survey']
            }
        };
        this.set('study', study);

        await render(hbs`{{exp-player
            experiment=study
            session=response
            pastSessions=pastResponses
            frameIndex=0
            fullScreenElementId='expContainer'
        }}`);

        assert.equal(this.$('h4')[0].innerText, 'Mood Questionnaire');

    });

    test('exp-player renders a functioning exp-lookit-survey frame', async function(assert) {
        let study = {
            id: '12345',
            name: 'My Study',
            structure:{
                frames: {
                    "survey": {
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
                        "nextButtonText": "Moving on",
                        "showPreviousButton": true
                    },
                    "text": {
                        "kind": "exp-lookit-text",
                        "blocks": [
                            {
                                "text": "Final page"
                            }
                        ]
                    }
                },
                sequence: ['survey', 'text']
            }
        };
        this.set('study', study);

        await render(hbs`{{exp-player
            experiment=study
            session=response
            pastSessions=pastResponses
            frameIndex=0
            fullScreenElementId='experiment-player'
        }}`);

        // After awaiting render, only the title and next/previous buttons are actually rendered - need more time for
        // questions to actually render.
        await waitFor('.alpaca-field-text');
        assert.equal(this.element.querySelector('legend').textContent.trim(), 'Tell us about your pet!', 'Title of survey rendered');
        assert.equal(this.element.querySelector('button#nextbutton').textContent.trim(), 'Moving on', 'Custom next button text rendered');
        assert.equal(this.element.querySelector('button.pull-left').textContent.trim(), 'Previous', 'Previous button displayed');

        // Quickly check that question titles and options are rendered appropriately, no validation text shown, and
        // no 'none' option shown.
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'Tellusaboutyourpet!AgeNameWhattypeofanimal?dogcatfishbirdraccoonPreviousMovingon', 'Correct text rendered on survey page');

        // Check that removeDefaultNone option is respected
        study.structure.frames.survey.formSchema.options.fields.species.removeDefaultNone = false;
        await render(hbs`{{exp-player
            experiment=study
            session=response
            pastSessions=pastResponses
            frameIndex=0
            fullScreenElementId='experiment-player'
        }}`);
        await waitFor('.alpaca-field-text');
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'Tellusaboutyourpet!AgeNameWhattypeofanimal?NonedogcatfishbirdraccoonPreviousMovingon', 'None option displayed unless explicitly removed');

        // Input values for 2/3 required questions and try to move on; check that we see validation message
        await fillIn('.alpaca-field-text input', 'Fido');
        await fillIn('.alpaca-field-integer input', '12');

        // Without short delay - not just settled(), not anything that's apparently not rendered yet - clicking Next
        // doesn't trigger the validation message to be displayed. I don't know why but this is not something users
        // will run into, so just adding the delay for now.
        await short_delay();
        await click('#nextbutton');
        await short_delay();
        assert.ok(this.element.textContent.includes('Seriously, what species??'), 'Validation message displayed when needed');

        // Now input value for final question and check validation disappears
        await click('.radio.alpaca-control input[value="dog"]');
        await settled();
        assert.notOk(this.element.textContent.includes('Seriously, what species??'), 'Validation message not displayed when not needed');

        // Check that we move on
        await click('#nextbutton');
        await waitFor('.exp-text');
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'FinalpagePreviousNext', 'Following frame is displayed after proceeding');

        // Check what data is saved
        let expData = this.response.expData;
        assert.ok(expData.hasOwnProperty('0-survey'), 'expData has expected key for the survey frame');
        let frameData = expData['0-survey'];
        assert.deepEqual(frameData.formData, {
                "age": 12,
                "name": "Fido",
                "species": "dog"
            }, 'Expected form data saved');
        assert.equal(frameData.formSchema.schema.title, 'Tell us about your pet!', 'Expected form schema title saved');
        assert.deepEqual(Object.keys(frameData.formSchema.schema.properties), ['age', 'name', 'species'], 'Expected form schema schema property keys saved');
        assert.deepEqual(Object.keys(frameData.formSchema.options.fields), ['age', 'name', 'species'], 'Expected form schema option fields keys saved');

        assert.equal(frameData.eventTimings.length, 1, 'One event saved');
        assert.equal(frameData.eventTimings[0].eventType, "exp-lookit-survey:nextFrame", 'Event saved is of type nextFrame');

        assert.equal(frameData.frameType, "DEFAULT", "Type of frame saved is DEFAULT");
        assert.ok(frameData.hasOwnProperty('frameDuration'), 'Frame duration saved');

        await settled();

// TODO: navigate forward/backward from a survey frame and check that answers are preserved


        });





});


