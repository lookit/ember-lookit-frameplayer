import PrimarySerializer from './primary';

export default PrimarySerializer.extend({
  serialize(snapshot, options) {
    let json = this._super(snapshot, options);
    delete json.data.relationships['demographic-snapshot']
    return json;
  },
});
