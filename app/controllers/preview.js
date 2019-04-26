import Ember from 'ember';

// Adapted from Experimenter's preview controller https://github.com/CenterForOpenScience/experimenter/blob/develop/app/controllers/experiments/info/preview.js
export default Ember.Controller.extend({
    breadCrumb: 'Preview',
    experiment: null,
    session: null,
    isDirty: function() {
        return this.get('model.hasDirtyAttributes');
    },

    _resolve: null,
    previewData: null,
    showData: false,
    showPreviewData(session) {
        return new Ember.RSVP.Promise((resolve) => {
            this.set('previewData', JSON.stringify(session.toJSON(), null, 4));
            this.set('showData', true);
            this.set('_resolve', resolve);
        });
    },
    actions: {
        toggleData() {
            this.toggleProperty('showData');
            this.get('_resolve')();
        },
        saveResponse(payload, callback) {
            var response = this.get('response');
            response.setProperties(payload);
            response.save().then(callback);
            this.set('response', response);
        }
    }
});
