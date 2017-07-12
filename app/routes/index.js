import Ember from 'ember';
// TEMPORARY ROUTING - FOR DEMO PURPOSES ONLY
export default Ember.Route.extend({
    beforeModel() {
        window.location.pathname = '/studies/12345/0f8221bc0de74ed2b9e6803860d9b962'
    }
});
