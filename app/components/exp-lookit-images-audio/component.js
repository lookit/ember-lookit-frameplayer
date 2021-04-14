import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import PauseUnpause from '../../mixins/pause-unpause';
import ExpandAssets from '../../mixins/expand-assets';
import { audioAssetOptions, imageAssetOptions } from '../../mixins/expand-assets';
import isColor from '../../utils/is-color';

let {
    $
} = Ember;

/**
 * Frame to display image(s) and play audio, with optional video recording. Options allow
 * customization for looking time, storybook, forced choice, and reaction time type trials,
 * including training versions where children (or parents) get feedback about their responses.
 */

export default ExpFrameBaseComponent.extend(VideoRecord, PauseUnpause, ExpandAssets, {

    type: 'exp-lookit-images-audio',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component

    startedTrial: false, // whether we've started playing audio yet
    _finishing: false, // whether we're currently trying to move to next trial (to prevent overlapping calls)

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    startRecordingAutomatically: Ember.computed.alias('doRecording'),

    pageTimer: null,
    progressTimer: null,
    nextButtonDisableTimer: null,
    showChoiceTimer: null,
    imageDisplayTimers: null,

    autoProceed: false,
    finishedAllAudio: false,
    minDurationAchieved: false,

    choiceRequired: false,
    choiceAllowed: false,
    correctChoiceRequired: false,
    correctImageSelected: false,
    canMakeChoice: true,
    showingFeedbackDialog: false,
    selectedImage: null,

    pauseWhenExitingFullscreen: false, // pause-unpause mixin

    audioPlayed: null,

    noParentText: false,

    assetsToExpand: {
        'audio': ['audio', 'images/feedbackAudio'],
        'video': [],
        'image': ['images/src']
    },

    frameSchemaProperties: {
        doRecording: {
            type: 'boolean',
            description: 'Whether to do webcam recording (will wait for webcam connection before starting audio if so)'
        },
        autoProceed: {
            type: 'boolean',
            description: 'Whether to proceed automatically after audio (and hide replay/next buttons)',
            default: false
        },
        durationSeconds: {
            type: 'number',
            description: 'Minimum duration of frame in seconds',
            minimum: 0,
            default: 0
        },
        showProgressBar: {
            type: 'boolean',
            description: 'Whether to show a progress bar based on durationSeconds',
            default: false
        },
        showPreviousButton: {
            type: 'boolean',
            default: true,
            description: 'Whether to show a previous button (used only if showing Next button)'
        },
        showReplayButton: {
            type: 'boolean',
            default: true,
            description: 'Whether to show a replay button (used only if showing Next button)'
        },
        maximizeDisplay: {
            type: 'boolean',
            default: false,
            description: 'Whether to have the image display area take up the whole screen if possible'
        },
        audio: {
            anyOf: audioAssetOptions,
            description: 'Audio to play as this frame begins',
            default: []
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
        },
        images: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    'id': {
                        type: 'string'
                    },
                    'src': {
                        anyOf: imageAssetOptions
                    },
                    'alt': {
                        type: 'string'
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
                        enum: ['left', 'center', 'right', 'fill']
                    },
                    'nonChoiceOption': {
                        type: 'boolean'
                    },
                    'displayDelayMs': {
                        type: 'number',
                        minimum: 0
                    },
                    'correct': {
                        type: 'boolean'
                    },
                    'feedbackAudio': {
                        anyOf: audioAssetOptions
                    },
                    'feedbackText': {
                        type: 'string'
                    }
                }
            }
        },
        backgroundColor: {
            type: 'string',
            description: 'Color of background',
            default: 'black'
        },
        pageColor: {
            type: 'string',
            description: 'Color of image area if different from background',
            default: 'white'
        },

        choiceRequired: {
            type: 'boolean',
            description: 'Whether the user needs to click to select one of the images before proceeding',
            default: false
        },
        choiceAllowed: {
            type: 'boolean',
            description: 'Whether the user CAN select any of the images',
            default: false
        },
        correctChoiceRequired: {
            type: 'boolean',
            description: 'Whether this is a frame where the user needs to click a correct image before proceeding',
            default: false
        },
        canMakeChoiceBeforeAudioFinished: {
            type: 'boolean',
            description: 'Whether the participant can select an option before audio finishes',
            default: false
        },
        highlights: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    'range': {
                        type: 'array',
                        items: {
                            type: 'number',
                            minimum: 0
                        }
                    },
                    'imageId': {
                        'type': 'string'
                    }
                }
            },
            default: []
        }
    },

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
                /**
                * Array of images used in this frame [same as passed to this frame, but
                * may reflect random assignment for this particular participant]
                * @attribute {Array} images
                */
                images: {
                    type: 'array'
                },
                /**
                * ID of image selected at time of proceeding
                * @attribute {String} selectedImage
                */
                selectedImage: {
                    type: 'string'
                },
                /**
                * Whether image selected at time of proceeding is marked as correct
                * @attribute {Boolean} correctImageSelected
                */
                correctImageSelected: {
                    type: 'Boolean'
                },
                /**
                * Source URL of audio played, if any. If multiple sources provided (e.g.
                * mp4 and ogg versions) just the first is stored.
                * @attribute {String} audioPlayed
                */
                audioPlayed: {
                    type: 'string'
                }
            },
        }
    },

    // Override to do a bit extra when starting recording
    onRecordingStarted() {
        this.startTrial();
    },

    // Override to do a bit extra when starting session recorder
    onSessionRecordingStarted() {
        this.startTrial();
        $('#waitForVideo').hide();
    },

    updateCharacterHighlighting() {

        var highlights = this.get('highlights');

        if (highlights.length) {
            var t = $('#player-audio')[0].currentTime;
            $('.story-image-container img.story-image').removeClass('narration-highlight');
            // var _this = this;
            highlights.forEach(function (h) {
                if (t > h.range[0] && t < h.range[1]) {
                    var $element = $('#' + h.imageId + ' img.story-image')
                    $element.addClass('narration-highlight');
                    // _this.wiggle($element);
                }
            });
        }
    },

    // Move an image up and down until the isSpeaking class is removed.
    // Yes, this could much more naturally be done by using a CSS animation property
    // on isSpeaking, but despite animations getting applied properly to the element,
    // I haven't been able to get that working - because of the possibility of ember-
    // specific problems here, I'm going with something that *works* even if it's less
    // elegent.
    //     wiggle($element) {
    //         var _this = this;
    //         var $parent = $element.parent();
    //         if ($element.hasClass('narration-highlight')) {
    //             $parent.animate({'margin-bottom': '.1%', 'margin-top': '-.1%'}, 150, function() {
    //                 if ($element.hasClass('narration-highlight')) {
    //                     $parent.animate({'margin-bottom': '0%', 'margin-top': '0%'}, 150, function() {
    //                         _this.wiggle($element);
    //                     });
    //                 }
    //             });
    //         }
    //     },

    replay() {
        // pause any current audio, and set times to 0
        $('audio').each(function() {
            this.pause();
            this.currentTime = 0;
        });
        /**
         * When main audio segment is replayed
         *
         * @event replayAudio
         */
        this.send('setTimeEvent', 'replayAudio');
        // restart audio
        $(`.story-image-container`).hide();
        this.showImages();
        this.playAudio();
    },

    finish() {
        this.disablePausing();
        if (!this.get('_finishing')) {
            this.set('_finishing', true);
            var _this = this;
            /**
             * Trial is complete and attempting to move to next frame; may wait for recording
             * to catch up before proceeding.
             *
             * @event trialComplete
             */
            this.send('setTimeEvent', 'trialComplete');
            if (this.get('doRecording')) {
                $('#nextbutton').text('Sending recording...');
                $('#nextbutton').prop('disabled', true);
                this.set('nextButtonDisableTimer', window.setTimeout(function () {
                    $('#nextbutton').prop('disabled', false);
                }, 5000));

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
    },

    finishedAudio() {
        /**
         * When main audio segment finishes playing
         *
         * @event finishAudio
         */
        this.send('setTimeEvent', 'finishAudio');
        this.set('finishedAllAudio', true);
        this.set('canMakeChoice', true);
        this.checkAndEnableProceed();
    },

    checkAndEnableProceed() {
        let ready = this.get('minDurationAchieved') &&
                    this.get('finishedAllAudio') &&
                    !this.get('showingFeedbackDialog') &&
                    (!this.get('choiceRequired') || (this.get('selectedImage') && (this.get('correctImageSelected') || !this.get('correctChoiceRequired'))));
        if (ready) {
            this.readyToFinish();
        }
        return ready;
    },

    readyToFinish() {
        if (this.get('autoProceed')) {
            this.send('finish');
        } else {
            $('#nextbutton').prop('disabled', false);
        }
    },

    startTrial() {
        this.set('startedTrial', true);
        this.enablePausing(false);
        if (this.get('durationSeconds') && this.get('durationSeconds') > 0) {
            let _this = this;
            /**
            * Timer for set-duration trial begins
            *
            * @event startTimer
            */
            this.send('setTimeEvent', 'startTimer');
            this.set('pageTimer', window.setTimeout(function() {
                /**
                    * Timer for set-duration trial ends
                    *
                    * @event endTimer
                    */
                _this.send('setTimeEvent', 'endTimer');
                _this.set('minDurationAchieved', true);
                _this.checkAndEnableProceed();
            }, _this.get('durationSeconds') * 1000));
            if (this.get('showProgressBar')) {
                let timerStart = new Date().getTime();
                let durationSeconds = _this.get('durationSeconds');
                this.set('progressTimer', window.setInterval(function() {
                    let now = new Date().getTime();
                    var prctDone =  (now - timerStart) / (durationSeconds * 10);
                    $('.progress-bar').css('width', prctDone + '%');
                }, 100));
            }
        } else {
            this.set('minDurationAchieved', true);
        }

        this.playAudio();
        this.showImages();
    },

    playAudio() {
        // Start audio if there is any
        var _this = this;
        if ($('#player-audio source').length) {
            $('#player-audio')[0].play().then(() => {
                /**
                 * When main audio segment starts playing
                 *
                 * @event startAudio
                 */
                _this.send('setTimeEvent', 'startAudio');
            }, () => {
                /**
                 * When main audio cannot be started. In this case we treat it as if
                 * the audio was completed (for purposes of allowing participant to
                 * proceed)
                 *
                 * @event failedToStartAudio
                 */
                _this.send('setTimeEvent', 'failedToStartAudio');
                _this.finishedAudio();
            });
        } else { // Otherwise treat as if completed
            this.finishedAudio();
        }
    },

    showImages() {
        /**
         * When images are displayed to participant (for images without any delay added)
         *
         * @event displayAllImages
         */
        this.send('setTimeEvent', 'displayImages');
        var _this = this;
        $.each(this.get('images_parsed'), function(idx, image) {
            if (image.hasOwnProperty('displayDelayMs')) {
                var thisTimeout = window.setTimeout(function() {
                    /**
                     * When a specific image is shown at a delay.
                     *
                     * @event displayImage
                     * @param {String} imageId
                     */
                    _this.send('setTimeEvent', 'displayImage', {
                        imageId: image.id
                    });
                    $(`.story-image-container#${image.id}`).show();
                }, image.displayDelayMs);
                if (_this.get('imageDisplayTimers')) {
                    _this.get('imageDisplayTimers').push(thisTimeout);
                } else {
                    _this.set('imageDisplayTimers', [thisTimeout]);
                }
            } else {
                $(`.story-image-container#${image.id}`).show();
            }
        });
    },

    clickImage(imageId, nonChoiceOption, correct, feedbackText) {
        // If this is a choice frame and a valid choice and we're allowed to make a choice yet...
        if ((this.get('choiceRequired') || this.get('choiceAllowed')) && !nonChoiceOption && this.get('canMakeChoice') && !this.get('showingFeedbackDialog')) {
            this.set('finishedAllAudio', true); // Treat as if audio is finished in case making choice before audio finishes - otherwise we never satisfy that criterion
            /**
             * When one of the image options is clicked during a choice frame
             *
             * @event clickImage
             * @param {String} imageId ID of the image selected
             * @param {Boolean} correct whether this image is marked as correct
             */
            this.send('setTimeEvent', 'clickImage', {
                imageId: imageId,
                correct: correct
            });

            // Highlight the selected image and store it
            $('.story-image-container img').removeClass('highlight');
            $('#' + imageId + ' img').addClass('highlight');
            this.set('selectedImage', imageId);
            this.set('correctImageSelected', correct);

            if (this.get('correctChoiceRequired') && !correct) {
                $('#nextbutton').prop('disabled', true);
            }

            var noFeedback = true; // Track whether we're giving some form of feedback
            // vs. allowing immediate proceeding

            var _this = this;
            // Play any feedback audio if available
            if ($(`#${imageId}.story-image-container audio source`).length) {
                noFeedback = false;
                // If there's audio associated with this choice,
                $('audio').each(function() { // pause any other audio
                    this.pause();
                    this.currentTime = 0;
                });
                $(`#${imageId}.story-image-container audio`)[0].play().then(() => {
                    /**
                     * When image/feedback audio is started
                     *
                     * @event startImageAudio
                     * @param {String} imageId
                     */
                    _this.send('setTimeEvent', 'startImageAudio', {
                        imageId: imageId
                    });
                }, () => {
                    /**
                     * When image/feedback audio cannot be started. In this case we treat it as if
                     * the audio was completed (for purposes of allowing participant to
                     * proceed)
                     *
                     * @event failedToStartImageAudio
                     * @param {String} imageId
                     */
                    _this.send('setTimeEvent', 'failedToStartImageAudio', {
                        imageId: imageId
                    });
                    _this.endFeedbackAudio(imageId, correct);
                });
            }

            // Also display any feedback text if available
            if (feedbackText) {
                noFeedback = false;
                this.set('showingFeedbackDialog', true);
                $(`.${imageId}.modal`).show();
            }

            // If we're giving feedback (audio or text), it will be possible to proceed
            // once any audio finishes and any text is dismissed. Otherwise, just ensure
            // that if we're moving on, the answer gets highlighted long enough for
            // the participant to see it!
            if (noFeedback) {
                this.set('showChoiceTimer', window.setTimeout(function() {
                    window.clearInterval(_this.get('showChoiceTimer'));
                    _this.checkAndEnableProceed();
                }, 150));
            }

        }
    },

    endFeedbackAudio(imageId, correct) {  // eslint-disable-line no-unused-vars
        this.checkAndEnableProceed(); // if correct, move on
    },

    actions: {

        // During playing audio
        updateCharacterHighlighting() {
            this.updateCharacterHighlighting();
        },

        replay() {
            this.replay();
        },

        finish() {
            this.finish();
        },

        finishedAudio() {
            this.finishedAudio();
        },

        clickImage(imageId, nonChoiceOption, correct, feedbackText) {
            this.clickImage(imageId, nonChoiceOption, correct, feedbackText);
        },

        endFeedbackAudio(imageId, correct) {
            this.endFeedbackAudio(imageId, correct);
        },

        hideFeedbackDialog(imageId) {
            $(`.${imageId}.modal`).hide();
            this.set('showingFeedbackDialog', false);
            /**
             * When the participant dismisses a feedback dialogue
             *
             * @event dismissFeedback
             * @param {String} imageId
             */
            this.send('setTimeEvent', 'dismissFeedback', {
                imageId: imageId
            });
            this.checkAndEnableProceed();
        }
    },

    // Supply image IDs if they're missing.
    didReceiveAttrs() {
        this._super(...arguments);
        var N = 1;
        var allImageIds =  this.get('images') ? this.get('images').map(im => im.hasOwnProperty('id') ? im.id : null) : [];
        $.each(this.get('images'), function(idx, image) {
            if (!image.hasOwnProperty('id')) {
                while (allImageIds.includes(`image_${N}`)) {
                    N++;
                }
                image.id = `image_${N}`;
            }
            N++;
        });

        this.set('canMakeChoice', !!this.get('canMakeChoiceBeforeAudioFinished'));
        this.set('minDurationAchieved', !(this.get('durationSeconds') > 0));
        this.set('showProgressBar', this.get('showProgressBar') && this.get('durationSeconds') > 0);
        this.set('showReplayButton', this.get('showReplayButton') && this.get('audio').length);

        // Store audio source
        let audioSources = this.get('audio_parsed');
        if (audioSources && audioSources.length) {
            this.set('audioPlayed', audioSources[0].src);
        }
    },

    didInsertElement() {

        this._super(...arguments);

        // Apply user-provided CSS to parent text block
        if (Object.keys(this.get('parentTextBlock')).length) {
            var parentTextBlock = this.get('parentTextBlock') || {};
            var css = parentTextBlock.css || {};
            $('#parenttext').css(css);
        } else {
            this.set('noParentText', true);
            if (this.get('autoProceed')) {
                this.set('noStoryControls', true);
            }
        }

        // Apply user-provided CSS to images
        $.each(this.get('images_parsed'), function(idx, image) {
            if (!image.position) {
                $('#' + image.id).css({'left': `${image.left}%`, 'width': `${image.width}%`, 'top': `${image.top}%`, 'height': `${image.height}%`});
            }
        });

        // Apply background colors
        if (isColor(this.get('backgroundColor'))) {
            $('div.exp-lookit-image-audio').css('background-color', this.get('backgroundColor'));
        } else {
            console.warn('Invalid background color provided; not applying.');
        }

        if (isColor(this.get('pageColor'))) {
            $('div.exp-lookit-image-audio div#image-area').css('background-color', this.get('pageColor'));
        } else {
            console.warn('Invalid page color provided; not applying.');
        }

        $('#nextbutton').prop('disabled', true);

        // Begin trial!
        this.checkAndEnableProceed();
    },

    onStudyPause() {
        window.clearInterval(this.get('pageTimer'));
        window.clearInterval(this.get('progressTimer'));
        window.clearInterval(this.get('nextButtonDisableTimer'));
        window.clearInterval(this.get('showChoiceTimer'));
        $.each(this.get('imageDisplayTimers'), function(idx, timeout) {
            window.clearInterval(timeout);
        });

        $('.exp-lookit-image-audio').hide();
        $('audio.player-audio').each(function() {
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

    // Once rendered, hide images and (if not recording) begin trial
    didRender() {
        if (!this.get('startedTrial')) { // don't re-hide/re-start upon e.g. rerender
            $('.story-image-container').hide();
            // If recording, trial will be started upon recording start. Otherwise...
            if (!this.get('doRecording') && !this.get('startSessionRecording')) {
                this.startTrial();
            }
        }
    },

    willDestroyElement() {
        // Clear any timers that might be active
        window.clearInterval(this.get('pageTimer'));
        window.clearInterval(this.get('progressTimer'));
        window.clearInterval(this.get('nextButtonDisableTimer'));
        window.clearInterval(this.get('showChoiceTimer'));
        $.each(this.get('imageDisplayTimers'), function(idx, timeout) {
            window.clearInterval(timeout);
        });

        this._super(...arguments);
    },


});
