import Ember from 'ember';
import WarnOnExitRouteMixin from 'exp-player/mixins/warn-on-exit-route';
import { get } from 'lodash';

export default Ember.Route.extend(WarnOnExitRouteMixin, {
    session: Ember.inject.service(),
    _study: null, // Experiment
    _participant: null, // Adult user that is taking study with child
    _children: null, // All children associated with the user
    _child: null, // Particular child that is taking this study
    _pastResponses: Ember.A(), // Past responses to this study (by this participant and this child)
    _getStudy(params) {
        return this.get('store').findRecord('study', params.study_id);
    },
    _getUserIdFromSession() {
        // Pull user id from injected session
        const session = this.get('session');
        return session.get('isAuthenticated') ? get(session, 'data.authenticated.id'): null;
    },
    _getChildIdFromSession() {
        // Pull child id from injected session
        const session = this.get('session');
        return session.get('isAuthenticated') ? get(session, 'data.profile.profileId'): null;
    },
    _getParticipant(params) {
        // If participant id in injected session matches part id in URL params, fetch this user.
        // Otherwise, redirect to study detail.
        const participantId = this._getUserIdFromSession();
        const partIdFromParams = this.splitUserParams(params)[0];
        if (partIdFromParams === participantId) {
            return this.get('store').findRecord('user', participantId);
        } else {
            // TODO redirect to study detail?
            // Session user doesn't match user from params
            window.console.log('Redirected to study detail - participant ID and user ID in params did not match')
        }
    },
    _getChildren(params, participant) {
        // If child id in injected session matches child id in URL params, fetch user's children
        // Otherwise, redirect to study detail.
        const childId = this._getChildIdFromSession();
        const childIdFromParams = this.splitUserParams(params)[1];
        if (childIdFromParams === childId) {
            // TODO - can the number of requests be minimized? Can we access child endpoint directly?
            return participant.get('profiles');
        } else {
            // TODO redirect to study detail?
            // Child doesn't match child from params
            window.console.log('Redirected to study detail - child ID and child ID in params did not match')

        }
    },
    splitUserParams(params) {
        // participate_child_ids params should be in format "user-id.profile-id".
        // If this is not the case, transition to page-not-found.
        const splitIds = (get(params, 'participant_child_ids') || "").split('.');
        return splitIds.length === 2 ? splitIds : this.transitionTo('/page-not-found');
    },
    // beforeModel(transition) {
    //     // TODO transition back to study detail page if no child profile
    // },
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
        response.set('participant', this.get('_participant'));
        return response;
    },
    model(params) {
        // TODO - too many requests!
        return Ember.RSVP.Promise.resolve()
            .then(() => {
                return this._getStudy(params);
            })
            .then((study) => {
                this.set('_study', study);
                return this._getParticipant(params);
            })
            .then((participant) => {
                this.set('_participant', participant);
                return this._getChildren(params, participant);
            })
            .then((children) => {
                this.set('_children', children);
                (children || []).forEach(child => {
                    if (child.get('id') === this._getChildIdFromSession()) {
                        this.set('_child', child);
                    }
                });
                if (this.get('_child')) {
                    const response = this.createStudyResponse();
                    return response.save();
                } else {
                    window.console.log('Redirected to study detail - child is not found on this user profile')
                    // TODO Redirect to study detail
                }

            }).then((response) => {
                this.set('_response', response);
                // TODO - where are we storing past Responses?
                this.set('_pastResponses', [response]);
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
        controller.set('participant', this.get('_participant'));
        controller.set('response', this.get('_response'));
        controller.set('pastResponses', this.get('_pastResponses'));
    }
});
