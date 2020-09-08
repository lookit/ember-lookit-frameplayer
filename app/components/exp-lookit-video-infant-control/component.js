import ExpLookitVideo from '../exp-lookit-video/component'
import InfantControlledTiming from '../../mixins/infant-controlled-timing';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Video display frame. This may be used for displaying videos to older children or parents, as well as for
 * typical looking measures trials or as brief filler in between test trials.
 *
 * (Note: this frame replaced the previous exp-lookit-video frame, which is now called
 *  {{#crossLink "Exp-lookit-composite-video-trial"}}{{/crossLink}}.)
 *
 * This is very customizable: you can...
 *   - position the video wherever you want on the screen, including specifying that it should fill the screen (while maintaining aspect ratio)
 *   - choose the background color
 *   - optionally specify audio that should play along with the video
 *   - have the frame proceed automatically (`autoProceed`), or enable a Next button when the user can move on
 *   - allow parents to press a key to pause the video (and then either restart when they un-pause, or move on to the next frame)
 *
 * Video (and audio if provided) start as soon as any recording begins, or right away if there is no recording starting.
 *
 * If the user pauses using the `pauseKey`, or if the user leaves fullscreen mode, the study will be paused.
 * While paused, the video/audio are stopped and not displayed, and instead a looping `pauseVideo` and text are displayed.
 *
 * There are several ways you can specify how long the trial should last. The frame will continue until
 * ALL of the following are true:
 *   - the video has been played all the way through `requireVideoCount` times
 *   - the audio has been played all the way through `requireAudioCount` times
 *   - `requiredDuration` seconds have elapsed since beginning the video
 *
 * You do not need to use all of these - for instance, to play the video one time and then proceed, set
 * `requireVideoCount` to 1 and the others to 0. You can also specify whether the audio and video should loop (beyond
 * any replaying required to reach the required counts).
 *
 * This frame is displayed fullscreen; if the frame before it is not, that frame
 * needs to include a manual "next" button so that there's a user interaction
 * event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
 * without a user event.)
 *
 * Example usage: (Note - this is a bit of an odd example with both audio ('peekaboo') and audio embedded in the video.
 * In general you would probably only want one or the other!)

 ```json
 "play-video-twice": {
            "kind": "exp-lookit-video",
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
        },

 * ```
 * @class Exp-lookit-video-infant-control
 * @extends Exp-lookit-video
 * @uses Infant-controlled-timing
 */

export default ExpLookitVideo.extend(InfantControlledTiming, {

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

    onLookawayCriterion() {
        this.readyToFinish();
    }

});
