import Ember from 'ember';
import loadAll from '../utils/load-relationship';

export default Ember.Mixin.create({
    _study: null,
    _child: null,
    _response: null,
    _pastResponses: Ember.A(),
    _getStudy(params) {
        return this.get('store').findRecord('study', params.study_id);
    },
    _getChild(params) {
        return this.get('store').findRecord('child', params.child_id);
    },
    _createStudyResponse() {
        let response = this.store.createRecord('response', {
            completed: false,
            feedback: '',
            hasReadFeedback: '',
            expData: {},
            sequence: []
        });
        response.set('study', this.get('_study'));
        response.set('child', this.get('_child'));
        return response;
    },
    model(params) {
        return Ember.RSVP.Promise.resolve()
            .then(() => {
                return this._getStudy(params);
            })
            .then((study) => {
                this.set('_study', study);
                console.log(study.id);
                return this._getChild(params);
            })
            .then((child) => {
                this.set('_child', child);
                console.log(child.id);
                return this._createStudyResponse().save();
            }).then((response) => {
                this.set('_response', response);
                return loadAll(this.get('_study'), 'responses', this.get('_pastResponses'), { 'child': this.get('_child').id })
            }).then(() => {
                const response = this.get('_response');
                if (!this.get('_pastResponses').includes(response)) {
                    this.get('_pastResponses').pushObject(response);
                }
            })
            .catch((errors) => {
                window.console.log(errors);
                this.transitionTo('page-not-found');
            });
    },
    setupController(controller) {
        this._super(controller);
        controller.set('study', this.get('_study'));
        controller.set('child', this.get('_child'));
        controller.set('response', this.get('_response'));
        controller.set('pastResponses', this.get('_pastResponses'));
    }
});
