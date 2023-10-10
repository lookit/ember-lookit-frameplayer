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
        optionalText:{
            type:'string'
        }
    },

    meta: {
        data: {
            type: 'object',
            properties: {}
        }
    },

    didReceiveAttrs() {
        const iframeSrc = this.get('frameConfig.iframeSrc');
        const hashChildId = this.get('session.hash_child_id');
        const responseId =  this.get('session.id');
        this.set('frameConfig.iframeSrc', addSearchParams(iframeSrc, responseId, hashChildId));
        this._super(...arguments);
    }

});
