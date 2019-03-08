import Ember from 'ember';
import WarnOnExitRoute from '../mixins/warn-on-exit-route';
import FramePlayerRoute from '../mixins/frame-player-route';
import Raven from 'raven';

// Adapted from Lookit participate route https://github.com/CenterForOpenScience/lookit/blob/develop/app/routes/participate.js
export default Ember.Route.extend(WarnOnExitRoute, FramePlayerRoute, {
    activate() {
        // Include response ID in any raven reports that occur during the experiment\
        Raven.setTagsContext({ sessionID:  this.get('_response.id') });
        return this._super(...arguments);
    },
    deactivate() {
        // Clear any extra context when user finishes an experiment
        Raven.setTagsContext();
        return this._super(...arguments);
    }
});
