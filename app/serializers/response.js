import DS from 'ember-data';
import PrimarySerializer from './primary';

export default PrimarySerializer.extend({

  serialize(snapshot, options) {
    let json = this._super(...arguments);
    json.data.relationships.demographic_snapshot = { // TEMPORARY UNTIL DEMOGRAPHIC SNAPSHOT NOT NEEDED - FOR DEMO ONLY
        "data": {
             "type": "demographics",
             "id": "d7550b70-a72e-4403-acc4-36a2dbec514c"
           }
    }
    return json;
  },
});
