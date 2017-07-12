import DS from 'ember-data';
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend({
    host: config.host,
    namespace: 'api/v1',
    buildURL: function(type, id, record) {
        // Add trailing slash to requests
       return this._super(type, id, record) + '/';
     }
});
