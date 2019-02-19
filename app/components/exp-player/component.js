import Ember from 'ember';
import ExpPlayer from 'exp-player/components/exp-player/component';

// Copied from Lookit https://github.com/CenterForOpenScience/lookit/components/exp-player
export default ExpPlayer.extend({
    toast: Ember.inject.service(),

    _registerHandlers() {
        this._super();
        var _this = this;
        Ember.$(window).on('keydown', (e) => {
            if ((e.which === 112) || (e.ctrlKey && e.which == 88)) { // F1 key or ctrl-x
                _this.showConfirmationDialog();
            }
        });
    },

    showConfirmationDialog() {
        var _this = this;
        this.get('toast').warning("<br><button type='button' id='confirmationContinueStudy' class='btn btn-outline-secondary' style='color:black;'>Continue</button><button type='button' id='confirmationExitStudy' class='btn btn-danger' style='float:right;'>Exit</button>", 'Really exit study?',
          {
              allowHtml: true,
              preventDuplicates: true,
              onclick: null,
              timeOut: 0,
              extendedTimeOut: 0,
              onShown: function () {
                  Ember.$("#confirmationExitStudy").click(function(){
                    _this.send('exitEarly');
                  });
                  Ember.$("#confirmationContinueStudy").click(function(){
                    _this.get('toast').clear();
                  });
                }
          });
    },

    _removeHandlers() {
        Ember.$(window).off('keydown');
        return this._super();
    },

    beforeUnload() {
        if (!this.get('allowExit')) {
            this.showConfirmationDialog();
            this.get('toast').warning('To leave the study early, please press Exit below so you can select a privacy level for your videos.');
        }
        return this._super(...arguments);
    },

    actions: {
        exitEarly() {
            this.set('hasAttemptedExit', false);
            Ember.$(window).off('keydown');
            // Save any available data immediately
            this.send('setGlobalTimeEvent', 'exitEarly', {
                exitType: 'manualInterrupt',  // User consciously chose to exit, eg by pressing F1 key
                lastPageSeen: this.get('frameIndex') + 1
            });
            this.get('session').save(); // I think this is the response

            // Navigate to last page in experiment (assumed to be survey frame)
            var max = this.get('frames.length') - 1;
            this.set('frameIndex', max);
        },
    }
});
