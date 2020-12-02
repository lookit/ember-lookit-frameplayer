import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import isColor, {colorSpecToRgbaArray, textColorForBackground} from '../../utils/is-color';
import { audioAssetOptions, videoAssetOptions } from '../../mixins/expand-assets';
import PauseUnpause from "../../mixins/pause-unpause";

let {
    $
} = Ember;

/*
  Frame to display a video to the participant.
 */

let ExpLookitVideo = ExpFrameBaseComponent.extend(VideoRecord, PauseUnpause, ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-video',

    displayFullscreen: true, // force fullscreen for all uses of this component

    assetsToExpand: {
        'audio': [
            'audio/source',
            'pauseAudio',
            'unpauseAudio'
        ],
        'video': [
            'pauseVideo',
            'video/source'
        ],
        'image': [
        ]
    },

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    testTimer: null, // reference to timer counting how long video has been playing, if time-based limit

    testVideoTimesPlayed: 0, // how many times the test video has been played (including current)
    testAudioTimesPlayed: 0, // how many times the test audio has been played (including current)
    satisfiedDuration: false, // whether we have completed the requiredDuration

    skip: false,
    hasParentText: true,

    /** comment some text */
    maximizeVideoArea: false,
    _finishing: false,

    frameSchemaProperties: {

        video: {
            type: 'object',
            properties: {
                'source': {
                    anyOf: videoAssetOptions
                },
                'left': {
                    type: 'number'
                },
                'width': {
                    type: 'number'
                },
                'top': {
                    type: 'number'
                },
                'height': {
                    type: 'number'
                },
                'position': {
                    type: 'string',
                    enum: ['fill', '']
                },
                'loop': {
                    type: 'boolean'
                }
            }
        },

        audio: {
            type: 'object',
            description: 'Audio to play along with video',
            properties: {
                'source': {
                    anyOf: audioAssetOptions
                },
                'loop': {
                    type: 'boolean'
                }
            },
            default: {}
        },

        autoProceed: {
            type: 'boolean',
            description: 'Whether to proceed automatically after audio (and hide replay/next buttons)',
            default: true
        },

        backgroundColor: {
            type: 'string',
            description: 'Color of background; any valid CSS selector.',
            default: 'white'
        },

        // TODO: set up to replicate this behavior
        restartAfterPause: {
            type: 'boolean',
            description: 'Whether to restart this frame upon unpausing, vs moving on to the next frame',
            default: true
        },

        requiredDuration: {
            type: 'number',
            description: 'Minimum trial duration to require (from start of video), in seconds',
            default: 0,
            minimum: 0
        },

        requireVideoCount: {
            type: 'number',
            description: 'Number of times to play test video',
            default: 1
        },

        requireAudioCount: {
            type: 'number',
            description: 'Number of times to play test audio',
            default: 0
        },

        doRecording: {
            type: 'boolean',
            description: 'Whether to do video recording',
            default: true
        },

        parentTextBlock: {
            type: 'object',
            properties: {
                title: {
                    type: 'string'
                },
                text: {
                    type: 'string'
                },
                css: {
                    type: 'object',
                    default: {}
                }
            },
            default: {}
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {
                /**
                * Source of video  shown during this trial. Just stores first URL if multiple formats are offered.
                * @attribute videoShown
                * @type string
                */
                videoShown: {
                    type: 'string',
                    default: ''
                },
                /**
                * Source of audio played during this trial. Just stores first URL if multiple formats are offered.
                * @attribute audioPlayed
                * @type string
                */
                audioPlayed: {
                    type: 'string',
                    default: ''
                },
                videoId: {
                    type: 'string'
                }
            }
        }
    },

    actions: {

        videoStarted() {
            /**
             * When video begins playing (recorded each time video starts if played through more than once)
             *
             * @event videoStarted
             */
            if (this.get('isDestroying') || this.get('isDestroyed')) {
                return;
            }

            this.send('setTimeEvent', 'videoStarted');
            if (this.get('testVideoTimesPlayed') === 0) {
                window.clearInterval(this.get('testTimer'));
                if (this.get('requiredDuration')) {
                    this.set('testTimer', window.setTimeout(() => {
                        this.set('satisfiedDuration', true);
                        if (this.isReadyToFinish()) {
                            this.readyToFinish();
                        }
                    }, this.get('requiredDuration') * 1000));
                } else {
                    this.set('satisfiedDuration', true);
                    if (this.isReadyToFinish()) {
                        this.readyToFinish();
                    }
                }
                if ($('#player-audio').length) {
                    $('#player-audio')[0].play();
                }
            }
        },

        videoStopped() {
            if (this.get('isDestroying') || this.get('isDestroyed')) {
                return;
            }
            /**
             * When video completes playback (recorded each time if played more than once)
             *
             * @event videoStopped
             */
            this.send('setTimeEvent', 'videoStopped');
            this.set('testVideoTimesPlayed', this.get('testVideoTimesPlayed') + 1);
            if (this.isReadyToFinish()) {
                this.readyToFinish();
            }
            // Restart the video if it's supposed to loop OR if it's supposed to play another time
            if ($('#player-video').length && (this.get('video.loop') || (this.get('testVideoTimesPlayed') < this.get('requireVideoCount')))) {
                $('#player-video')[0].currentTime = 0;
                $('#player-video')[0].play();
            }
        },

        audioStarted() {
            if (this.get('isDestroying') || this.get('isDestroyed')) {
                return;
            }
            /**
             * When audio begins playing (recorded each time video starts if played through more than once)
             *
             * @event audioStarted
             */
            this.send('setTimeEvent', 'audioStarted');
        },

        audioStopped() {
            if (this.get('isDestroying') || this.get('isDestroyed')) {
                return;
            }
            /**
             * When audio completes playback (recorded each time if played more than once)
             *
             * @event audioStopped
             */
            this.send('setTimeEvent', 'audioStopped');
            this.set('testAudioTimesPlayed', this.get('testAudioTimesPlayed') + 1);
            if (this.isReadyToFinish()) { // in case this was the last criterion for being done
                this.readyToFinish();
            }
            // Restart the video if it's supposed to loop OR if it's supposed to play another time
            if ($('#player-audio').length && (this.get('audio.loop') || (this.get('testAudioTimesPlayed') < this.get('requireAudioCount')))) {
                $('#player-audio')[0].currentTime = 0;
                $('#player-audio')[0].play();
            }
        },

        finish() {
            // Call this something separate from next because stopRecorder promise needs
            // to call next AFTER recording is stopped and we don't want this to have
            // already been destroyed at that point.

            // Pause audio/video so we don't trigger started/stopped handlers while destroying
            $('audio, video').each(function() {
                this.pause();
            });
            /**
             * When trial is complete and begins cleanup (may then wait for video upload)
             *
             * @event trialCompleted
             */
            this.disablePausing();
            this.send('setTimeEvent', 'trialCompleted');
            window.clearInterval(this.get('testTimer'));
            this.set('testVideoTimesPlayed', 0);
            this.set('testAudioTimesPlayed', 0);
            this.set('satisfiedDuration', false);
            var _this = this;
            if (!this.get('_finishing')) {
                this.set('_finishing', true);
                if (this.get('doRecording')) {
                    this.set('doingTest', false);
                    this.stopRecorder().then(() => {
                        _this.set('stoppedRecording', true);
                        _this.send('next');
                    }, () => {
                        _this.send('next');
                    });
                } else {
                    _this.send('next');
                }
            }
        }

    },

    isReadyToFinish() {
        let ready = (this.get('testVideoTimesPlayed') >= this.get('requireVideoCount')) &&
            (this.get('testAudioTimesPlayed') >= this.get('requireAudioCount')) &&
            (this.get('satisfiedDuration'));
        $('#nextbutton').prop('disabled', !ready);
        return ready;
    },

    readyToFinish() {
        if (this.get('autoProceed')) {
            this.send('finish');
        } else {
            /**
             * When all requirements for this frame are completed and next button is enabled (only recorded if
             * autoProceed is false)
             *
             * @event nextButtonEnabled
             */
            this.send('setTimeEvent', 'nextButtonEnabled');
            $('#nextbutton').prop('disabled', false);
        }
    },

    startVideo() {
        // Set doingTest to true, which displays test video in template; once that actually starts
        // it will trigger the videoStarted action
        this.enablePausing(false); // already took care of FS checks if recording started already
        this.set('doingTest', true);
    },

    onStudyPause() {
        window.clearInterval(this.get('testTimer'));
        $('audio#player-audio, video#player-video').each(function() {
            this.pause();
        });
        this.set('doingTest', false);
        this.set('testVideoTimesPlayed', 0);
        this.set('testAudioTimesPlayed', 0);
        this.set('satisfiedDuration', false);
        $('.exp-lookit-video').hide();
        $('#nextbutton').prop('disabled', true); // disable Next while paused
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

        if (!this.get('restartAfterPause')) {
            this.set('frameOffsetAfterPause', 1);
        }

        $('#nextbutton').prop('disabled', true);

        // Store which video actually gets played for convenience when analyzing data
        let video = this.get('video_parsed', {});
        if (video.source && video.source.length) {
            this.set('videoShown', video.source[0].src);
        } else {
            this.set('videoShown', '');
        }

        // Store which audio actually gets played for convenience when analyzing data
        let audio = this.get('audio_parsed', {});
        if (audio.source && audio.source.length) {
            this.set('audioPlayed', audio.source[0].src);
        } else {
            this.set('audioPlayed', '');
        }

        // Apply user-provided CSS to parent text block
        let hasParentText = Object.keys(this.get('parentTextBlock')).length;
        this.set('hasParentText', hasParentText);
        if (hasParentText) {
            var parentTextBlock = this.get('parentTextBlock') || {};
            var css = parentTextBlock.css || {};
            $('#parenttext').css(css);
        }
        this.set('maximizeVideoArea', this.get('autoProceed') && !hasParentText);

        // Apply user-provided CSS to video
        if (!video.position) {
            $('#test-video').css({
                'left': `${video.left}%`,
                'width': `${video.width}%`,
                'top': `${video.top}%`,
                'height': `${video.height}%`
            });
        }

        // Apply background color
        let colorSpec = this.get('backgroundColor');
        if (isColor(colorSpec)) {
            $('div.story-image-container, div#image-area, div.exp-lookit-video').css('background-color', this.get('backgroundColor'));
            // Set text color so it'll be visible (black or white depending on how dark background is). Use style
            // so this applies whenever pause text actually appears.
            let colorSpecRGBA = colorSpecToRgbaArray(colorSpec);
            $(`<style>div.exp-lookit-video p#waitForVideo, div.exp-lookit-video p.pause-instructions { color: ${textColorForBackground(colorSpecRGBA)}; }</style>`).appendTo('div.exp-lookit-video');
        } else {
            console.warn(`Invalid backgroundColor (${colorSpec}) provided; using default instead.`);
        }

        if (!this.get('doRecording') && !this.get('startSessionRecording') && !this.get('_isPaused')) {
            this.startVideo();
        }
    },

    willDestroyElement() { // remove event handler
        window.clearInterval(this.get('testTimer'));
        this._super(...arguments);
    },

    onRecordingStarted() {
        if (!this.get('_isPaused')) {
            if (this.checkFullscreen()) {
                this.startVideo();
            } else {
                this._pauseStudy();
            }
        }
    },

    onSessionRecordingStarted() {
        $('#waitForVideo').hide();
        if (!this.get('_isPaused')) {
            if (this.checkFullscreen()) {
                this.startVideo();
            } else {
                this._pauseStudy();
            }
        }
    }

});

export default ExpLookitVideo;
