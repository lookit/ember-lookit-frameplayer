import Ember from 'ember';

// Adapted from Lookit's participate controller https://github.com/CenterForOpenScience/lookit/blob/develop/app/controllers/participate.js
export default Ember.Controller.extend({
    isDirty: function() {
        var response = this.get('response');
        return response.get('hasDirtyAttributes');
    },
    actions: {
    }
});
