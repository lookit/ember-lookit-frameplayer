import { moduleForModel, test } from 'ember-qunit';

moduleForModel('child', 'Unit | Model | child', {
  // Specify the other units that are required for this test.
  needs: ['model:child', 'model:user']
});

test('Child model exists, can get and set properties', function(assert) {
  let baby = this.subject();
  baby.set('birthday', new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6);
  baby.get('birthday');
  baby.get('gender');
  // let store = this.store();
  assert.ok(!!baby);
});
