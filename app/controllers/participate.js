import Ember from 'ember';
// Adapted from Lookit https://github.com/CenterForOpenScience/lookit
export default Ember.Controller.extend({
    isDirty: function() {
        // TODO: check the response model to see if it contains unsaved data
        var response = this.get('response');
        return response.get('hasDirtyAttributes');
    },
    actions: {
        saveResponse(payload, callback) {
            var response = this.get('response');
            response.setProperties(payload);
            response.save().then(callback);
            this.set('response', response);
        }
    }
});
