import { module, test, skip } from 'qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';

// See https://dockyard.com/blog/2018/01/11/modern-ember-testing for transition to newer
// style of integration (template) testing

module('exp-player', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    let pastResponses = Ember.A([1,2,3]);
    this.set('pastResponses', pastResponses);
    let noop = () => {};

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
    // Note: the values study, response, pastResponses seem to be loaded from the object
    // this, not from the context here - so need to explicitly set them
    this.set('study', study);
    this.set('response', response);
    await render(hbs`{{exp-player
        experiment=study
        session=response
        pastSessions=pastResponses
        frameIndex=0
        fullScreenElementId='expContainer'
    }}`);

    assert.equal(this.$('h4')[0].innerText, 'Mood Questionnaire');

  });
});


