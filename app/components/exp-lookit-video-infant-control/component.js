import ExpLookitVideo from '../exp-lookit-video/component';
import InfantControlledTiming from '../../mixins/infant-controlled-timing';

/*
 * Infant-controlled version of the exp-lookit-video frame. This works the same way as
 * exp-lookit-video except that you can enable the parent to code looking time.
 */

export default ExpLookitVideo.extend(InfantControlledTiming, {

    meta: {
        data: {
            type: 'object',
            properties: {
                videoShown: {
                    type: 'string',
                    default: ''
                },
                videoId: {
                    type: 'string'
                },
                hasBeenPaused: {
                    type: 'boolean'
                },
                totalLookingTime: {
                    type: 'number'
                },
                trialEndReason: {
                    type: 'string'
                }
            }
        }
    },

    actions: {

        videoStarted() {
            if (this.get('testVideoTimesPlayed') === 0) {
                this.startParentControl();
            }
            this._super(...arguments);
        },

        unpauseStudy() {
            this.startParentControl();
            this._super(...arguments);
        },

        finish() {
            if (!this.get('_finishing')) {
                this.endParentControl();
            }
            this._super(...arguments);
        },

    },

    togglePauseStudy(pause) {
        if (pause || !this.get('isPaused')) { // Not currently paused: pause
            this.endParentControl();
        }
        this._super(...arguments);
    },

    isReadyToFinish() {
        let ready = this._super(...arguments);
        if (ready) {
            this.set('trialEndReason', 'ceiling');
            this.setTrialEndTime();
        }
        return ready;
    },


    onLookawayCriterion() {
        this.readyToFinish();
    },

    onStudyPause() {
        this.endParentControl();
        this.set('trialEndReason', 'pause');
        this.setTrialEndTime();
        return this._super(...arguments);
    }

});