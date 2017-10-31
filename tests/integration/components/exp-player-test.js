import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

let pastResponses = Ember.A([1,2,3])

moduleForComponent('exp-player', 'Integration | Component | exp player', {
  integration: true,
});

test('it renders', function(assert) {
    let noop = () => {};
    this.set('noop', noop);

  this.set('study', {
      id: '12345',
      name: 'My Study',
      structure: {
          "frames": {
             "mood-survey": {
                 "introText": "How are you two doing? We really want to know: we’re interested in how your child’s mood affects his or her looking preferences.",
                 "id": "mood-survey",
                 "kind": "exp-lookit-mood-questionnaire"
             }
          },
          sequence: ['mood-survey']
      }
  });
  this.set('response', Ember.Object.create({
        id: 'abcde',
        conditions: [],
        expData: {},
        sequence: [],
        completed: false,
        study: this.get('study'),
        save: noop
  }));
  this.set('pastResponses', pastResponses)
  this.render(hbs`{{exp-player
      experiment=study
      session=response
      pastSessions=pastResponses
      frameIndex=0
      fullScreenElementId='expContainer'
  }}`);

  assert.equal(this.$('h4')[0].innerText, 'Mood Questionnaire');
});
