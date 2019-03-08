import DS from 'ember-data';
import config from '../config/environment';
import HasManyQuery from 'ember-data-has-many-query';
import Ember from 'ember';

export default DS.JSONAPIAdapter.extend(HasManyQuery.RESTAdapterMixin, {
    host: config.host,
    namespace: 'api/v1',
    buildURL: function(type, id, record) {
        // Add trailing slash to Lookit API requests
        return this._super(type, id, record) + '/';
    },
    headers: Ember.computed(function() {
        // Add cookie to http header
        return {
            'X-CSRFTOKEN': Ember.get(document.cookie.match(/csrftoken\=([^;]*)/), '1') // eslint-disable-line no-useless-escape
        };
    }).volatile()
});
