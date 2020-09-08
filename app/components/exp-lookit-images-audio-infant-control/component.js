import ExpLookitImagesAudio from '../exp-lookit-images-audio/component'
import InfantControlledTiming from '../../mixins/infant-controlled-timing';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Frame to display image(s) and play audio, with optional video recording. Options allow
 * customization for looking time, storybook, forced choice, and reaction time type trials,
 * including training versions where children (or parents) get feedback about their responses.
 *
 * This can be used in a variety of ways - for example:
 *
 * - Display an image for a set amount of time and measure looking time
 *
 * - Display two images for a set amount of time and play audio for a
 * looking-while-listening paradigm
 *
 * - Show a "storybook page" where you show images and play audio, having the parent/child
 * press 'Next' to proceed. If desired,
 * images can appear and be highlighted at specific times
 * relative to audio. E.g., the audio might say "This [image of Remy appears] is a boy
 * named Remy. Remy has a little sister [image of Zenna appears] named Zenna.
 * [Remy highlighted] Remy's favorite food is brussel sprouts, but [Zenna highlighted]
 * Zenna's favorite food is ice cream. [Remy and Zenna both highlighted] Remy and Zenna
 * both love tacos!"
 *
 * - Play audio asking the child to choose between two images by pointing or answering
 * verbally. Show text for the parent about how to help and when to press Next.
 *
 * - Play audio asking the child to choose between two images, and require one of those
 * images to be clicked to proceed (see "choiceRequired" option).
 *
 * - Measure reaction time as the child is asked to choose a particular option on each trial
 * (e.g., a central cue image is shown first, then two options at a short delay; the child
 * clicks on the one that matches the cue in some way)
 *
 * - Provide audio and/or text feedback on the child's (or parent's) choice before proceeding,
 * either just to make the study a bit more interactive ("Great job, you chose the color BLUE!")
 * or for initial training/familiarization to make sure they understand the task. Some
 * images can be marked as the "correct" answer and a correct answer required to proceed.
 * If you'd like to include some initial training questions before your test questions,
 * this is a great way to do it.
 *
 * In general, the images are displayed in a designated region of the screen with aspect
 * ratio 7:4 (1.75 times as wide as it is tall) to standardize display as much as possible
 * across different monitors. If you want to display things truly fullscreen, you can
 * use `autoProceed` and not provide `parentText` so there's nothing at the bottom, and then
 * set `maximizeDisplay` to true.
 *
 * Webcam recording may be turned on or off; if on, stimuli are not displayed and audio is
 * not started until recording begins. (Using the frame-specific `isRecording` property
 * is good if you have a smallish number of test trials and prefer to have separate video
 * clips for each. For reaction time trials or many short trials, you will likely want
 * to use session recording instead - i.e. start the session recording before the first trial
 * and end on the last trial - to avoid the short delays related to starting/stopping the video.)
 *
 * This frame is displayed fullscreen, but is not paused or otherwise disabled if the
 * user leaves fullscreen. A button appears prompting the user to return to
 * fullscreen mode.
 *
 * Any number of images may be placed on the screen, and their position
 * specified. (Aspect ratio will be the same as the original image.)
 *
 * image-3: Image plus audio, auto-proceeding after audio completes and 4 seconds go by
 *
 *

```json
 "frames": {
    "image-3": {
        "kind": "exp-lookit-images-audio",
        "audio": "wheresremy",
        "images": [
            {
                "id": "remy",
                "src": "wheres_remy.jpg",
                "position": "fill"
            }
        ],
        "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
        "audioTypes": [
            "mp3",
            "ogg"
        ],
        "autoProceed": true,
        "doRecording": false,
        "durationSeconds": 4,
        "parentTextBlock": {
            "text": "Some explanatory text for parents",
            "title": "For parents"
        },
        "showProgressBar": false
    }
 }

 * ```
 * @class Exp-lookit-images-audio-infant-control
 * @extends Exp-lookit-images-audio
 * @uses Infant-controlled-timing
 */


export default ExpLookitImagesAudio.extend(InfantControlledTiming, {

    finish() {
        this.endParentControl();
        this._super(...arguments);
    },

    startTrial() {
        this._super(...arguments);
        this.startParentControl();
    },

    onLookawayCriterion() {
        this.readyToFinish();
    }

});
