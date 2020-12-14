import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import Ember from 'ember';

import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { computed } from '@ember/object';
import { videoAssetOptions, imageAssetOptions, audioAssetOptions } from '../../mixins/expand-assets';

/*
 * A frame that to explain any blinding procedures to parents, and offer them the option to preview stimuli before the study. Two buttons allow the user to move forward: one goes to the next frame (if the parent wants to preview stimuli), and one skips the next frame and goes to the one after that (if the parent declins). Therefore, this frame should be followed by an {{#crossLink "Exp-video-preview"}}{{/crossLink}} frame.
 */

export default ExpFrameBaseComponent.extend(VideoRecord, ExpandAssets, {
    type: 'exp-lookit-stimuli-preview',
    layout: layout,

    videoIndex: 0,

    recordingStopped: false,
    recordingStarted: false,

    noNext: computed('videoIndex', function() {
        return this.get('videoIndex') >= this.get('stimuli.length') - 1;
    }),

    noPrev: computed('videoIndex', function() {
        return this.get('videoIndex') <= 0;
    }),

    currentVideo: computed('videoIndex', function() {
        return this.get('stimuli')[this.get('videoIndex')];
    }),

    recorderSettingUp: Ember.computed('recorder.hasCamAccess', 'recorderReady', function() {
        return (this.get('doRecording') && !(this.get('recorder.hasCamAccess') && this.get('recorderReady')));
    }),

    assetsToExpand: {
        'audio': ['stimuli/audio'],
        'video': ['stimuli/video'],
        'image': ['stimuli/image']
    },

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),

    frameSchemaProperties: {

        showPreviousButton: {
            type: 'boolean',
            default: true
        },

        blocks: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string'
                    },
                    text: {
                        type: 'string'
                    },
                    emph: {
                        type: 'boolean'
                    },
                    image: {
                        type: 'object',
                        properties: {
                            src: {
                                type: 'string'
                            },
                            alt: {
                                type: 'string'
                            }
                        },
                        required: ['src', 'alt']
                    },
                    listblocks: {
                        type: 'array',
                        default: []
                    }
                }
            },
            default: []
        },

        previewButtonText: {
            type: 'string',
            default: 'I\'d like to preview the videos'
        },

        skipButtonText: {
            type: 'string',
            default: 'Skip preview'
        },

        stimuli: {
            type: 'array',
            description: 'A list of stimuli to preview',
            items: {
                type: 'object',
                properties: {
                    image: {
                        anyOf: imageAssetOptions,
                        default: ''
                    },
                    video: {
                        anyOf: videoAssetOptions
                    },
                    audio: {
                        anyOf: audioAssetOptions
                    },
                    caption: {
                        type: 'string'
                    }
                },
                required: ['caption']
            },
            default: []
        },

        nextStimulusText: {
            type: 'string',
            description: 'Text on the button to proceed to the next example video/image',
            default: 'Next'
        },

        previousStimulusText: {
            type: 'string',
            description: 'Text on the button to proceed to the previous example video/image',
            default: 'Previous'
        },

        doRecording: {
            type: 'boolean',
            description: 'Whether to do video recording during stimulus preview',
            default: true
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
                }
            }
        }
    },
    prompt: true,
    actions: {
        accept() {
            /**
             * User clicks on start preview button
             *
             * @event startPreview
             */
            this.send('setTimeEvent', 'startPreview');
            this.set('prompt', false);
            if (this.get('experiment') && this.get('id') && this.get('session') && this.get('doRecording')) {
                this.startRecorder().then(() => {
                    this.set('recordingStarted', true);
                });
            }
        },
        nextVideo() {
            /**
             * User clicks to move to next stimulus
             *
             * @event nextStimulus
             */
            this.send('setTimeEvent', 'nextStimulus');
            this.set('videoIndex', this.get('videoIndex') + 1);
        },
        previousVideo() {
            /**
             * User clicks to move to previous stimulus
             *
             * @event previousStimulus
             */
            this.send('setTimeEvent', 'previousStimulus');
            this.set('videoIndex', this.get('videoIndex') - 1);
        },
        finish() {
            if (this.get('doRecording')) {
                if (!this.get('recordingStopped')) {
                    this.set('recordingStopped', true);
                    var _this = this;
                    this.stopRecorder().then(() => {
                        _this.send('next');
                    }, () => {
                        _this.send('next');
                    });
                } else {
                    this.send('next');
                }
            } else {
                this.send('next');
            }
        }
    },

    // Reload media when rendering again so that videos/audio get automatically updated. Previously media-reload mixin
    didRender() {
        this._super(...arguments);
        for (var selector of ['audio', 'video']) {
            Ember.$(selector).each(function () {
                this.pause();
                this.load();
            });
        }
    }
});
