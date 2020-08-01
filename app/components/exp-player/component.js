import Ember from 'ember';
import layout from './template';

import FullScreen from '../../mixins/full-screen';
import ExperimentParser from '../../utils/parse-experiment';

let {
    $
} = Ember;

// Use regular comment syntax here to exclude from docs for clarity
/*
 * @module exp-player
 * @submodule components
 */

/*
 * Experiment player: a component that renders a series of frames that define an experiment
 *
 * Sample usage:
 * ```handlebars
 * {{exp-player
 *   experiment=experiment
 *   session=session
 *   pastSessions=pastSessions
 *   saveHandler=(action 'saveSession')
 *   frameIndex=0
 *   fullScreenElementId='expContainer'}}
 * ```
 *
 * @class Exp-player
 */
export default Ember.Component.extend(FullScreen, {
    layout: layout,

    experiment: null, // Experiment model
    session: null,
    pastSessions: null,
    frames: null,
    conditions: null,

    frameIndex: 0, // Index of the currently active frame

    displayFullscreen: false,
    fullScreenElementId: 'experiment-player',

    allowExit: false,
    hasAttemptedExit: false,

    toast: Ember.inject.service(),

    // Any additional properties we might wish to pass from the player to individual frames. Allows passing of arbitrary config
    // by individual consuming applications to suit custom needs.
    extra: {},

    /**
     * The message to display in the early exit modal. Newer browsers may not respect this message.
     * @property {String|null} messageEarlyExitModal
     */
    messageEarlyExitModal: 'Are you sure you want to leave this page? You may lose unsaved data.',

    /**
     * Customize what happens when the user exits the page
     * @method beforeUnload
     * @param {event} event The event to be handled
     * @return {String|null} If string is provided, triggers a modal to confirm user wants to leave page
     */
    beforeUnload(event) {

        if (!this.get('allowExit')) {
            this.showConfirmationDialog();
            this.get('toast').warning('To leave the study early, please press Exit below so you can select a privacy level for your videos.');
            this.set('hasAttemptedExit', true);
            this.send('exitFullscreen');

            // Log that the user attempted to leave early, via browser navigation.
            // There is no guarantee that the server request to save this event will finish before exit completed;
            //   we are limited in our ability to prevent willful exits
            this.send('setGlobalTimeEvent', 'exitEarly', {
                exitType: 'browserNavigationAttempt', // Page navigation, closed browser, etc
                lastPageSeen: this.get('frameIndex')
            });
            //Ensure sync - try to force save to finish before exit
            Ember.run(() => this.get('session').save());

            // Then attempt to warn the user and exit
            // Newer browsers will ignore the custom message below. See https://bugs.chromium.org/p/chromium/issues/detail?id=587940
            const message = this.get('messageEarlyExitModal');
            event.returnValue = message;
            return message;
        }
        return null;
    },

    showConfirmationDialog() {
        var _this = this;
        this.get('toast').warning("<br><button type='button' id='confirmationContinueStudy' class='btn btn-outline-secondary' style='color:black;'>Continue</button><button type='button' id='confirmationExitStudy' class='btn btn-danger' style='float:right;'>Exit</button>", 'Really exit study?',
            {
                allowHtml: true,
                preventDuplicates: true,
                onclick: null,
                timeOut: 0,
                extendedTimeOut: 0,
                onShown: function () {
                    Ember.$('#confirmationExitStudy').click(function() {
                        _this.send('exitEarly');
                    });
                    Ember.$('#confirmationContinueStudy').click(function() {
                        _this.get('toast').clear();
                    });
                }
            });
    },

    _registerHandlers() {
        $(window).on('beforeunload', this.beforeUnload.bind(this));
        var _this = this;
        Ember.$(window).on('keydown', (e) => {
            if ((e.which === 112) || (e.ctrlKey && e.which == 88)) { // F1 key or ctrl-x
                _this.send('exitFullscreen');
                _this.showConfirmationDialog();
            }
        });
    },

    _removeHandlers() {
        Ember.$(window).off('keydown');
        $(window).off('beforeunload');
    },

    onFrameIndexChange: Ember.observer('frameIndex', function() {
        var max = this.get('frames.length') - 1;
        var frameIndex = this.get('frameIndex');
        if (frameIndex === max) {
            this._removeHandlers();
        }
    }),

    willDestroy() {
        this._super(...arguments);
        this._removeHandlers();
    },

    init: function() {

        this._super(...arguments);
        this._registerHandlers();

        var structure = this.get('experiment.structure');
        if (typeof(structure) === 'string') {
            structure = structure.replace(/(\r\n|\n|\r)/gm,'');
            structure = JSON.parse(structure);
        }

        var parser = new ExperimentParser({
            structure: structure,
            pastSessions: this.get('pastSessions').toArray(),
            child: this.get('session.child'),
            useGenerator: this.get('experiment.useGenerator'),
            generator: this.get('experiment.generator')
        });
        var [frameConfigs, conditions] = parser.parse();
        this.set('frames', frameConfigs); // When player loads, convert structure to list of frames

        $('head title').html(this.get('experiment.name'));

        var session = this.get('session');
        session.set('conditions', conditions);
        session.save();
    },

    currentFrameConfig: Ember.computed('frames', 'frameIndex', function() {
        var frames = this.get('frames') || [];
        var frameIndex = this.get('frameIndex');
        return frames[frameIndex];
    }),

    _currentFrameTemplate: null,
    currentFrameTemplate: Ember.computed('currentFrameConfig', '_currentFrameTemplate', function() {
        var currentFrameTemplate = this.get('_currentFrameTemplate');
        if (currentFrameTemplate) {
            return currentFrameTemplate;
        }

        var currentFrameConfig = this.get('currentFrameConfig');
        var componentName = `${currentFrameConfig.kind}`;

        if (!Ember.getOwner(this).lookup(`component:${componentName}`)) {
            var availableFrames = Ember.getOwner(this).lookup(`container-debug-adapter:main`).catalogEntriesByType('component')
                .filter(componentName => componentName.includes('component') && componentName.includes('exp-') && !['components/exp-blank', 'components/exp-frame-base', 'components/exp-text-block', 'components/exp-player'].includes(componentName))
                .map(componentName => componentName.replace('components/', ''));
            console.error(`Unknown frame kind '${componentName}' specified. Check that 'kind' is specified for all frames and that it is always one of the following available frame kinds:\n\t${availableFrames.join('\n\t')}\nFrames are described in more detail https://lookit.github.io/ember-lookit-frameplayer/modules/frames.html. Frame kinds are all lowercase, like 'exp-lookit-exit-survey'. If you are trying to use a newer frame, you may need to update the frameplayer code for your study; see https://lookit.readthedocs.io/en/develop/researchers-update-code.html.`);
        }
        return componentName;
    }),

    currentFrameContext: Ember.computed('pastSessions', function() {
        return {
            pastSessions: this.get('pastSessions')
        };
    }),

    _transition() {
        Ember.run(() => {
            this.set('_currentFrameTemplate', 'exp-blank');
            // should also set all frame properties back to defaults.
        });
        this.set('_currentFrameTemplate', null);
    },
    _exit() {
        this.get('session').save().then(() => window.location = this.get('experiment.exitURL') || '/');
    },

    actions: {

        setGlobalTimeEvent(eventName, extra) {
            // Set a timing event not tied to any one frame
            let curTime = new Date();
            let eventData = {
                eventType: eventName,
                timestamp: curTime.toISOString()
            };
            Ember.assign(eventData, extra || {});
            let session = this.get('session');
            session.get('globalEventTimings').pushObject(eventData);
        },

        saveFrame(frameId, frameData) {
            // Save the data from a completed frame to the session data item
            if (this.get('session.sequence') && frameId != this.get('session.sequence')[this.get('session.sequence').length - 1]) {
                this.get('session.sequence').push(frameId);
            }
            this.get('session.expData')[frameId] = frameData;
            if (!this.get('session').child.content || this.get('session').child.content.id === 'TEST_CHILD_DISREGARD') {
                return Ember.RSVP.Promise.resolve();
            } else {
                return this.get('session').save();
            }
        },

        next(nextFrameIndex = -1) {
            var frameIndex = this.get('frameIndex');
            if (nextFrameIndex == -1) {
                nextFrameIndex = frameIndex + 1;
            } else if (nextFrameIndex < 0 || nextFrameIndex > this.get('frames').length) {
                throw new Error('selectNextFrame function provided for this frame returns a frame index out of bounds');
            }
            if (nextFrameIndex < (this.get('frames').length)) {
                this._transition();
                this.set('frameIndex', nextFrameIndex);
                return;
            }
            this._exit(); // exit if nextFrameIndex == this.get('frames').length
        },

        skipone() {
            var frameIndex = this.get('frameIndex');
            if (frameIndex < (this.get('frames').length - 2)) {
                this._transition();
                this.set('frameIndex', frameIndex + 2);
                return;
            }
            this._exit();
        },

        exit() {
            this._exit();
        },

        previous() {
            var frameIndex = this.get('frameIndex');
            if (frameIndex !== 0) {
                this._transition();
                this.set('frameIndex', frameIndex - 1);
            }
        },

        closeExitWarning() {
            this.set('hasAttemptedExit', false);
        },

        exitEarly() {
            // Stop/destroy session recorder if needed
            if (this.get('session').get('recorder')) {
                var sessionRecorder = this.get('session').get('recorder');
                this.get('session').set('recordingInProgress', false);
                if (sessionRecorder.get('recording')) {
                    sessionRecorder.stop().finally(() => {
                        sessionRecorder.destroy();
                    });
                } else {
                    sessionRecorder.destroy();
                }
            }

            this.set('hasAttemptedExit', false);
            Ember.$(window).off('keydown');
            // Save any available data immediately
            this.send('setGlobalTimeEvent', 'exitEarly', {
                exitType: 'manualInterrupt',  // User consciously chose to exit, eg by pressing F1 key
                lastPageSeen: this.get('frameIndex') + 1
            });
            this.get('session').save(); // I think this is the response

            // Navigate to last page in experiment (assumed to be survey frame)
            var max = this.get('frames.length') - 1;
            this.send('next', max);
        },
    }
});
