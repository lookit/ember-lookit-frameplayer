import { moduleForModel, test } from 'ember-qunit';

moduleForModel('study', 'Unit | Model | study', {
  // Specify the other units that are required for this test.
  needs: ['model:study', 'model:user', 'model:response']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
