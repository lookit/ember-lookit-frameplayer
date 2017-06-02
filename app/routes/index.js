import Ember from 'ember';
// TEMPORARY ROUTING - FOR DEMO PURPOSES ONLY
export default Ember.Route.extend({
    beforeModel() {
        window.location.pathname = '/studies/12345/abcde.fghij'
    }
});
