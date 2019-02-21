import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { observer } from '@ember/object';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
* Basic video display for looking measures (e.g. preferential looking, looking time).
* Trial consists of four phases, each of which is optional.
*
* 1. Announcement: The audio in announcementAudio is played while the announcementVideo
* video is played centrally, looping as needed. This lasts for announcementLength seconds
* or the duration of the audio, whichever is longer. To skip this phase, set
* announcementLength to 0 and do not provide announcementAudio.
*
* 2. Intro: The introVideo video is played centrally until it ends. To skip this phase,
* do not provide introVideo.
*
* 3. Calibration: The video in calibrationVideo is played (looping as needed) in each of
* the locations specified in calibrationPositions in turn, remaining in each position for
* calibrationLength ms. At the start of each position the audio in calibrationAudio is
* played once. (Audio will be paused and restarted if it is longer than calibrationLength.)
* Set calibrationLength to 0 to skip calibration.
*
* 4. Test: The video in testVideo and audio in testAudio (optional) are played until
* either: testLength seconds have elapsed (with video looping if needed), or the video
* has been played testCount times. If testLength is set, it overrides testCount - for
* example if testCount is 1 and testLength is 30, a 10-second video will be played 3 times.
* If the participant pauses the study during the test phase, then after restarting the
* trial, the video in altTestVideo will be used again (defaulting to the same video if
* altTestVideo is not provided).
*
* Specifying media locations:
* For any parameters that expect a list of audio/video sources, you can EITHER provide
* a list of src/type pairs with full paths like this:
```json
    [
        {
            'src': 'http://.../video1.mp4',
            'type': 'video/mp4'
        },
        {
            'src': 'http://.../video1.webm',
            'type': 'video/webm'
        }
    ]
```
* OR you can provide a string 'stub', which will be expanded
* based on the parameter baseDir. Expected audio/video locations will be based on either audioTypes or
* videoTypes as appropriate; images will be expected to all be in an img/ subdirectory.
* For example, if you provide the audio source `intro`,
* and baseDir is `https://mystimuli.org/mystudy/`, with audioTypes `['mp3', 'ogg']`, then this
* will be expanded to:
```json
                 [
                        {
                            src: 'https://mystimuli.org/mystudy/mp3/intro.mp3',
                            type: 'audio/mp3'
                        },
                        {
                            src: 'https://mystimuli.org/mystudy/ogg/intro.ogg',
                            type: 'audio/ogg'
                        }
                ]
```
* This allows you to simplify your JSON document a bit and also easily switch to a
* new version of your stimuli without changing every URL. You can mix source objects with
* full URLs and those using stubs within the same directory. However, any stimuli
* specified using stubs MUST be
* organized as expected under `baseDir/MEDIATYPE/filename.MEDIATYPE`.
*
* This frame is displayed fullscreen; if the frame before it is not, that frame
* needs to include a manual "next" button so that there's a user interaction
* event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
* without a user event.)
*
* Example usage:

```json
    "sample-trial": {
        "kind": "exp-lookit-preferential-looking",
        "isLast": false,
        "baseDir": "https://s3.amazonaws.com/lookitcontents/labelsconcepts/",
        "leftImage": "stapler_test_02.jpg",
        "testLength": 8,
        "audioTypes": [
            "ogg",
            "mp3"
        ],
        "pauseAudio": "pause",
        "rightImage": "novel_02.jpg",
        "videoTypes": [
            "webm",
            "mp4"
        ],
        "announcementVideo": "attentiongrabber",
        "announcementAudio": "video_02",
        "introVideo": "cropped_book",
        "testAudio": "400Hz_tones",
        "unpauseAudio": "return_after_pause",
        "calibrationLength": 0,
        "calibrationAudio": "chimes",
        "calibrationVideo": "attentiongrabber",
        "loopTestAudio": false
    }
* ```
*
* @class ExpLookitPreferentialLooking
* @extends ExpFrameBase
* @uses FullScreen
* @uses MediaReload
* @uses VideoRecord
* @uses ExpandAssets
*/

// TODO: refactor into cleaner structure with segments announcement, intro, calibration,
// test, with more general logic for transitions. Construct list at start since some
// elements optional. Then proceed through - instead of setting task manually, use
// utility to move to next task within list. For each segment, allow video/image/text
// stimuli.

export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, VideoRecord, ExpandAssets, {
    layout: layout,
    type: 'exp-lookit-preferential-looking',

    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),

    assetsToExpand: {
        'audio': [
            'announcementAudio',
            'testAudio',
            'calibrationAudio',
            'pauseAudio',
            'unpauseAudio'
        ],
        'video': [
            'testVideo',
            'altTestVideo',
            'introVideo',
            'announcementVideo',
            'calibrationVideo'
        ],
        'image': [
            'leftImage',
            'rightImage',
            'centerImage'
        ]
    },

    completedAnnouncementAudio: false,
    completedAnnouncementTime: false,

    doingAnnouncement: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'announce');
    }),

    doingIntro: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'intro');
    }),

    doingTest: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'test');
    }),
    testTimer: null, // reference to timer counting how long video has been playing, if time-based limit
    calTimer: null, // reference to timer counting how long calibration segment has played
    announceTimer: null, // reference to timer counting announcement segment

    testTime: 0,
    testVideosTimesPlayed: 0, // how many times the test video has been played, if count-based limit

    skip: false,
    hasBeenPaused: false,
    useAlternate: false,
    currentTask: null, // announce, intro, calibration, or test.
    isPaused: false,

    meta: {
        name: 'ExpLookitPreferentialLooking',
        description: 'Component that displays video or images for looking measurements',
        parameters: {
            type: 'object',
            properties: {
                /**
                Array of objects specifying video src and type for test video (these should be the same video, but multiple sources--e.g. mp4 and webm--are generally needed for cross-browser support). If none provided, skip test phase.

                Example value:

                ```[{'src': 'http://.../video1.mp4', 'type': 'video/mp4'}, {'src': 'http://.../video1.webm', 'type': 'video/webm'}]```
                @property {Array} testVideo
                    @param {String} src
                    @param {String} type
                @default []
                */
                testVideo: {
                    type: 'string',
                    description: 'List of objects specifying video src and type for test videos',
                    default: []
                },

                /**
                Array of objects specifying video src and type for alternate test video, as for testVideo. Alternate test video will be shown if the first test is paused, after restarting the trial. If alternate test video is also paused, we just move on. If altTestVideo is not provided, defaults to playing same test video again (but still only one pause of test video allowed per trial).
                @property {Array} altTestVideo
                    @param {String} src
                    @param {String} type
                @default []
                */
                altTestVideo: {
                    type: 'string',
                    description: 'List of objects specifying video src and type for alternate test videos',
                    default: []
                },

                /**
                Array of objects specifying intro video src and type, as for testVideo.
                If empty, intro segment will be skipped.
                @property {Array} introVideo
                    @param {String} src
                    @param {String} type
                @default []
                */
                introVideo: {
                    type: 'string',
                    description: 'List of objects specifying intro video src and type',
                    default: []
                },

                /**
                Array of objects specifying attention-grabber video src and type, as for testVideo. The attention-grabber video is shown (looping) during the announcement phase and when the study is paused.
                @property {Array} announcementVideo
                    @param {String} src
                    @param {String} type
                @default []
                */
                announcementVideo: {
                    type: 'string',
                    description: 'List of objects specifying attention-grabber video src and type',
                    default: []
                },
                /**
                 * minimum amount of time to show attention-getter in seconds. Announcement phase (attention-getter plus audio) will last the minimum of announcementLength and the duration of any announcement audio.
                 *
                 * @property {Number} announcementLength
                 * @default 2
                 */
                announcementLength: {
                    type: 'number',
                    description: 'minimum duration of announcement phase in seconds',
                    default: 2
                },
                /**
                List of objects specifying intro announcement src and type. If empty and minimum announcementLength is 0, announcement is skipped.
                Example: `[{'src': 'http://.../audio1.mp3', 'type': 'audio/mp3'}, {'src': 'http://.../audio1.ogg', 'type': 'audio/ogg'}]`
                @property {Array} announcementAudio
                    @param {String} src
                    @param {String} type
                @default []
                */
                announcementAudio: {
                    type: 'string',
                    description: 'List of objects specifying intro announcement audio src and type',
                    default: []
                },

                /**
                 * URL of image to show on left, if any. Can be a full URL or a
                 * stub that will be appended to `baseDir` + `img/` (see
                 * baseDir).
                 *
                 * @property {String} leftImage
                 */
                leftImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
                },
                /**
                 * URL of image to show on right, if any. Can be a full URL or a
                 * stub that will be appended to `baseDir` + `img/` (see
                 * baseDir).
                 *
                 * @property {String} right
                 */
                rightImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
                },
                /**
                 * URL of image to show at center, if any. Can be a full URL or
                 * a stub that will be appended to `baseDir` + `img/` (see
                 * baseDir).
                 *
                 * @property {String} centerImage
                 */
                centerImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
                },

                /**
                List of objects specifying test audio src and type, as for announcementAudio.
                If empty, no additional test audio is played besides any audio in testVideo.
                @param testAudio
                @property {Array} testAudio
                    @param {String} src
                    @param {String} type
                @default []
                */
                testAudio: {
                    type: 'string',
                    description: 'List of objects specifying music audio src and type',
                    default: []
                },

                /**
                Whether test audio should loop
                @property {boolean} loopTestAudio
                @default true
                */
                loopTestAudio: {
                    type: 'boolean',
                    description: 'Whether test audio should loop',
                    default: true
                },

                /**
                Whether to allow participant to pause study during test. If no, study still
                pauses but upon unpausing moves to next trial. If yes, study restarts from
                beginning upon unpausing (with alternate sources).
                @property {boolean} allowPauseDuringTest
                @default true
                */
                allowPauseDuringTest: {
                    type: 'boolean',
                    description: 'Whether to allow participant to pause study during test',
                    default: true
                },

                /**
                Length to loop test videos, in seconds. Set if you want a time-based limit. E.g., setting testLength to 20 means that the first 20 seconds of the video will be played, with shorter videos looping until they get to 20s. Leave out or set to Infinity  to play the video through to the end a set number of times instead. If a testLength is set, it overrides any value set in testCount.
                @property {Number} testLength
                @default Infinity
                */
                testLength: {
                    type: 'number',
                    description: 'Length of test videos in seconds',
                    default: Infinity
                },

                /**
                Number of times to play test video before moving on. This is ignored if
                testLength is set to a finite value.
                @property {Number} testCount
                @default 1
                */
                testCount: {
                    type: 'number',
                    description: 'Number of times to play test video',
                    default: 1
                },

                /**
                Whether to do any video recording during this frame. Default true. Set to false for e.g. last frame where just doing an announcement.
                @property {Boolean} doRecording
                @default true
                */
                doRecording: {
                    type: 'boolean',
                    description: 'Whether to do video recording',
                    default: true
                },
                /**
                 * length of single calibration segment in ms. 0 to skip calibration.
                 *
                 * @property {Number} calibrationLength
                 * @default 3000
                 */
                calibrationLength: {
                    type: 'number',
                    description: 'length of single calibration segment in ms',
                    default: 3000
                },
                /**
                 * Ordered list of positions to show calibration segment in. Options are
                 * "center", "left", "right". Ignored if calibrationLength is 0.
                 *
                 * @property {Array} calibrationPositions
                 * @default ["center", "left", "right", "center"]
                 */
                calibrationPositions: {
                    type: 'Array',
                    description: 'Ordered list of positions to show calibration',
                    default: ['center', 'left', 'right', 'center']
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * calibration audio (played at each calibration position).
                 * Ignored if calibrationLength is 0.
                 *
                 * @property {Object[]} calibrationAudio
                 * @default []
                 */
                calibrationAudio: {
                    type: 'array',
                    description: 'list of objects specifying audio src and type for calibration audio',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * calibration video (played from start at each calibration position).
                 * Ignored if calibrationLength is 0.
                 *
                 * @property {Object[]} calibrationVideo
                 * @default []
                 */
                calibrationVideo: {
                    type: 'array',
                    description: 'list of objects specifying video src and type for calibration audio',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played upon pausing study
                 *
                 * @property {Object[]} pauseAudio
                 * @default []
                 */
                pauseAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when pausing study',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played upon unpausing study. Unpausing audio will always be played
                 * before proceeding to next trial, even if this trial will not be redone
                 * (e.g. because it was paused during test and allowPauseDuringTest is
                 * set to false)
                 *
                 * @property {Object[]} unpauseAudio
                 * @default []
                 */
                unpauseAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when unpausing study',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Text to show under "Study paused / Press space to resume" when study is paused.
                 * Default: (You'll have a moment to turn around again.)
                 *
                 * @property {String} pauseText
                 * @default []

                 */
                pauseText: {
                    type: 'string',
                    description: 'Text to show under Study paused when study is paused.',
                    default: '(You\'ll have a moment to turn around again.)'
                }
            }
        },
        data: {
            type: 'object',
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {Array} videosShown Sources of videos (potentially) shown during this trial: [source of test video, source of alternate test video].
             * @param {Object} eventTimings
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @param {String} rightImage URL of image shown on right (given as a property of the frame)
             * @param {String} leftImage URL of image shown on left (given as a property of the frame)
             * @param {String} centerImage URL of image shown at center (given as a property of the frame)
             * @param {Number} testLength seconds to display images/loop videos (given as a property of the frame), if using time-based limit
             * @return {Object} The payload sent to the server
             */
            properties: {
                videosShown: {
                    type: 'string',
                    default: []
                },
                videoId: {
                    type: 'string'
                },
                rightImage: {
                    type: 'string'
                },
                leftImage: {
                    type: 'string'
                },
                centerImage: {
                    type: 'string'
                },
                testLength: {
                    type: 'number'
                }
            }
            // No fields are required
        }
    },

    videoSources: Ember.computed('isPaused', 'currentTask', 'useAlternate', function() {
        if (this.get('isPaused')) {
            return this.get('announcementVideo_parsed');
        } else {
            switch (this.get('currentTask')) {
                case 'announce':
                    return this.get('announcementVideo_parsed');
                case 'intro':
                    return this.get('introVideo_parsed');
                case 'test':
                    if (this.get('useAlternate')) {
                        if (this.get('altTestVideo').length) {
                            return this.get('altTestVideo_parsed');
                        } else { // default to playing same test video again
                            return this.get('sources_parsed');
                        }
                    } else {
                        return this.get('testVideo_parsed');
                    }
            }
        }
        return [];
    }),

    shouldLoop: Ember.computed('videoSources', function() {
        return (this.get('isPaused') || (this.get('currentTask') === 'announce' || this.get('currentTask') === 'test'));
    }),

    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            if (!this.get('isPaused')) {
                this.pauseStudy();
            }
        }
    },

    actions: {

        announcementEnded() {
            this.set('completedAnnouncementAudio', true);
            if (this.get('completedAnnouncementTime')) {
                this.set('currentTask', 'intro');
            }
        },

        announcementStarted() { // make sure that audio complete flag is reset when starting -
            // mysteriously set to true when starting, possibly due to reloading counting as
            // ended event
            this.set('completedAnnouncementAudio', false);
        },

        videoStarted() {
            if (this.get('currentTask') === 'test' && !this.get('isPaused')) {
                if (this.get('useStaticTestStimuli')) {
                    this.setTestTimer();
                    if ($('audio#exp-music').length) {
                        this.playAudio($('audio#exp-music')[0]);
                    }

                } else {
                    // Check that we haven't played it enough times already
                    this.set('testVideosTimesPlayed', this.get('testVideosTimesPlayed') + 1);
                    if ((this.get('testVideosTimesPlayed') > this.get('testCount')) && (this.get('testLength') === Infinity)) {
                        this.send('finish');
                    } else {
                        if (this.get('testTime') === 0) {
                            this.setTestTimer();
                        }
                        if ($('audio#exp-music').length) {
                            this.playAudio($('audio#exp-music')[0]);
                        }
                        if (this.get('useAlternate')) {
                            this.send('setTimeEvent', 'startAlternateVideo');
                        } else {
                            this.send('setTimeEvent', 'startTestVideo');
                        }
                    }
                }
            }
        },

        videoStopped() {
            var currentTask = this.get('currentTask');
            if (this.get('testTime') >= this.get('testLength')) {
                this.send('finish');
            } else if (this.get('shouldLoop')) {
                this.set('_lastTime', 0);
                this.$('#player-video')[0].play();
            } else {
                this.send('setTimeEvent', 'videoStopped', {
                    currentTask
                });
                if (this.get('currentTask') === 'intro') {
                    this.set('currentTask', 'calibration');
                }
            }
        },

        finish() { // Move to next frame altogether
            // Call this something separate from test because stopRecorder promise needs to
            // call next AFTER recording is stopped and we don't want this to have already
            // been destroyed at that point.
            window.clearInterval(this.get('testTimer'));
            window.clearInterval(this.get('announceTimer'));
            window.clearInterval(this.get('calTimer'));
            this.set('testTime', 0);
            this.set('testVideosTimesPlayed', 0);
            this.set('completedAnnouncementAudio', false);
            this.set('completedAnnouncementTime', false);
            if ($('audio#exp-music').length) {
                $('audio#exp-music')[0].pause();
            }
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
        }
    },

    segmentObserver: Ember.observer('currentTask', function(frame) {
        if (frame.get('currentTask') === 'announce') {
            frame.startAnnouncement();
        } else if (frame.get('currentTask') === 'intro') {
            frame.startIntro();
        } else if (frame.get('currentTask') === 'calibration') {
            frame.startCalibration();
        } else if (frame.get('currentTask') === 'test') {
            // Skip test phase if no videos or images provided
            if (!frame.get('testVideo').length) {
                if (!frame.get('leftImage') && !frame.get('rightImage') && !frame.get('centerImage')) {
                    frame.send('finish');
                } else {
                    frame.set('useStaticTestStimuli', true);
                    $('#allstimuli').show();
                    frame.send('videoStarted');
                }
            }
        }
    }),

    startAnnouncement() {
        window.clearInterval(this.get('announceTimer'));

        // Skip if no announcement audio provided
        if (!this.get('isPaused') && !this.get('announcementAudio').length && this.get('announcementLength') === 0) {
            this.startIntro();
            return;
        }
        if (!this.get('announcementAudio').length) { // Audio counts as complete if none provided
            this.set('completedAnnouncementAudio', true);
        }
        this.send('setTimeEvent', 'startAnnouncement');
        // Actual starting audio is handled by autoplay on the template.
        var _this = this; // Require at least announcementLength duration of announcement phase
        this.set('announceTimer', window.setTimeout(function() {
                _this.set('completedAnnouncementTime', true);
                if (_this.get('completedAnnouncementAudio')) {
                    _this.set('currentTask', 'intro');
                }
            }, _this.get('announcementLength') * 1000));
    },

    startIntro() {
        if (this.get('skip')) { // If we need to skip because both test & alternate have been used
            this.send('finish');
            return;
        }
        if (!this.get('isPaused')) {
            this.send('setTimeEvent', 'startIntro');
            // If no intro video provided, skip intro.
            if (!this.get('introVideo').length) {
                this.set('currentTask', 'calibration');
            }
        }
    },

    startCalibration() {
        var _this = this;

        // First check whether any calibration video provided. If not, skip.
        if (!this.get('calibrationLength')) {
            this.set('currentTask', 'test');
            return;
        }

        var calAudio = $('#player-calibration-audio')[0];
        var calVideo = $('#player-calibration-video')[0];
        $('#player-calibration-video').show();

        // Show the calibration segment at center, left, right, center, each
        // time recording an event and playing the calibration audio.
        var doCalibrationSegments = function(calList, lastLoc) {
            if (calList.length === 0) {
                $('#player-calibration-video').hide();
                _this.set('currentTask', 'test');
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
                _this.playAudio(calAudio);

                $('#player-calibration-video').removeClass(lastLoc);
                $('#player-calibration-video').addClass(thisLoc);
                calVideo.pause();
                calVideo.currentTime = 0;
                calVideo.play();
                _this.set('calTimer', window.setTimeout(function() {
                    doCalibrationSegments(calList, thisLoc);
                }, _this.get('calibrationLength')));
            }
        };

        doCalibrationSegments(this.get('calibrationPositions').slice(), '');

    },

    setTestTimer() {
        window.clearInterval(this.get('testTimer'));
        this.set('testTime', 0);
        this.set('_lastTime', 0);
        var _this = this;

        var testLength = this.get('testLength');

        if (this.get('useStaticTestStimuli')) {
            this.set('testTimer', window.setTimeout(() => {
                _this.send('finish');
            }, testLength * 1000));
        } else {
            this.set('testTimer', window.setInterval(() => {
                var videoTime = this.$('#player-video')[0].currentTime;
                var lastTime = this.get('_lastTime');
                var diff = videoTime - lastTime;
                this.set('_lastTime', videoTime);

                var testTime = this.get('testTime');
                if ((testTime + diff) >= (testLength - 0.02)) {
                    this.send('finish');
                } else {
                    this.set('testTime', testTime + diff);
                }
            }, 100));
        }
    },

    pauseStudy(pause) { // only called in FS mode
        Ember.run.once(this, () => {
            try {
                this.set('hasBeenPaused', true);
            } catch (_) {
                return;
            }
            var wasPaused = this.get('isPaused');
            var currentState = this.get('currentTask');

            if (!pause && wasPaused) { // Currently paused: restart
                //this.hideRecorder();
                this.set('isPaused', false);
                // reset announcement to start

                if (currentState === 'test') {
                    if (this.get('allowPauseDuringTest')) {
                        if (this.get('useAlternate')) {
                            this.set('skip', true);
                        }
                        this.set('useAlternate', true);
                    } else {
                        this.set('skip', true);
                    }

                }
                if (this.get('currentTask') === 'announce') {
                    // if task isn't changing, won't trigger announcement start naturally
                    this.segmentObserver(this);
                }
                this.set('currentTask', 'announce');

                try {
                    this.resumeRecorder();
                } catch (_) {
                    return;
                }
            } else if (pause || !wasPaused) { // Not currently paused: pause
                //this.showRecorder();
                window.clearInterval(this.get('testTimer'));
                window.clearInterval(this.get('announceTimer'));
                window.clearInterval(this.get('calTimer'));
                this.set('completedAnnouncementAudio', false);
                this.set('completedAnnouncementTime', false);
                this.set('testTime', 0);
                this.set('testVideosTimesPlayed', 0);
                this.send('setTimeEvent', 'pauseVideo', {
                    currentTask: this.get('currentTask')
                });
                this.pauseRecorder(true);
                $('#player-calibration-video').removeClass(this.get('calibrationPositions').join(' '));
                $('#player-calibration-video').hide();
                if ($('audio#exp-music').length) {
                    $('audio#exp-music')[0].pause();
                    $('audio#exp-music')[0].currentTime = 0;
                }
                $('#allstimuli').hide();
                this.set('isPaused', true);
            }
        });
    },

    // Utility to play audio object and avoid failing to actually trigger play for
    // dumb browser reasons / race conditions
    playAudio(audioObj) {
        //audioObj.pause();
        audioObj.currentTime = 0;
        audioObj.play().then(() => {
            }).catch(() => {
                audioObj.play();
            }
        );
    },

    didInsertElement() {
        this._super(...arguments);

        $(document).on('keyup.pauser', (e) => {
            if (this.checkFullscreen()) {
                if (e.which === 32) { // space: pause/unpause study
                    this.pauseStudy();
                }
            }
        });

        this.send('showFullscreen');
        if (this.get('testVideo').length) {
            this.set('videosShown', [this.get('testVideo')[0].src, this.get('altTestVideo')[0].src]);
        } else {
            this.set('videosShown', []);
        }
        this.set('currentTask', 'announce');
        this.segmentObserver(this);
    },

    /**
     * Observer that starts recording once recorder is ready. Override to do additional
     * stuff at this point!
     * @method whenPossibleToRecord
     */
    whenPossibleToRecord: observer('recorder.hasCamAccess', 'recorderReady', function() {
        if (this.get('doRecording')) {
            var _this = this;
            if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
                this.startRecorder().then(() => {
                    _this.set('recorderReady', false);
                });
            }
        }
    }),

    willDestroyElement() { // remove event handler
        $(document).off('keyup.pauser');
        this._super(...arguments);
    }
});
