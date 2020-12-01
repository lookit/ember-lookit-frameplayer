import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';
import Ember from 'ember';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';

/**
 * @module exp-player
 * @submodule frames
 */

const Validations = buildValidations({
    birthDate: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    useOfMedia: validator('presence', {
        presence: true,
        message: 'This field is required',
        disabled: Ember.computed.readOnly('model.withdrawal')
    }),
    databraryShare: validator('presence', {
        presence: true,
        message: 'This field is required',
        disabled: Ember.computed.readOnly('model.withdrawal')
    })
});

/**
Standard exit survey for Lookit studies: confirm participant birthdate, ask user for video sharing permission level & Databrary sharing, option to withdraw, freeform comments, debriefing/thank you text. Leaves fullscreen mode.

```json
"frames": {
    "my-exit-survey": {
        "kind": "exp-lookit-exit-survey",
        "debriefing": {
            "title": "Thank you!",
            "text": "Learning how children react to ducks will help scientists design better rubber ducks.",
            "image": {
                "src": "https://s3.amazonaws.com/lookitcontents/ducks/duck.png",
                "alt": "Very cute duck"
            }
        }
    }
}
```

@class Exp-lookit-exit-survey
@extends Exp-frame-base

@uses Full-screen
@uses Validations
*/

export default ExpFrameBaseComponent.extend(Validations, FullScreen, {
    layout: layout,
    type: 'exp-lookit-exit-survey',
    frameType: 'EXIT',
    fullScreenElementId: 'experiment-player',
    frameSchemaProperties: {
        /**
        Object specifying information to show on second page of exit survey, before returning to main Lookit site.
        @property {Object} debriefing
            @param {String} title Title of debriefing page
            @param {String} text Paragraph to show as debriefing
            @param {Object} image Object specifying source URL [src] & alt-text [alt] for any image to show during debriefing (optional). Example: `{
        "src": "https://s3.amazonaws.com/lookitcontents/ducks/duck.png",
        "alt": "Very cute duck"
        }`
        */
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
                }
            }
        },
        /**
         * Whether to show a 'share this study on Facebook' button
         *
         * @property {Boolean} showShareButton
         * @default true
         */
        showShareButton: {
            type: 'boolean',
            description: 'Whether to show a \'share this study on Facebook\' button',
            default: true
        },
        additionalVideoPrivacyText: {
            type: 'string',
            default: '',
            description: 'Additional text to display under "Use of video clips and images:", before listing options'
        }
    },
    frameSchemaRequired: ['debriefing'],
    meta: {
        data: {
            type: 'object',
            properties: {
                /**
                * Child's birthdate as entered into exit survey; timestamp string starting YYYY-mm-dd.
                * @attribute birthDate
                */
                birthDate: {
                    type: 'string',
                    default: null
                },
                /**
                * Whether data can be shared with Databrary: 'yes' or 'no'
                * @attribute databraryShare
                */
                databraryShare: {
                    type: 'string'
                },
                /**
                * Video privacy level: 'private', 'scientific', or 'public'
                * @attribute useOfMedia
                */
                useOfMedia: {
                    type: 'string'
                },
                /**
                * Whether the the box to withdraw video data is checked
                * @attribute withdrawal
                */
                withdrawal: {
                    type: 'boolean',
                    default: false
                },
                /**
                * Freeform comments entered by parent
                * @attribute feedback
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
    }
});
