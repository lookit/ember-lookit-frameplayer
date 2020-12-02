import Ember from 'ember';
import { colorSpecToRgbaArray, isColor, textColorForBackground } from '../utils/is-color';
import { expFormat } from '../helpers/exp-format';
import { debounce } from '@ember/runloop';
import { mergeObjectOfArrays } from '../utils/replace-values';

let {
    $
} = Ember;


/*
 *
 * Reference for DEVELOPERS of new frames only!
 *
 * This mixin provides general functionality for pausing/unpausing during frames. Upon pausing, a configurable pause
 * screen is displayed and any pause audio is played. Upon unpausing, any unpause audio is played and then the
 * study proceeds to a frame set by the user (by default, it restarts the current frame).
 *
 * To use this mixin in a frame:
 *
 * * Set appropriate frame-specific default values for any of the parameters used (pauseKey, pauseText, etc.) if
 *   different from mixin defaults
 *
 * * Add a call to enablePausing() when you want to start allowing the user to pause (this will allow user pausing
 *   if it's enabled, as well as pausing upon leaving fullscreen mode if that's enabled). Add a call to disablePausing()
 *   when pausing should no longer be allowed - e.g., once stopping recording to move to the next frame.
 *
 * * Add onStudyPause and onStudyUnpause frame-specific Promises. onStudyPause should take care of any stimuli, timers,
 *   key handlers, etc. that should not continue during pausing, stop recording, etc. It should resolve once it's ok to
 *   unpause. onStudyUnpause should take care of any additional cleanup that would ordinarily happen before moving to
 *   the next frame and resolve once it's ok to move to the next frame.
 *
 */


var pauseUnpauseMixin = Ember.Mixin.create({

    /*
     Key parent can press to pause study
     */
    pauseKey: ' ',

    /*
     Text to display when study is paused
     */
    pausedText: 'Study paused \n\n Press space to resume',

    /*
     Text to display while study is pausing - this may take several seconds to finish uploading video
     */
    pausingText: 'Study pausing... \n\n Please wait',

    /*
     Background color of pause screen. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
     for acceptable syntax: can use either color names ('blue', 'red', 'green', etc.), or
     rgb hex values (e.g. '#800080' - include the '#'). The text on top of this will be either black or white
     depending on which will have higher contrast.
     */
    pauseColor: 'white',

    /*
     Video to display along with any pausing/pausedText message (looping).
     Either pauseImage or pauseVideo can be
     specified. This can be either an array of ``{'src': 'https://...', 'type': '...'}`` objects (e.g. providing both
     webm and mp4 versions at specified URLS) or a single string relative to ``baseDir/<EXT>/`` if this frame otherwise
     supports use of ``baseDir``.
     */
    pauseVideo: '',

    /*
     Image to display along with any pausing/pausedText message.
     Either pauseImage or pauseVideo can be
     specified. This can be either a full URL or a filename, which will be relative to ``baseDir/img/`` if this frame otherwise
     supports use of ``baseDir``.
     */
    pauseImage: '',

    /*
     Audio to play upon pausing. This can be either an array of ``{'src': 'https://...', 'type': '...'}`` objects
     or a single string relative to ``baseDir/<EXT>/`` if this frame otherwise
     supports use of ``baseDir``.
     */
    pauseAudio: '',

    /*
     Audio to play upon pausing. This can be either an array of ``{'src': 'https://...', 'type': '...'}`` objects
     or a single string relative to ``baseDir/<EXT>/`` if this frame otherwise
     supports use of ``baseDir``. The frame will proceed once the unpauseAudio finishes.
     */
    unpauseAudio: '',

    /*
     Whether to allow the user to pause the study by pressing the pauseKey.
     */
    allowUserPause: true,

    /*
     How many frames to proceed when restarting after pausing. 0 to restart this frame; 1 to proceed to next frame;
     -1 to start at previous frame; etc.
     */
    frameOffsetAfterPause: 0,

    /*
     Whether to pause automatically upon exiting fullscreen mode
     */
    pauseWhenExitingFullscreen: true,

    /*
     Whether to stop any ongoing session recording upon pausing
     */
    stopSessionRecordingOnPause: false,

    _isPaused: false,

    _pausingEnabled: false,

    _completedFrameUnpause: false,

    _pauseStudy() {
        this._togglePauseState(true);
    },

    _unpauseStudy() {
        this._togglePauseState(false);
    },

    _togglePauseState(doPause = null) {
        let _this = this;
        if (doPause == null) {
            doPause = !this.get('_isPaused');
        }
        if (doPause) { // PAUSE (currently unpaused)
            this.set('_isPaused', true);
            $('#pause-text').html(`${expFormat(_this.get('pausingText'))}`);
            $('div.pause-unpause-mixin-cover').show();
            this.disablePausing();
            this.send('setTimeEvent', 'pauseStudy');
            // Stop any unpause audio
            if ($('#pause-unpause-mixin-unpause-audio').length) {
                $('#pause-unpause-mixin-unpause-audio')[0].pause();
                $('#pause-unpause-mixin-unpause-audio')[0].currentTime = 0;
            }
            // Play pause audio if available
            if ($('#pause-unpause-mixin-pause-audio').length) {
                $('#pause-unpause-mixin-pause-audio')[0].play();
            }

            // Two things have to happen for pausing to be done: the onStudyPromise needs
            // to resolve, and session recording needs to stop if indicated. Actually treat the
            // study as paused (unpause-able) when both are done.

            this.set('sessionRecordingStopped', false);
            if (this.get('stopSessionRecordingOnPause') && this.get('sessionRecorder') && this.get('session').get('recordingInProgress')) {
                this.get('session').set('recordingInProgress', false);
                this.stopSessionRecorder().finally(() => {
                    _this.set('sessionRecordingStopped', true);
                    _this.destroySessionRecorder();
                    if (_this.get('studyPauseCompleted')) {
                        $('.video-record-mixin-wait-for-video').hide();
                        // Change message back from "Pausing..."
                        let pausedText = _this.checkFullscreen() ? _this.get('pausedText') : 'Study paused <br><br> Please return to fullscreen';
                        $('#pause-text').html(`${expFormat(pausedText)}`);
                        _this.enablePausing();
                    }
                });
            } else {
                this.set('sessionRecordingStopped', true);
            }

            this.set('studyPauseCompleted', false);
            this.onStudyPause().finally(() => {
                // In case study pausing stopped recording, now hide any uploading message
                _this.set('studyPauseCompleted', true);
                if (_this.get('sessionRecordingStopped')) {
                    $('.video-record-mixin-wait-for-video').hide();
                    // Change message back from "Pausing..."
                    let pausedText = _this.checkFullscreen() ? _this.get('pausedText') : 'Study paused <br><br> Please return to fullscreen';
                    $('#pause-text').html(`${expFormat(pausedText)}`);
                    _this.enablePausing();
                }
            });
        }
        else { // UNPAUSE (currently paused)
            this.set('_isPaused', false);
            // $('div.pause-unpause-mixin-cover').hide();
            this.send('setTimeEvent', 'resumeStudy');
            // Stop any pause audio & "rewind"
            if ($('#pause-unpause-mixin-pause-audio').length) {
                $('#pause-unpause-mixin-pause-audio')[0].pause();
                $('#pause-unpause-mixin-pause-audio')[0].currentTime = 0;
            }
            // Select appropriate next frame
            let nextFrameIndex = this.get('frameIndex') + this.get('frameOffsetAfterPause');

            // Play any unpause audio
            if ($('#pause-unpause-mixin-unpause-audio').length) {
                $('#pause-unpause-mixin-unpause-audio')[0].play();
                this.set('_completedFrameUnpause', false);
                // On audio finish, go to next frame (if unpause promise has already resolved)
                $('#pause-unpause-mixin-unpause-audio').on("ended", () => {
                    if (_this.get('_completedFrameUnpause')) {
                        _this.send('goToFrameIndex', nextFrameIndex);
                    }
                });
                this.disablePausing();
                this.onStudyUnpause().finally(() => {
                    _this.set('_completedFrameUnpause', true);
                    if ($('#pause-unpause-mixin-unpause-audio')[0].paused) {
                        _this.send('goToFrameIndex', nextFrameIndex);
                    }
                });
            } else {
                this.onStudyUnpause().finally(() => {
                    _this.send('goToFrameIndex', nextFrameIndex);
                });
            }
        }
    },

    /*
     Hook called when study is unpaused, just before proceeding to the next frame. Should return a promise that resolves
     when it's ok to move to the next frame.
    */
    onStudyUnpause() {
        return new Promise((resolve) => {
            resolve();
        });
    },

    /*
     Hook called when study is paused, just before displaying pause screen. Should be a promise that resolves
     when it's ok to allow unpausing.
    */
    onStudyPause() {
        return new Promise((resolve) => {
            resolve();
        });
    },

    /*
     Temporarily disable pausing/unpausing. May be called from consuming frame's onStudyPause/onStudyUnpause hooks.
     */
    disablePausing() {
        $(document).off('keyup.pauser');
        this.set('_pausingEnabled', false);
        // Don't need to separately disable FS listener because it checks for whether pausing is enabled
    },

    /*
     Enable pausing/unpausing. May be called from consuming frame's onStudyPause/onStudyUnpause hooks.
     */
    enablePausing(doFullscreenCheck = true) {
        if (!this.get('_pausingEnabled')) {
            $(document).off('keyup.pauser');
            $(document).on('keyup.pauser', (e) => {
                if (this.checkFullscreen()) {
                    // Only allow pausing/unpausing if we're full-screen OR full-screen isn't required
                    if (this.checkFullscreen() || !this.get('pauseWhenExitingFullscreen')) {
                        // If a pauseKey is defined and this is it, OR if no pause key is defined and this is ' ' and we're currently paused
                        // (so that no one can get 'stuck' in a paused state if pausing happens automatically via leaving FS)
                        if ((this.get('allowUserPause') && this.get('pauseKey') && e.key === this.get('pauseKey')) ||
                            ((!this.get('pauseKey') && e.key === ' ' && this.get('_isPaused')))) {
                            debounce(this, this._togglePauseState, 150);
                        }
                    }
                }
            });
            this.set('_pausingEnabled', true);
        }

        // Don't need to separately enable FS listener because it checks _pausingEnabled
        if (this.get('pauseWhenExitingFullscreen') && !this.checkFullscreen() && !this.get('_isPaused') && doFullscreenCheck) {
            console.log('failed fullscreen c heck');
            this._pauseStudy();
            return true;
        }
        return false;
    },

    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);

        if (this.get('pauseWhenExitingFullscreen')) {
            if ( this.get('_pausingEnabled') && !this.checkFullscreen()) { // If we've just left fullscreen
                if (!this.get('_isPaused')) { // Pause if not already paused
                    this._togglePauseState(true);
                }
            }
            if (this.get('_isPaused')) {
                if (!this.checkFullscreen()) { // If we've just left fullscreen
                    // Was already paused, just leaving FS - just make sure pause screen is still rendered, and
                    // we show the appropriate text
                    $('#pause-text').html(`${expFormat('Study paused <br><br> Please return to fullscreen')}`);
                } else { // If we've just entered fullscreen but are paused
                    // show regular paused/ispausing text now
                    if (this.get('studyPauseCompleted') && this.get('sessionRecordingStopped')) {
                        $('#pause-text').html(`${expFormat(this.get('pausedText'))}`);
                    } else {
                        $('#pause-text').html(`${expFormat(this.get('pausingText'))}`);
                    }
                }
                $('.pause-unpause-mixin-cover').show();
            }
        }

    },

    didReceiveAttrs() {
        let assets = this.get('assetsToExpand') ? this.get('assetsToExpand') : {};
        let additionalAssetsToExpand = {
            image: ['pauseImage'],
            video: ['pauseVideo'],
            audio: ['pauseAudio', 'unpauseAudio']
        };
        this.set('assetsToExpand', mergeObjectOfArrays(assets, additionalAssetsToExpand));
        this._super(...arguments);
    },

    didInsertElement() {
        this._super(...arguments);

        // Set up the pause screen
        let $pauseCover = $('<div></div>');
        $pauseCover.addClass('pause-unpause-mixin-cover'); // for easily referencing later to show/hide

        // Set the background color of the cover
        let colorSpec = this.get('pauseColor');
        if (!isColor(colorSpec)) {
            console.warn(`Invalid background color pauseColor (${colorSpec}) provided; using default instead.`);
            colorSpec = 'white';
        }
        let colorSpecRGBA = colorSpecToRgbaArray(colorSpec);
        $pauseCover.css('background-color', colorSpec);

        // Add the image, if any
        if (this.get('pauseImage')) {
            let imageSource = this.get('pauseImage_parsed') ? this.get('pauseImage_parsed') : this.get('pauseImage');
            $pauseCover.append($(`<img id='pause-unpause-mixin-pause-image' src='${imageSource}' alt='placeholder image for pause screen' class='pause-unpause-mixin-image'>`));
        }

        // Add the video, if any
        if (this.get('pauseVideo')) {
            let $videoElement = $('<video id="pause-unpause-mixin-pause-image" loop autoplay="autoplay" class="video-record-mixin-image"></video>');
            let videoSources = this.get('pauseVideo_parsed') ? this.get('pauseVideo_parsed') : this.get('pauseVideo');
            $.each(videoSources, function (idx, source) {
                $videoElement.append(`<source src=${source.src} type=${source.type}>`);
            });
            $pauseCover.append($videoElement);
        }

        // Add the pause and unpause audio, if any
        if (this.get('pauseAudio')) {
            let $audioElement = $('<audio id="pause-unpause-mixin-pause-audio"></audio>');
            let audioSources = this.get('pauseAudio_parsed') ? this.get('pauseAudio_parsed') : this.get('pauseAudio');
            $.each(audioSources, function (idx, source) {
                $audioElement.append(`<source src=${source.src} type=${source.type}>`);
            });
            $pauseCover.append($audioElement);
        }
        if (this.get('unpauseAudio')) {
            let $audioElement = $('<audio id="pause-unpause-mixin-unpause-audio"></audio>');
            let audioSources = this.get('unpauseAudio_parsed') ? this.get('unpauseAudio_parsed') : this.get('unpauseAudio');
            $.each(audioSources, function (idx, source) {
                $audioElement.append(`<source src=${source.src} type=${source.type}>`);
            });
            $pauseCover.append($audioElement);
        }

        // Add the text and set its color so it'll be visible against the background
        let $pauseText = $(`<div id="pause-text">${expFormat(this.get('pausedText'))}</div>`);
        $pauseText.addClass('pause-unpause-mixin-text');
        $pauseText.css('color', textColorForBackground(colorSpecRGBA));
        $pauseCover.append($pauseText);

        $('div.lookit-frame').append($pauseCover);

        $pauseCover.hide();
    },

    willDestroyElement() {
        $(document).off('keyup.pauser');
        this._super(...arguments);
    },


});

export default pauseUnpauseMixin;
