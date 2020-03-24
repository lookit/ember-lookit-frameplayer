import Participate from './participate';

// Adapted from Lookit participate route https://github.com/CenterForOpenScience/lookit/blob/develop/app/routes/participate.js
export default Participate.extend({
    _createStudyResponse() {
        const response = this._super();
        response.setProperties({
            isPreview: true
        });
        return response;
    }
});
