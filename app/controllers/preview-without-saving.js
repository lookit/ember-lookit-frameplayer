import Ember from 'ember';
import Participate from './participate';

// Adapted from Experimenter's participate controller https://github.com/CenterForOpenScience/lookit/blob/develop/app/controllers/participate.js
export default Participate.extend({
    previewData: null,
    showData: false,
    showPreviewData(session) {
        return new Ember.RSVP.Promise((resolve) => {
            this.set('previewData', JSON.stringify(session.toJSON(), null, 4));
            this.set('showData', true);
            this.set('_resolve', resolve);
        });
    },
    _resolve: null,
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
