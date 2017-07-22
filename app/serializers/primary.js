import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPISerializer.extend({
    normalizeArrayResponse(store, primaryModelClass, payload) {
        // Adapted from CenterForOpenScience/ember-osf/serializers/osf-serializer to handle pagination from Lookit API -
        //
        // Ember data does not yet support pagination. For any request that returns more than one result, add pagination data
        // under meta, and then calculate total pages to be loaded.
        let documentHash = this._super(...arguments);
        documentHash.meta = documentHash.meta || {};
        documentHash.meta.pagination = Ember.$.extend(true, {}, Ember.get(payload.links || {}, 'meta'));
        documentHash.meta.total = Math.ceil(documentHash.meta.pagination.count / 10); // Assuming 10 per page
        return documentHash;
    }
});
