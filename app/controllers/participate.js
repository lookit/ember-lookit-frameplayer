import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        saveResponse(payload, callback) {
            var response = this.get('response');
            response.setProperties(payload);
            response.save().then(callback);
            this.set('response', response);
        }
    }
});
