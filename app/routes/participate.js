import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import WarnOnExitRouteMixin from 'exp-player/mixins/warn-on-exit-route';
import FramePlayerRoute from '../mixins/frame-player-route';

// Adapted from Lookit participate route https://github.com/CenterForOpenScience/lookit/blob/develop/app/routes/participate.js
export default Ember.Route.extend(AuthenticatedRouteMixin, WarnOnExitRouteMixin, FramePlayerRoute, {
    beforeModel (transition) {
        if (!this.get('session.data.child')) {
            window.console.log('No child in injected session, so transitioning to study detail');
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
    }
});
