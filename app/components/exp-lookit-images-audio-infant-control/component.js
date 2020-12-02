import ExpLookitImagesAudio from '../exp-lookit-images-audio/component';
import InfantControlledTiming from '../../mixins/infant-controlled-timing';

/*
 * Infant-controlled version of the exp-lookit-images-audio frame. This works the same way as
 * exp-lookit-images-audio except that you can enable the parent to code looking time.
 */

export default ExpLookitImagesAudio.extend(InfantControlledTiming, {

    meta: {
        data: {
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                },
                videoList: {
                    type: 'list'
                },
                images: {
                    type: 'array'
                },
                audioPlayed: {
                    type: 'string'
                },
                selectedImage: {
                    type: 'string'
                },
                correctImageSelected: {
                    type: 'string'
                },
                totalLookingTime: {
                    type: 'number'
                },
                trialEndReason: {
                    type: 'string'
                }
            },
        }
    },

    finish() {
        this.endParentControl();
        this._super(...arguments);
    },

    startTrial() {
        this._super(...arguments);
        this.startParentControl();
    },

    checkAndEnableProceed() {
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
