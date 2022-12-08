import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import PauseUnpause from '../../mixins/pause-unpause';
import ExpandAssets from '../../mixins/expand-assets';
import isColor from '../../utils/is-color';
import { audioAssetOptions, imageAssetOptions, videoAssetOptions } from '../../mixins/expand-assets';

let {
    $
} = Ember;

/*
*
* Frame to do calibration for looking direction. Shows a small video/image in a sequence
* of locations so you'll have video of the child looking to those locations at known times.
*/

export default ExpFrameBaseComponent.extend(VideoRecord, PauseUnpause, ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-calibration',

    displayFullscreen: true, // force fullscreen for all uses of this component

    assetsToExpand: {
        'audio': [
            'calibrationAudio',
        ],
        'video': [
            'calibrationVideo'
        ],
        'image': [
            'calibrationImage'
        ]
    },

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    calTimer: null, // reference to timer counting how long calibration segment has played
    retryCalibrationAudio: false, // see exp-lookit-video regarding this workaround

    frameSchemaProperties: {

        doRecording: {
            type: 'boolean',
            description: 'Whether to do video recording',
            default: true
        },

        backgroundColor: {
            type: 'string',
            description: 'Color of background',
            default: 'white'
        },

        calibrationLength: {
            type: 'number',
            description: 'length of single calibration segment in ms',
            default: 3000
        },

        calibrationPositions: {
            type: 'array',
            description: 'Ordered list of positions to show calibration',
            items: {
                type: 'string',
                enum: ['center', 'left', 'right']
            },
            default: ['center', 'left', 'right', 'center']
        },

        calibrationAudio: {
            anyOf: audioAssetOptions,
            description: 'list of objects specifying audio src and type for calibration audio',
            default: []
        },

        calibrationVideo: {
            anyOf: videoAssetOptions,
            description: 'list of objects specifying video src and type for calibration audio',
            default: []
        },

        calibrationImage: {
            anyOf: imageAssetOptions,
            description: 'Image to use for calibration',
            default: ''
        },

        calibrationImageAnimation: {
            type: 'string',
            enum: ['bounce', 'spin', ''],
            description: 'Which animation to use for the calibration image',
            default: 'spin'
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                }
            }
        }
    },

    finish() { // Move to next frame altogether
        // Call this something separate from next because stopRecorder promise needs
        // to call next AFTER recording is stopped and we don't want this to have
        // already been destroyed at that point.
        window.clearInterval(this.get('calTimer'));
        this.disablePausing();
        var _this = this;
        if (this.get('doRecording')) {
            this.stopRecorder().then(() => {
                _this.set('stoppedRecording', true);
                _this.send('next');
                return;
            }, () => {
                _this.send('next');
                return;
            });
        } else {
            _this.send('next');
        }
    },

    startCalibration() {
        var _this = this;

        // First check whether any calibration video provided. If not, skip.
        if (!this.get('calibrationLength')) {
            this.finish();
        }

        var calAudio = $('#player-calibration-audio')[0];
        $('.calibration-stimulus').show();

        // Show the calibration segment at center, left, right, center, each
        // time recording an event and playing the calibration audio.
        var doCalibrationSegments = function(calList, lastLoc) {
            if (calList.length === 0) {
                _this.finish();
            } else {
                var thisLoc = calList.shift();
                /**
                 * Start of EACH calibration segment
                 *
                 * @event startCalibration
                 * @param {String} location location of calibration ball, relative to child: 'left', 'right', or 'center'
                 */
                _this.send('setTimeEvent', 'startCalibration',
                    {location: thisLoc});


                _this.set('retryCalibrationAudio', true);
                calAudio.pause();
                calAudio.currentTime = 0;
                calAudio.play().then(() => {}, () => {
                    calAudio.play();
                });

                $('.calibration-stimulus').removeClass(lastLoc);
                $('.calibration-stimulus').addClass(thisLoc);
                if (_this.get('hasVideo')) {
                    var calVideo = $('#player-calibration-video')[0];
                    calVideo.pause();
                    calVideo.currentTime = 0;
                    calVideo.play();
                }


                _this.set('calTimer', window.setTimeout(function() {
                    if (!_this.get('_isPaused')) {
                        _this.set('retryCalibrationAudio', false);
                        _this.enablePausing(true); // On 2nd+ cal, require FS mode
                        doCalibrationSegments(calList, thisLoc);
                    }
                }, _this.get('calibrationLength')));

            }
        };

        if (!this.get('_isPaused')) {
            doCalibrationSegments(this.get('calibrationPositions').slice(), '');
        }

    },

    onRecordingStarted() {
        if (!this.get('_isPaused')) {
            this.enablePausing(true);
            this.startCalibration();
        }
    },

    onSessionRecordingStarted() {
        $('#waitForVideo').hide();
        if (!this.get('_isPaused')) {
            this.enablePausing(true);
            this.startCalibration();
        }
    },

    onStudyPause() {
        window.clearInterval(this.get('calTimer'));
        if ($('#player-calibration-audio').length) {
            $('#player-calibration-audio')[0].pause();
        }
        $('.exp-lookit-calibration').hide();
        this.set('retryCalibrationAudio', false);
        if (this.get('doRecording')) {
            let _this = this;
            return this.stopRecorder().finally(() => {
                _this.set('stoppedRecording', true);
                _this.destroyRecorder();
            });
        } else {
            return new Promise((resolve) => {
                resolve();
            });
        }
    },

    didInsertElement() {
        this._super(...arguments);
        this.set('hasVideo', this.get('calibrationVideo').length > 0);
        $('.calibration-stimulus').hide();

        // Apply background colors
        if (isColor(this.get('backgroundColor'))) {
            $('div.exp-lookit-calibration').css('background-color', this.get('backgroundColor'));
        } else {
            console.warn('Invalid background color provided; not applying.');
        }

        // Apply calibration animation class
        if (this.get('calibrationImage')) {
            $('#calibration-image').addClass(this.get('calibrationImageAnimation'));
        }
        if (!(this.get('doRecording') && !(this.get('startSessionRecording')))) {
            if (this.checkFullscreen()) {
                this.enablePausing(); // allow pausing right away if not in process of entering FS, otherwise give a moment
            }
            this.startCalibration();
        }
    },

    willDestroyElement() {
        window.clearInterval(this.get('calTimer'));
        this._super(...arguments);
    }
});
