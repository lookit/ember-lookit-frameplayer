import Ember from 'ember';

// Copied from ember-osf/utils/load-relationship.js
export default function loadAll(model, relationship, dest, options = {}) {
    var page = options.page || 1;
    var query = {
        'page[size]': 10,
        page: page
    };
    query = Ember.merge(query, options || {});
    Ember.set(model, 'query-params', query);

    return model.query(relationship, query).then(results => {
        dest.pushObjects(results.toArray());
        if (results.meta) {
            var total = results.meta.pagination.count;
            var pageSize = 10;
            var remaining = total - (page * pageSize);
            if (remaining > 0) {
                query.page = page + 1;
                query['page[size]'] = pageSize;
                return loadAll(model, relationship, dest, query);
            }
        }
    });
}
