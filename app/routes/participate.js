import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
        return {
            id: params.study_id,
            type: 'study',
            title: 'Hello',
            description: 'this study'

        }
    }
});
