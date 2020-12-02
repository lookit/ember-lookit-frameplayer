import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import PauseUnpause from "../../mixins/pause-unpause";
import { audioAssetOptions, videoAssetOptions, imageAssetOptions } from '../../mixins/expand-assets';
import isColor from '../../utils/is-color';
import { observer } from '@ember/object';

let {
    $
} = Ember;

// http://stackoverflow.com/a/12646864
function shuffleArrayInPlace(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/*
 *
 * Frame for a preferential looking "alternation" or "change detection" paradigm trial,
 * in which separate streams of images are displayed on the left and right of the screen.
 * Typically, on one side images would be alternating between two categories - e.g., images
 * of 8 vs. 16 dots, images of cats vs. dogs - and on the other side the images would all
 * be in the same category.
 */

export default ExpFrameBaseComponent.extend(VideoRecord, PauseUnpause, ExpandAssets, {

    type: 'exp-lookit-change-detection',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component

    // Track state of experiment
    completedAudio: false,
    completedAttn: false,
    currentSegment: 'intro', // 'test' (mutually exclusive)
    alreadyStartedCalibration: false,

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    recordingStarted: false,

    imageIndexA: 0,
    imageIndexB: 0,
    doingA: false,
    musicFadeLength: 2000,

    assetsToExpand: {
        'audio': [
            'audioSources',
            'musicSources',
            'endAudioSources',
            'pauseAudio',
            'unpauseAudio',
            'fsAudio'
        ],
        'video': [
            'videoSources'
        ],
        'image': [
            'leftImagesA',
            'rightImagesA',
            'leftImagesB',
            'rightImagesB'
        ]
    },

    readyToStartCalibration: Ember.computed('recordingStarted', 'completedAudio', 'completedAttn', 'image_loaded_count',
        function() {
            var recordingStarted = false;
            if (this.get('session').get('recorder')) {
                recordingStarted = this.get('session').get('recorder').get('recording');
            } else {
                recordingStarted = this.get('recordingStarted');
            }
            var nImages = this.get('leftImagesA_parsed').length + this.get('leftImagesB_parsed').length +
                this.get('rightImagesA_parsed').length + this.get('rightImagesB_parsed').length;

            return ((recordingStarted || !this.get('doRecording')) && this.get('completedAudio') && this.get('completedAttn') && this.get('image_loaded_count') >= nImages && !this.get('_isPaused'));
        }),

    doingIntro: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'intro');
    }),

    // Timers for intro & stimuli
    introTimer: null, // minimum length of intro segment
    stimTimer: null,

    frameSchemaProperties: {
        doRecording: {
            type: 'boolean',
            description: 'Whether to do webcam recording',
            default: true
        },
        attnLength: {
            type: 'number',
            description: 'minimum amount of time to show attention-getter in seconds',
            default: 0
        },
        trialLength: {
            type: 'number',
            description: 'length of alternation trial in seconds',
            default: 60
        },
        audioSources: {
            oneOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for instructions during attention-getter video',
            default: []
        },
        musicSources: {
            oneOf: audioAssetOptions,
            description: 'List of objects specifying audio src and type for music during trial',
            default: []
        },
        endAudioSources: {
            oneOf: audioAssetOptions,
            description: 'Supply this to play audio at the end of the trial; list of objects specifying audio src and type',
            default: []
        },
        videoSources: {
            oneOf: videoAssetOptions,
            description: 'List of objects specifying video src and type for attention-getter video',
            default: []
        },
        startWithA: {
            type: 'boolean',
            description: 'Whether to start with image list A',
            default: true
        },
        randomizeImageOrder: {
            type: 'boolean',
            description: 'Whether to randomize image presentation order within lists',
            default: true
        },
        displayMs: {
            type: 'number',
            description: 'Amount of time to display each image, in milliseconds',
            default: 500
        },
        blankMs: {
            type: 'number',
            description: 'Amount of time for blank display between each image, in milliseconds',
            default: 250
        },
        border: {
            type: 'string',
            description: 'Amount of time for blank display between each image, in milliseconds',
            default: 'thin solid gray'
        },
        backgroundColor: {
            type: 'string',
            description: 'Color of background',
            default: 'white'
        },
        containerColor: {
            type: 'string',
            description: 'Color of image stream container',
            default: 'white'
        },
        leftImagesA: {
            type: 'array',
            description: 'Set A of images to display on left of screen',
            default: [],
            items: {
                oneOf: imageAssetOptions
            }
        },
        leftImagesB: {
            type: 'array',
            description: 'Set B of images to display on left of screen',
            default: [],
            items: {
                oneOf: imageAssetOptions
            }
        },
        rightImagesA: {
            type: 'array',
            description: 'Set A of images to display on right of screen',
            default: [],
            items: {
                oneOf: imageAssetOptions
            }
        },
        rightImagesB: {
            type: 'array',
            description: 'Set B of images to display on right of screen',
            default: [],
            items: {
                oneOf: imageAssetOptions
            }
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {
                /**
                * Sequence of images shown on the left
                * @attribute leftSequence
                */
                leftSequence: {
                    type: 'Object'
                },
                /**
                * Sequence of images shown on the right
                * @attribute rightSequence
                */
                rightSequence: {
                    type: 'Object'
                },
                videoId: {
                    type: 'string'
                },
                /**
                * Whether this trial was paused
                * @attribute hasBeenPaused
                */
                hasBeenPaused: {
                    type: 'boolean'
                }
            }
        }
    },

    calObserver: observer('readyToStartCalibration', function(frame) {
        if (frame.get('readyToStartCalibration') && frame.get('currentSegment') === 'intro' && !this.get('_isPaused')) {
            frame.set('currentSegment', 'test');
        }
    }),

    segmentObserver: observer('currentSegment', function(frame) {
        // Don't trigger starting intro; that'll be done manually.
        if (frame.get('currentSegment') === 'test' && !this.get('_isPaused')) {
            frame.startTrial();
        }
    }),

    didRender() {
        this._super(...arguments);
        if (this.get('doingCalibration') && !this.get('alreadyStartedCalibration')) {
            this.set('alreadyStartedCalibration', true);
            this.startCalibration();
        }
    },

    actions: {
        // When intro audio is complete
        endAudio() {
            this.set('completedAudio', true);
            this.notifyPropertyChange('readyToStartCalibration');
        },

        finish() {

            // Call this something separate from next because stopRecorder promise needs
            // to call next AFTER recording is stopped and we don't want this to have
            // already been destroyed at that point.
            /**
             * Just before stopping webcam video capture
             *
             * @event stoppingCapture
            */
            this.disablePausing();
            var _this = this;
            this.stopRecorder().then(() => {
                _this.set('stoppedRecording', true);
                _this.send('next');
                return;
            }, () => {
                _this.send('next');
                return;
            });

            this._super(...arguments);
        }

    },

    startIntro() {
        var _this = this;

        // Start placeholder video right away
        /**
         * Immediately before starting intro/announcement segment
         *
         * @event startIntro
         */
        this.send('setTimeEvent', 'startIntro');
        if (this.get('attnLength')) {
            $('#player-video')[0].play();
            // Set a timer for the minimum length for the intro/break
            $('#player-audio')[0].play();
            this.set('introTimer', window.setTimeout(function() {
                _this.set('completedAttn', true);
                _this.notifyPropertyChange('readyToStartCalibration');
            }, _this.get('attnLength') * 1000));
        } else {
            _this.set('completedAttn', true);
            _this.set('completedAudio', true);
            _this.notifyPropertyChange('readyToStartCalibration');
        }
    },

    startTrial() {

        var _this = this;
        /**
         * Immediately before starting test trial segment
         *
         * @event startTestTrial
         */
        this.send('setTimeEvent', 'startTestTrial');
        let paused = this.enablePausing(true); // Now that we should definitely be in FS mode, check!

        if (!paused) {
            // Begin playing music; fade in and set to fade out at end of trial
            var $musicPlayer = $('#player-music');
            $musicPlayer.prop('volume', 0.1);
            $musicPlayer[0].play();
            $musicPlayer.animate({volume: 1}, this.get('musicFadeLength'));
            this.set('musicFadeTimer', window.setTimeout(function () {
                $musicPlayer.animate({volume: 0}, _this.get('musicFadeLength'));
            }, _this.get('trialLength') * 1000 - _this.get('musicFadeLength')));

            // Start presenting triangles and set to stop after trial length
            $('#allstimuli').show();
            this.presentImages();
            this.set('trialTimer', window.setTimeout(function () {
                window.clearTimeout(_this.get('stimTimer'));
                _this.clearImages();
                _this.endTrial();
            }, _this.get('trialLength') * 1000));
        }
    },

    // When triangles have been shown for time indicated: play end-audio if
    // present, or just move on.
    endTrial() {
        this.stopRecorder();
        if (this.get('endAudioSources').length) {
            $('#player-endaudio')[0].play();
        } else {
            this.send('finish');
        }
    },

    clearImages() {
        /**
         * Records each time images are cleared from display
         *
         * @event clearImages
        */
        this.send('setTimeEvent', 'clearImages');
        $('.stream-container').html('');
    },

    presentImages() {
        if (!this.get('_isPaused')) {
            var A = this.get('doingA');
            var leftImageList = A ? this.get('leftImagesA_parsed') : this.get('leftImagesB_parsed');
            var rightImageList = A ? this.get('rightImagesA_parsed') : this.get('rightImagesB_parsed');
            var imageIndex = A ? this.get('imageIndexA') : this.get('imageIndexB');

            var leftImageIndex = imageIndex % leftImageList.length;
            var rightImageIndex = imageIndex % rightImageList.length;

            if (leftImageIndex == 0 && this.get('randomizeImageOrder')) {
                shuffleArrayInPlace(leftImageList);
            }
            if (rightImageIndex == 0 && this.get('randomizeImageOrder')) {
                shuffleArrayInPlace(rightImageList);
            }
            if (A) {
                this.set('imageIndexA', this.get('imageIndexA') + 1);
            } else {
                this.set('imageIndexB', this.get('imageIndexB') + 1);
            }
            this.set('doingA', !this.get('doingA'));
            var _this = this;
            _this.clearImages();
            _this.set('stimTimer', window.setTimeout(function () {
                $('#left-stream-container').html(`<img src=${leftImageList[leftImageIndex]} class="stim-image" alt="left image">`);
                $('#right-stream-container').html(`<img src=${rightImageList[rightImageIndex]} class="stim-image" alt="right image">`);
                /**
                 * Immediately after making images visible
                 *
                 * @event presentImages
                 * @param {String} left url of left image
                 * @param {String} right url of right image
                 */
                _this.send('setTimeEvent', 'presentImages', {
                    left: leftImageList[leftImageIndex],
                    right: rightImageList[rightImageIndex]
                });
                _this.set('stimTimer', window.setTimeout(function () {
                    _this.presentImages();
                }, _this.get('displayMs')));
            }, _this.get('blankMs')));
        }
    },

    onStudyPause() {
        window.clearTimeout(this.get('introTimer'));
        window.clearTimeout(this.get('stimTimer'));
        window.clearTimeout(this.get('trialTimer'));
        window.clearTimeout(this.get('musicFadeTimer'));
        this.set('currentSegment', 'intro');
        this.set('completedAudio', false);
        this.set('completedAttn', false);
        $('#alternation-container').hide();
        $('audio#player-audio, audio#player-music').each(function() {
            this.pause();
        });

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


    image_loaded_count: 0,

    didInsertElement() {
        this._super(...arguments);
        this.set('doingA', this.get('startWithA'));
        this.notifyPropertyChange('readyToStartCalibration');
        var _this = this;

        $.each([this.get('leftImagesA_parsed'), this.get('leftImagesB_parsed'), this.get('rightImagesA_parsed'), this.get('rightImagesB_parsed')],
            function(idx, imgList) {
                $.each(imgList, function(idx, url) {
                    var img = new Image();
                    img.onload = function() { // set onload fn before source to ensure we catch it
                        _this.set('image_loaded_count', _this.get('image_loaded_count') + 1);
                        _this.notifyPropertyChange('readyToStartCalibration');
                    };
                    img.onerror = function() {
                        _this.set('image_loaded_count', _this.get('image_loaded_count') + 1);
                        _this.notifyPropertyChange('readyToStartCalibration');
                        console.error('Unable to load image at ', url, ' - will skip loading but this may cause the exp-lookit-change-detection frame to fail');
                    };
                    img.src = url;
                });
            });

        if (this.get('border').includes(';')) {
            console.warn('Invalid border css provided to exp-lookit-change-detection; not applying.');
        } else {
            $('#allstimuli div.stream-container').css('border', this.get('border'));
        }

        if (isColor(this.get('backgroundColor'))) {
            $('div.exp-lookit-change-detection').css('background-color', this.get('backgroundColor'));
        } else {
            console.warn('Invalid background color provided to exp-lookit-change-detection; not applying.');
        }

        if (isColor(this.get('containerColor'))) {
            $('div.exp-lookit-change-detection div.stream-container').css('background-color', this.get('containerColor'));
        } else {
            console.warn('Invalid container color provided to exp-lookit-change-detection; not applying.');
        }

        $('#allstimuli').hide();
        this.startIntro();
        this.enablePausing(false); // Don't do a FS check at this point because we may be *entering* fullscreen.
    },

    willDestroyElement() { // remove event handler
        window.clearInterval(this.get('introTimer'));
        window.clearInterval(this.get('stimTimer'));
        this._super(...arguments);
    },

    /**
     * What to do when individual-frame recording starts.
     * @method onRecordingStarted
     * @private
     */
    onRecordingStarted() {
        this.set('recordingStarted', true);
        this.notifyPropertyChange('readyToStartCalibration');
    },

    /**
     * What to do when session-level recording starts.
     * @method onSessionRecordingStarted
     * @private
     */
    onSessionRecordingStarted() {
        this.set('recordingStarted', true);
        this.notifyPropertyChange('readyToStartCalibration');
    }

});
