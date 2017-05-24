import Ember from 'ember';
import ExpPlayer from 'exp-player/components/exp-player/component';

export default ExpPlayer.extend({
    toast: Ember.inject.service(),

    messageEarlyExitModal: `
If you're sure you'd like to leave this study early
you can do so now.

We'd appreciate it if before you leave you fill out a
very brief exit survey letting us know how we can use
any video captured during this session. Press 'Stay on
this Page' and you will be prompted to go to this
exit survey.

If leaving this page was an accident you will be
able to continue the study.
`,

    _registerHandlers() {
        this._super();
        Ember.$(window).on('keyup', (e) => {
            if (e.which === 112) { // F1 key
                this.send('exitEarly');
            }
        });
    },
    _removeHandlers() {
        Ember.$(window).off('keypress');
        return this._super();
    },
    beforeUnload() {
        if (!this.get('allowExit')) {
            this.get('toast').warning('To leave the study early, please press F1 and then select a privacy level for your videos');
        }
        return this._super(...arguments);
    },
    actions: {
        exitEarly() {
            this.set('hasAttemptedExit', false);
            // Save any available data immediately
            this.send('setGlobalTimeEvent', 'exitEarly', {
                exitType: 'manualInterrupt',  // User consciously chose to exit, eg by pressing F1 key
                lastPageSeen: this.get('frameIndex') + 1
            });
            this.get('session').save();

            // Navigate to last page in experiment (assumed to be survey frame)
            var max = this.get('frames.length') - 1;
            this.set('frameIndex', max);
        },
    }
});
