import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import layout from './template';


/**
 * @module exp-player
 * @submodule frames
 */

/**
 * TODO: short description of what your frame does. Include example usage below.
 *
```json
 "frames": {
    "test-trial": {
        "kind": "exp-your-frame-name",
        "id": "test-trial"
    }
 }

 * ```
 * @class ExpYourFrameName TODO: change to your actual frame name
 * @extends ExpFrameBase
 * @uses FullScreen TODO: add any mixins that your frame uses like this
 */

export default ExpFrameBaseComponent.extend({
    type: 'exp-test',
    layout: layout,
    meta: {
        name: 'ExpTest',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                // define configurable parameters of your frame here. Each should have
                // a YUIdoc comment as shown in the example below.

                /**
                 * Whether to show a picture of a cat.
                 *
                 * @property {Boolean} showCatPicture
                 * @default false
                 */
                title: {
                    type: 'string',
                    default: 'Consent',
                    description: 'Simple consent test form '
                },

                body: {

                    type: 'string',
                    default: 'Do you consent for study ?'

                },

                consentLabel: {

                    type: 'string',
                    default: 'I agree'
                }
            }
        },
        data: {
            /**
            * Parameters captured and sent to the server
            *
            * @method serializeContent
            * @param {String} exampleStoredData Some data about this frame
            */
            type: 'object',
            properties: {
                // define data to be sent to the server here
                consentGranted: {
                    type: 'boolean',
                    default: false
                }
            }
        }
    },
    actions: {
        // Define any actions that you need to be able to trigger from within the template here
    },

    // Other functions that are just called from within your frame can be defined here, on
    // the same level as actions and meta. You'll be able to call them as this.functionName(arguments)
    // rather than using this.send('actionName')

    // Anything that should happen immediately after loading your frame (see
    // https://guides.emberjs.com/release/components/the-component-lifecycle/ for other
    // hooks you can use and when they're all called). You can delete this if not doing
    // anything additional.
    didInsertElement() {
        this._super(...arguments);
    },

    // Anything that should happen before destroying your frame, e.g. removing a keypress
    // handlers. You can delete this if not doing anything additional.
    willDestroyElement() {
        this._super(...arguments);
    }
});
