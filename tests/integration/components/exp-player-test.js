import { module, test, skip } from 'qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';

let pastResponses = Ember.A([1,2,3])

// See https://dockyard.com/blog/2018/01/11/modern-ember-testing for transition to newer
// style of integration (template) testing

module('exp-player', 'Integration | Component | exp-player', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {

    let noop = () => {};

    let study = {
        id: '12345',
        name: 'My Study',
        structure: {
            "frames": {
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
          save: noop
    });
    await render(hbs`{{exp-player
        experiment=study
        session=response
        pastSessions=pastResponses
        frameIndex=0
        fullScreenElementId='expContainer'
    }}`);

    assert.equal(this.element.querySelector('h4')[0].innerText, 'Mood Questionnaire');

  });
});


