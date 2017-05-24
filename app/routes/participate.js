import Ember from 'ember';

export default Ember.Route.extend({
    session: Ember.inject.service(),
    study: null,
    participant: null,
    child: null,
    _getStudy(params) {
        return this.get('store').findRecord('study', params.study_id);
    },
    _getUserIdFromSession() {
        const session = this.get('session');
        return session.get('isAuthenticated') ? session.get('data.authenticated.id'): null;
    },
    _getChildIdFromSession() {
        const session = this.get('session');
        return session.get('isAuthenticated') ? session.get('data.profile.profileId'): null;
    },
    _getParticipant(params) {
        const participantId = this._getUserIdFromSession();
        const partIdFromParams = this.splitUserParams(params)[0];
        if (participantId && partIdFromParams === participantId) {
            return this.get('store').findRecord('user', participantId);
        } else {
            // TODO redirect to study detail
        }
    },
    _getChildren(params, participant) {
        const childId = this._getChildIdFromSession();
        const childIdFromParams = this.splitUserParams(params)[1];
        if (childId && childIdFromParams === childId) {
            return participant.get('profiles');
        }
    },
    splitUserParams(params) {
        return params.participant_child_ids.split('.');
    },
    // beforeModel(transition) {
    //     // TODO transition back to study detail page if no child profile
    // },
    model(params) {
        return Ember.RSVP.Promise.resolve()
            .then(() => {
                return this._getStudy(params);
            })
            .then((study) => {
                this.set('study', study);
                return this._getParticipant(params);
            })
            .then((participant) => {
                this.set('participant', participant);
                return this._getChildren(params, participant);
            })
            .then((children) => {
                this.set('children', children);
                children.forEach(child => {
                    if (child.get('id') === this._getChildIdFromSession()) {
                        this.set('child', child);
                    }
                });
                let response = this.store.createRecord('response', {
                    completed: false,
                    feedback: '',
                    hasReadFeedback: '',
                    expData: {},
                    sequence: []
                });
                response.set('study', this.get('study'));
                response.set('profile', this.get('child'));
                response.set('participant', this.get('participant'));
                return response.save();
            }).then((response) => {
                this.set('response', response);
                this.set('pastResponses', [response]);
            })
            .catch((errors) => {
                window.console.log(errors);
            });
    },
    setupController(controller) {
        this._super(controller);
        controller.set('study', this.get('study'));
        controller.set('child', this.get('child'));
        controller.set('participant', this.get('participant'));
        controller.set('response', this.get('response'));
        controller.set('pastResponses', this.get('pastResponses'));
    }

});
