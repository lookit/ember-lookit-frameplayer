import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize(snapshot, options) {
    let json = this._super(snapshot, options);
    delete json.data.relationships['demographic_snapshot']
    return json;
  },
});
