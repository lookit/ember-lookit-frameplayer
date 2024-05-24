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

    confirmedContinue: false,

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
        // When the next button is first clicked, display the warning/confirmation message,
        // and then wait 2 sec before allowing another click.
        // On the subsequent button click, trigger the next frame action.
        let timer;
        document.querySelector("#nextbutton")
            .addEventListener('click', () => {
                if (!timer) {
                    document.querySelector("#warningmessage").style.visibility = "visible";
                    timer = setTimeout(() => {
                        this.confirmedContinue = true;
                    }, 2000);
                } 
                if (this.confirmedContinue) {
                    this.next();
                }
            });
        function enableNextbutton(){
            document.querySelector('#nextbutton').removeAttribute('disabled')
        }
        setTimeout(enableNextbutton, 3000);
        document.querySelector('iframe').onload = enableNextbutton
    }

});
