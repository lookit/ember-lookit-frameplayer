import DS from 'ember-data';
import PrimarySerializer from './primary';

export default PrimarySerializer.extend({

  serialize(snapshot, options) {
    let json = this._super(...arguments);
    delete json.data.relationships['demographic-snapshot']
    return json;
  },
});
