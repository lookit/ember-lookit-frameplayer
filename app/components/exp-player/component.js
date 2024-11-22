import Ember from 'ember';
import layout from './template';

import FullScreen from '../../mixins/full-screen';
import ExperimentParser from '../../utils/parse-experiment';
import { addSearchParams } from '../../utils/add-search-params';

let {
    $
} = Ember;

/*
 * Experiment player: a component that renders a series of frames that define an experiment
 *
 * Sample usage:
 * ```handlebars
 * {{exp-player
 *   experiment=experiment
 *   session=session
 *   pastSessions=pastSessions
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

    // Store sequence and expData on the component so we can update them immediately, then transfer to session
    _sequence: [],
    _expData: {},

    frameIndex: 0, // Index of the currently active frame

    displayFullscreen: false,
    fullScreenElementId: 'experiment-player',

    toast: Ember.inject.service(),
    intl: Ember.inject.service(),

    // Any additional properties we might wish to pass from the player to individual frames. Allows passing of arbitrary config
    // by individual consuming applications to suit custom needs.
    extra: {},

    /*
     * Customize what happens when the user exits the page
     * @method beforeUnload
     * @return null
     */
    beforeUnload() {

        this.showConfirmationDialog();
        this.exitFullscreen();

        // Log that the user attempted to leave early, via browser navigation.
        // There is no guarantee that the server request to save this event will finish before exit completed;
        //   we are limited in our ability to prevent willful exits
        this.send('setGlobalTimeEvent', 'exitEarly', {
            exitType: 'browserNavigationAttempt', // Page navigation, closed browser, etc
            lastPageSeen: this.get('frameIndex')
        });
        //Ensure sync - try to force save to finish before exit
        Ember.run(() => this.get('session').save());

        return null;
    },

    showConfirmationDialog() {
        var _this = this;
        let continueText = this.get('intl').lookup('Continue');
        let exitText = this.get('intl').lookup('Exit');
        let reallyExitText = this.get('intl').lookup('Really exit study');

        this.get('toast').warning(`<br><button type='button' id='confirmationContinueStudy' class='btn btn-outline-secondary' style='color:black;'>${continueText}</button><button type='button' id='confirmationExitStudy' class='btn btn-danger' style='float:right;'>${exitText}</button>`, reallyExitText,
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

    stopAndDestroyRecorders() {
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

        // stop/destroy trial recorder if needed
        if (this.get('recorder') && this.get('recorder').get('recording')) {
            this.stopRecorder().finally(() => {
                this.destroyRecorder();
            });
        }
    },

    _registerHandlers() {
        $(window).on('beforeunload', this.beforeUnload.bind(this));
        var _this = this;
        Ember.$(window).on('keydown', (e) => {
            if ((e.which === 112) || (e.which === 27) || (e.ctrlKey && e.which == 88)) { // F1 key, Esc, or ctrl-x
                _this.exitFullscreen();
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
            console.error(`Unknown frame kind '${componentName}' specified. Check that 'kind' is specified for all frames and that it is always one of the following available frame kinds:\n\t${availableFrames.join('\n\t')}\nFrames are described in more detail https://lookit.readthedocs.io/projects/frameplayer/en/latest/utils/protocol.html#study-protocol-structure. Frame kinds are all lowercase, like 'exp-lookit-exit-survey'. If you are trying to use a newer frame, you may need to update the frameplayer code for your study; see https://lookit.readthedocs.io/en/master/researchers-update-code.html.`);
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
        const exitUrl = this.get('experiment.exitURL');
        const hashChildId = this.get('session.hash_child_id');
        const responseId =  this.get('session.id');

        this.get('session').save().then(() => window.location = addSearchParams(exitUrl, responseId, hashChildId) );
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
            // Save the data from a completed frame to the session data item. Add to sequence and
            if (frameId != this.get('_sequence')[this.get('_sequence').length - 1]) {
                this.get('_sequence').push(frameId);
            }
            this.get('_expData')[frameId] = frameData;
            this.get('session').set('sequence', this.get('_sequence'));
            this.get('session').set('expData', this.get('_expData'));
            // This takes a second or so! If we directly manipulate session.sequence and session.expData, we can
            // end up with overlapping calls to save() that lead to data being lost. Because all of the above steps
            // can be done immediately, we can keep _sequence and _expData current (and in the correct order) so that
            // when we save the session we don't lose any information. (Alternately we can keep track of whether we're
            // currently saving, defer the save if so, and use e.g.
            // this.get('session').save().finally(() => {_this.set('_saving', false);})
            return this.get('session').save();
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
                window.scrollTo(0, 0);
                return;
            }
            this._exit(); // exit if nextFrameIndex >= this.get('frames').length
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

        exitEarly() {

            this.stopAndDestroyRecorders();

            Ember.$(window).off('keydown');
            // Save any available data immediately
            this.send('setGlobalTimeEvent', 'exitEarly', {
                exitType: 'manualInterrupt',  // User consciously chose to exit, eg by pressing F1 key
                lastPageSeen: this.get('frameIndex') + 1
            });
            this.get('session').save();

            // Navigate to last page in experiment (assumed to be survey frame)
            var max = this.get('frames.length') - 1;
            this.send('next', max);
        },

        setLanguage(isoLang) {
            let locales = this.get('intl').get('locales');
            if (locales.includes(isoLang)) {
                this.get('intl').set('locale', [isoLang, 'en-us']);
            } else {
                console.error(`Unable to set language to ${isoLang} because no translation file is available.`)
            }
        },
    }
});
