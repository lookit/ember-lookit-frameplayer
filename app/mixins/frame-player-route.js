import Ember from 'ember';
import loadAll from '../utils/load-relationship';

// Adapted from Lookit's participate route, Experimenter's preview route, and the exp-player route mixin ce/exp-addons/blob/develop/exp-player/addon/mixins/exp-player-route.js
export default Ember.Mixin.create({
    session: Ember.inject.service(),
    _study: null,
    _child: null,
    _response: null,
    _pastResponses: Ember.A(),
    _getStudy(params) {
        return this.get('store').findRecord('study', params.study_id);
    },
    _getChild(params) {
        if (params.child_id === this.get('sessionChildId')) { // Child id in injected session and url params must match
            return this.get('store').findRecord('child', params.child_id);
        } else {
            return Ember.$.Deferred().reject('Child id in session and child id in URL params did not match');
        }
    },
    sessionChildId: Ember.computed('session', function() {
        // Pulls child info from injected session
        const session = this.get('session');
        // TODO Modify to match injected session structure
        return session.get('isAuthenticated') ? session.get('data.child.childId'): null;
    }),

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
                return this._getChild(params);
            })
            .then((child) => {
                this.set('_child', child);
                return this._createStudyResponse().save();
            }).then((response) => {
                this.set('_response', response);
                // return this.get('_study').query('responses', { 'child': this.get('_child').id })
                return loadAll(this.get('_study'), 'responses', this.get('_pastResponses'), { 'child': this.get('_child').id })
            }).then(() => {
                const response = this.get('_response');
                if (!this.get('_pastResponses').includes(response)) {
                    this.get('_pastResponses').pushObject(response);
                }
            })
            .catch((errors) => {
                window.console.log(errors);
                // TODO transition to Not Found in Django app?
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
