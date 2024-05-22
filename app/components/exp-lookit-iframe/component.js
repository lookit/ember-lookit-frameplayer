import layout from './template';
import ExpFrameBaseComponent from '../exp-frame-base/component';
import { addSearchParams } from '../../utils/add-search-params';


export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-iframe',
    layout: layout,

    frameSchemaProperties: {
        iframeSrc:{
            type:'string'
        },
        iframeHeight:{
            type:'string',
            default:"700px"
        },
        iframeWidth:{
            type:'string',
            default:'100%'
        },
        instructionText:{
            type:'string'
        },
        optionalExternalLink:{
            type:'boolean'
        },
        nextButtonText: {
            type: 'string',
            default: 'Next'
        },
        warningMessageText:{
            type: 'string',
            default: 'Please confirm that you have finished the task above! When you have finished, click the button to continue.'
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {}
        }
    },

    didReceiveAttrs() {
        // call super first in case iframeSrc comes from generateProperties
        this._super(...arguments);
        const iframeSrc = this.get('iframeSrc');
        const hashChildId = this.get('session.hash_child_id');
        const responseId =  this.get('session.id');
        this.set('iframeSrc', addSearchParams(iframeSrc, responseId, hashChildId));
    },

    didInsertElement() {
        this._super(...arguments);
        function enableNextbutton(){
            document.querySelector('#nextbutton').removeAttribute('disabled')
        }
        setTimeout(enableNextbutton, 3000);
        document.querySelector('iframe').onload = enableNextbutton
    }

});
