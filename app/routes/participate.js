import Ember from 'ember';
import WarnOnExitRouteMixin from 'exp-player/mixins/warn-on-exit-route';
import FramePlayerRoute from '../mixins/frame-player-route';

export default Ember.Route.extend(WarnOnExitRouteMixin, {
    session: Ember.inject.service(),
    _study: null,
    _profile: null,
    _response: null,
    _pastResponses: Ember.A(),
    sessionProfileId: Ember.computed('session', function() {
        // Pulls profile info from injected session
        const session = this.get('session');
        // TODO Modify to match injected session structure
        return session.get('isAuthenticated') ? session.get('data.profile.profileId'): null;
    }),
    _getStudy(params) {
        return this.get('store').findRecord('study', params.study_id);
    },
    _getProfile(params) {
        if (params.profile_id === this.get('sessionProfileId')) { // Profile id in injected session and url params must match
            return this.get('store').findRecord('profile', params.profile_id);
        } else {
            // TODO redirect to 1) study detail 2) forbidden or 3) not found
            window.console.log('Redirected to study detail - profile id in session and profile id in URL params did not match')
            this.transitionTo('page-not-found');
        }
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
        response.set('profile', this.get('_profile'));
        return response;
    },
// Adapted from Lookit participate route https://github.com/CenterForOpenScience/lookit/blob/develop/app/routes/participate.js
export default Ember.Route.extend(WarnOnExitRouteMixin, FramePlayerRoute, {
    beforeModel (transition) {
        if (!this.get('session.data.profile')) {
            window.console.log('No profile in injected session, so transitioning to study detail');
            // TODO transition to django app study detail
        }
        return this._super(...arguments);
    },
    activate () {
        // Include response ID in any raven reports that occur during the experiment
        this.get('raven').callRaven('setExtraContext', { sessionID: this.get('_response.id') });
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
                return this._getProfile(params);
            })
            .then((profile) => {
                this.set('_profile', profile);
                return this._createStudyResponse().save();
            }).then((response) => {
                this.set('_response', response);
                return this.store.findAll('response');
                // TODO restore once I know how responses will be queried
                // return this.get('store').query('response', {
                //   filter: {
                //     profileId: this.get('_profile').id,
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
        controller.set('profile', this.get('_profile'));
        controller.set('response', this.get('_response'));
        controller.set('pastResponses', this.get('_pastResponses'));
    }
});
