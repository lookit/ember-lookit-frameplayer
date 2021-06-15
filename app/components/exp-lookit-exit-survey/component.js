import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';
import Ember from 'ember';

import ExpFrameBaseComponent from '../exp-frame-base/component';


const Validations = buildValidations({
    birthDate: validator('presence', {
        presence: true,
        // Translate just this message, avoid installing a different addon for now -
        // see https://github.com/offirgolan/ember-cp-validations/issues/192
        message: function() {
            let intl = this.model.get('parentView').get('intl');
            return intl.lookup('this-field-is-required');
        }
    }),
    useOfMedia: validator('presence', {
        presence: true,
        message: function() {
            let intl = this.model.get('parentView').get('intl');
            return intl.lookup('this-field-is-required');
        },
        disabled: Ember.computed.readOnly('model.withdrawal')
    }),
    databraryShare: validator('presence', {
        presence: true,
        message:  function() {
            let intl = this.model.get('parentView').get('intl');
            return intl.lookup('this-field-is-required');
        },
        disabled: Ember.computed.readOnly('model.withdrawal')
    })
});

/*
Standard exit survey for Lookit studies: confirm participant birthdate, ask user for video sharing permission level & Databrary sharing, option to withdraw, freeform comments, debriefing/thank you text. Leaves fullscreen mode.
*/

export default ExpFrameBaseComponent.extend(Validations, {
    layout: layout,
    type: 'exp-lookit-exit-survey',
    frameType: 'EXIT',
    fullScreenElementId: 'experiment-player',
    frameSchemaProperties: {
        debriefing: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    default: 'Thank you!'
                },
                text: {
                    type: 'string'
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
                    }
                },
                blocks: {
                    type: 'array',
                    default: []
                }
            }
        },
        showShareButton: {
            type: 'boolean',
            description: 'Whether to show a \'share this study on Facebook\' button',
            default: true
        },
        additionalVideoPrivacyText: {
            type: 'string',
            default: '',
            description: 'Additional text to display under "Use of video clips and images:", before listing options'
        },
        privateLevelOnly: {
            type: 'boolean',
            default: false,
            description: 'Whether to restrict privacy level "choices" to the "private" option'
        },
        showDatabraryOptions: {
            type: 'boolean',
            default: true,
            description: 'Whether to show the Databrary sharing option question - please only disable if required by IRB'
        },
        includeWithdrawalExample: {
            type: 'boolean',
            default: true,
            description: 'Whether to include the parenthetical example of why you might withdraw video data - please only disable if required by IRB'
        }
    },
    frameSchemaRequired: ['debriefing'],
    meta: {
        data: {
            type: 'object',
            properties: {
                /*
                * Child's birthdate as entered into exit survey; timestamp string starting YYYY-mm-dd.
                */
                birthDate: {
                    type: 'string',
                    default: null
                },
                /*
                * Whether data can be shared with Databrary: 'yes' or 'no'
                */
                databraryShare: {
                    type: 'string'
                },
                /*
                * Video privacy level: 'private', 'scientific', or 'public'
                */
                useOfMedia: {
                    type: 'string'
                },
                /*
                * Whether the the box to withdraw video data is checked
                */
                withdrawal: {
                    type: 'boolean',
                    default: false
                },
                /*
                * Freeform comments entered by parent
                */
                feedback: {
                    type: 'string',
                    default: ''
                }
            }
        }
    },
    section1: true,
    showWithdrawalConfirmation: false,
    showValidation: false,

    advanceToProgressBar() {
        // Move from section 1 (survey) to section 2 (progress bar/ finish button)
        // Mark the session complete at this stage, as all data has been entered
        this.setSessionCompleted();
        this._save()
            .then(()=> {
                this.set('section1', false);
                window.scrollTo(0, 0);
            })
            .catch(err => this.displayError(err));
    },
    actions: {

        continue() {
            // Check whether exit survey is valid, and if so, advance to next screen
            if (this.get('validations.isValid')) {
                if (this.get('withdrawal')) {
                    this.set('showWithdrawalConfirmation', true);
                } else {
                    this.advanceToProgressBar();
                }
            } else {
                this.set('showValidation', true);
            }
        },
        submitWithdrawalConfirmation() {
            this.set('showWithdrawalConfirmation', false);
            this.advanceToProgressBar();
        },
        hideWithdrawalConfirmation() {
            this.set('showWithdrawalConfirmation', false);
            this.set('withdrawal', false);
        },
        finish() {
            this.send('next');
        }
    },

    didInsertElement() {
        this._super(...arguments);
        // Alternate study ID method
        // let studyID = window.location.href.split('/').filter(piece => !!piece).slice(-2)[0];
        this.set('sharelink', 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flookit.mit.edu%2Fstudies%2F' + this.get('experiment').get('id') + '%2F');
        if (!this.get('showDatabraryOptions')) {
            this.set('databraryShare', 'NA');
        }
        if (this.get('privateLevelOnly')) {
            this.set('useOfMedia', 'private');
        }
    }
});
