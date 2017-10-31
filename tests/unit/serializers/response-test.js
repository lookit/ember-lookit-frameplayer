import { moduleForModel, test } from 'ember-qunit';

moduleForModel('response', 'Unit | Serializer | response', {
  // Specify the other units that are required for this test.
  needs: ['serializer:response', 'model:child', 'model:demographic']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
