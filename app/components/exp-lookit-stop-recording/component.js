import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import ExpandAssets from '../../mixins/expand-assets';
import isColor, {colorSpecToRgbaArray, textColorForBackground} from '../../utils/is-color';
import { imageAssetOptions, videoAssetOptions } from '../../mixins/expand-assets';

let {
    $
} = Ember;


/*
* Dedicated frame to stop session recording.
*/

export default ExpFrameBaseComponent.extend(ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-stop-recording',

    endSessionRecording: true,
    /**
     * Maximum time allowed for whole-session video upload before proceeding, in seconds.
     * Can be overridden by researcher, based on tradeoff between making families wait and
     * losing data.
     */
    sessionMaxUploadSeconds: 300, // 5 minutes - generous default for possibly long recording

    hasStartedUpload: false,

    progressTimer: null,
    allowProceedTimer: null,

    assetsToExpand: {
        'audio': [],
        'video': [
            'video'
        ],
        'image': [
            'image'
        ]
    },

    frameSchemaProperties: {
        displayFullscreen: {
            type: 'boolean',
            description: 'Whether to display this frame in full-screen mode',
            default: true
        },
        backgroundColor: {
            type: 'string',
            description: 'Color of background',
            default: 'white'
        },
        video: {
            anyOf: videoAssetOptions,
            description: 'list of objects specifying video src and type for calibration audio',
            default: []
        },
        image: {
            anyOf: imageAssetOptions,
            description: 'Image to display while uploading',
            default: ''
        },
        imageAnimation: {
            type: 'string',
            enum: ['bounce', 'spin', ''],
            description: 'Which animation to use for the image.',
            default: 'spin'
        },
        waitForUploadMessage: {
            type: 'string',
            default: '',
            description: 'Custom to display while uploading in place of video upload progress indicator'
        },
        showProgressBar: {
            type: 'boolean',
            default: true,
            description: 'Whether to show a progress bar for video upload progress'
        }
    },

    // TODO: store some data about what happened!
    meta: {
        data: {
            type: 'object',
            properties: {
            }
        }
    },


    didInsertElement() {
        this._super(...arguments);
        this.set('hasVideo', this.get('video').length > 0);

        // Apply background colors
        let colorSpec = this.get('backgroundColor');
        if (isColor(colorSpec)) {
            $('div.exp-lookit-start-stop-recording').css('background-color', colorSpec);
            // Set text color so it'll be visible (black or white depending on how dark background is). Use style
            // so this applies whenever pause text actually appears.
            let colorSpecRGBA = colorSpecToRgbaArray(colorSpec);
            $('p.wait-for-video').css('color', textColorForBackground(colorSpecRGBA));
        } else {
            console.warn('Invalid background color provided; not applying.');
        }

        // Apply image animation class
        if (this.get('image')) {
            $('#placeholder-image').addClass(this.get('imageAnimation'));
        }

        // Make sure we're already recording at the session level!
        if (!this.get('sessionRecordingInProgress')) {
            /**
             * If there's no active session recording so this frame is proceeding
             * immediately.
             *
             * @event warningNoActiveSessionRecording
             */
            this.send('setTimeEvent', 'warningNoActiveSessionRecording');
            this.send('next');
        }

        var _this = this;
        this.stopSessionRecorder().finally(() => {
            _this.send('next');
        });

        this.set('progressTimer', window.setInterval(function() {
            $('#progress').html('Uploading video...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
            if (!_this.get('_recording') && _this.get('sessionRecorder').s3.hasStartedCompletingUpload) {
                const percComplete = _this.get('sessionRecorder').s3.percentUploadComplete;
                if (percComplete > 0) {
                    _this.set('hasStartedUpload', true);
                    window.clearInterval(_this.get('allowProceedTimer'));
                }
                let progressPercStr = percComplete.toString()+'%';
                $('#progress').html(`Uploading video... ${progressPercStr}`);
                $('.progress-bar').css('width', progressPercStr);
            }
        }, 100));

        this.set('allowProceedTimer', window.setTimeout(function() {
            if (!_this.get('hasStartedUpload')) {
                /**
                 * Note: this timer waits a long time (5 minutes) before checking if at least one part of the multi-part * upload has completed, and if not, allowing the participant to proceed. 
                 * This is a longer wait time (vs the old Pipe system) because we don't have as fine-grained upload 
                 * progress info with RecordRTC/S3 as we used to have with Pipe. We might want to reconsider the way
                 * this timer works and its duration in the future, if we get reports about participants getting 'stuck'
                 * while waiting for uploads.
                 *
                 * @event warningUploadTimeoutError
                 */
                _this.send('setTimeEvent', 'warningUploadTimeoutError');
                _this.send('next');
            }
        }, 300000));

    },

    willDestroyElement() {
        window.clearInterval(this.get('progressTimer'));
        window.clearTimeout(this.get('allowProceedTimer'));
        this._super(...arguments);
    }

});
