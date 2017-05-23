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
    _getChild(params, participant) {
        const childId = this._getChildIdFromSession();
        const childIdFromParams = this.splitUserParams(params)[1];
        if (childId && childIdFromParams === childId) {
            return participant.get('profiles');
        }
    },
    splitUserParams(params) {
        return params.participant_child_ids.split('.');
    },
    beforeModel(transition) {
        // TODO transition back to study detail page if no child profile
    },
    model(params) {
        return Promise.resolve()
            .then(() => {
                return this._getStudy(params);
            })
            .then((study) => {
                this.set('study', study);
                return this._getParticipant(params);
            })
            .then((participant) => {
                this.set('participant', participant);
                return this._getChild(params, participant)

            })
            .catch(() => {
                window.console.log('issues')
            });
    }
});
