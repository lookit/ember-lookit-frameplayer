import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';

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
        disabled(model) {
            return model.get('withdrawal');
        }
    }),
    databraryShare: validator('presence', {
        presence: true,
        message: 'This field is required'
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

@class ExpLookitExitSurvey
@extends ExpFrameBase

@uses FullScreen
@uses Validations
*/

export default ExpFrameBaseComponent.extend(Validations, FullScreen, {
    layout: layout,
    type: 'exp-lookit-exit-survey',
    fullScreenElementId: 'experiment-player',
    meta: {
        name: 'ExpLookitExitSurvey',
        description: 'Exit survey for Lookit.',
        parameters: {
            type: 'object',
            properties: {
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
                required: ['debriefing']
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} birthDate Child's birthdate as entered into exit survey; timestamp string starting YYYY-mm-dd.
             * @param {String} databraryShare Whether data can be shared with Databrary: 'yes' or 'no'
             * @param {String} useOfMedia Video privacy level: 'private', 'scientific', or 'public'
             * @param {Boolean} withdrawal Whether the user checked the box to withdraw video data
             * @param {String} feedback Freeform comments entered by parent
             * @param {Object} eventTimings Only event captured during this frame is 'nextFrame'; example eventTimings value: `[{u'eventType': u'nextFrame', u'timestamp': u'2016-08-03T00:45:37.157Z'}]`
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                birthDate: {
                    type: 'string',
                    default: null
                },
                databraryShare: {
                    type: 'string'
                },
                useOfMedia: {
                    type: 'string'
                },
                withdrawal: {
                    type: 'boolean',
                    default: false
                },
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
    actions: {
        advanceToProgressBar() {
            // Move from section 1 (survey) to section 2 (progress bar/ finish button)
            // Mark the session complete at this stage, as all data has been entered
            this.sendAction('sessionCompleted');
            this._save()
                .then(()=> {
                    this.set('section1', false);
                })
                .catch(err => this.displayError(err));
        },
        continue() {
            // Check whether exit survey is valid, and if so, advance to next screen
            if (this.get('validations.isValid')) {
                if (this.get('withdrawal')) {
                    this.set('showWithdrawalConfirmation', true);
                } else {
                    this.send('advanceToProgressBar');
                }
            } else {
                this.set('showValidation', true);
            }
        },
        finish() {
            this.send('next');
        }
    },
    willRender() {
        this.send('exitFullscreen');
    }
});
