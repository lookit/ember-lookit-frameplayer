import ExpLookitImagesAudio from '../exp-lookit-images-audio/component';
import InfantControlledTiming from '../../mixins/infant-controlled-timing';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Infant-controlled version of the {{#crossLink "Exp-lookit-images-audio"}}{{/crossLink}} frame. This works the same way as
 * exp-lookit-images-audio except that you can enable the parent to:
 *
 * - end the trial by pressing the `endTrialKey` key
 * - hold down the `lookawayKey` (or the mouse button) to indicate that the child is not looking; the trial will automatically end
 *   after the lookaway criterion is met.
 *
 * You can disable either of these behaviors by setting the key to `''`.
 *
 * The frame will still end when it would have anyway if neither of these things happen! For instance, if you would have
 * displayed an image for 30 seconds, then after 30 seconds the frame will move on, serving as a "ceiling" on looking time.
 *
 * Lookaway criterion: You have two options for how to determine when the child has looked away long enough to proceed.
 * Set the `lookawayType` to `"total"` to accumulate lookaway time until the child has looked away for a total of
 * `lookawayThreshold` seconds. (For instance, if the `lookawayThreshold` is 2, then the trial will end after the child
 * looks away for 0.5s, then 1s, then 0.5s.) Set the `lookawayType` to `"continuous"` to require that the child look
 * away for a continuous `lookawayThreshold`-second interval. (For instance, if the `lookawayThreshold` is 2, then the
 * child might look away for 1s, 1.5s, and 1s but the trial would continue until she looked away for 2s.)
 *
 * The looking time measurement begins only when the video starts, not while a video connection is established.
 *
 * If a `lookawayKey` is defined, lookaways are recorded the entire time the frame is running. However, the looking
 * time measurement only starts once images are displayed (or the "delay" timer starts counting down, for images
 * shown at a delay - but e.g., not during webcam connection). Lookaways at the very
 * start don't count! If the child is not looking at the start, the measurement begins once they look
 * for the first time.
 *
 * Two pieces of data are recorded for convenience when coding or if implementing a live habituation procedure:
 * `totalLookingTime` and `reasonTrialEnded`.
 *
 * Example usage:
 *
 ```json
 "play-video-twice": {
    "kind": "exp-lookit-video-infant-control",
    "lookawayKey": "p",
    "lookawayType": "total",
    "lookawayThreshold": 2,
    "endTrialKey": "q",

    "audio": {
        "loop": false,
        "source": "peekaboo"
    },
    "video": {
        "top": 10,
        "left": 25,
        "loop": true,
        "width": 50,
        "source": "cropped_apple"
    },
    "backgroundColor": "white",
    "autoProceed": true,
    "parentTextBlock": {
        "text": "If your child needs a break, just press X to pause!"
    },
    "requiredDuration": 0,
    "requireAudioCount": 0,
    "requireVideoCount": 2,
    "restartAfterPause": true,
    "pauseKey": "x",
    "pauseKeyDescription": "X",
    "pauseAudio": "pause",
    "pauseVideo": "attentiongrabber",
    "pauseText": "(You'll have a moment to turn around again.)",
    "unpauseAudio": "return_after_pause",
    "doRecording": true,
    "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
    "audioTypes": [
        "ogg",
        "mp3"
    ],
    "videoTypes": [
        "webm",
        "mp4"
    ]
}

 * ```
 * @class Exp-lookit-images-audio-infant-control
 * @extends Exp-lookit-images-audio
 * @uses Infant-controlled-timing
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
    }

});
