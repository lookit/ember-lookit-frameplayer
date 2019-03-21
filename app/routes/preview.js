import Ember from 'ember';
import WarnOnExitRouteMixin from '../mixins/warn-on-exit-route';
import FramePlayerRoute from '../mixins/frame-player-route';

// Adapted from Experimenter preview route https://github.com/CenterForOpenScience/experimenter/blob/develop/app/routes/experiments/info/preview.js
export default Ember.Route.extend(WarnOnExitRouteMixin, FramePlayerRoute, {
    _createStudyResponse() {
        const response = this._super();
        response.setProperties({
            id: 'PREVIEW_DATA_DISREGARD'
        });
        return response.reopen({
            save() {
                if (this.get('completed')) {
                    var controller = Ember.getOwner(this).lookup('controller:preview');
                    controller.showPreviewData(this).then(() => {
                        // Override the WarnOnExitMixin's behavior
                        controller.set('forceExit', true);
                        window.location.href = '/exp/studies/';
                    });
                    return Ember.RSVP.reject();
                } else {
                    return Ember.RSVP.resolve(this);
                }
            }});
    },
    _getChild() {
        let child = this.store.createRecord('child', {
            id: 'TEST_CHILD_DISREGARD'
        });
        return child;
    }
});
