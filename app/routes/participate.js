import Ember from 'ember';
import WarnOnExitRouteMixin from 'exp-player/mixins/warn-on-exit-route';
import { get } from 'lodash';

// Adapted from Lookit https://github.com/CenterForOpenScience/lookit
export default Ember.Route.extend(WarnOnExitRouteMixin, {
    session: Ember.inject.service(),
    _study: null,
    _child: null,
    _response: null,
    _pastResponses: Ember.A(),
    _getStudy(params) {
        return this.get('store').findRecord('study', params.study_id);
    },
    _getChildIdFromSession() {
        const session = this.get('session');
        // TODO Modify to match structure of injected session
        return session.get('isAuthenticated') ? get(session, 'data.profile.profileId'): null;
    },
    _getChildProfile(params) {
        const childId = this._getChildIdFromSession();
        const childIdFromParams = this.splitUserParams(params)[1];
        if (childIdFromParams === childId) {
            return this.get('store').findRecord('profile', childId);
        } else {
            // TODO redirect to 1) study detail 2) forbidden or 3) not found
            // Child doesn't match child from params
            window.console.log('Redirected to study detail - child ID and child ID in params did not match')
        }
    },
    splitUserParams(params) {
        // participant_child_ids params should be in format "user-id.profile-id".
        // If this is not the case, transition to page-not-found.
        const splitIds = (get(params, 'participant_child_ids') || "").split('.');
        return splitIds.length === 2 ? splitIds : this.transitionTo('/page-not-found');
    },
    createStudyResponse() {
        let response = this.store.createRecord('response', {
            completed: false,
            feedback: '',
            hasReadFeedback: '',
            expData: {},
            sequence: []
        });
        response.set('study', this.get('_study'));
        response.set('profile', this.get('_child'));
        return response;
    },
    beforeModel (transition) {
        const session = this.get('session');
        if (!get(session, 'data.profile')) {
            window.console.log('No child profile, so transitioning to study detail');
            // TODO transition to django app study detail
        }
        return this._super(...arguments);
    },

    activate () {
        let response = this.get('_response');
        // Include response ID in any raven reports that occur during the experiment
        this.get('raven').callRaven('setExtraContext', { sessionID: response.id });
        return this._super(...arguments);
    },

    deactivate () {
        // Clear any extra context when user finishes an experiment
        this.get('raven').callRaven('setExtraContext');
        return this._super(...arguments);
    },
    model(params) {
        return Ember.RSVP.Promise.resolve()
            .then(() => {
                return this._getStudy(params);
            })
            .then((study) => {
                this.set('_study', study);
                return this._getChildProfile(params);
            })
            .then((child) => {
                this.set('_child', child);
                return this.createStudyResponse().save();
            }).then((response) => {
                this.set('_response', response);
                return this.store.findAll('response');
                // TODO restore once I know how responses will be queried
                // return this.get('store').query('response', {
                //   filter: {
                //     profileId: this.get('_child').id,
                //     studyId: this.get('_study').id
                //   }
                // })
            }).then((pastResponses) => {
                const response = this.get('_response');
                this.set('_pastResponses', pastResponses.toArray());
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
        this._super(controller); // TODO Why are pastSessions passed into controller?
        controller.set('study', this.get('_study'));
        controller.set('child', this.get('_child'));
        controller.set('response', this.get('_response'));
        controller.set('pastResponses', this.get('_pastResponses'));
    }
});
