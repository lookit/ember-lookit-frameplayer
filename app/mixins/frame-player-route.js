import Ember from 'ember';
import loadAll from '../utils/load-relationship';

export default Ember.Mixin.create({
    _study: null,
    _child: null,
    _response: null,
    _pastResponses: Ember.A(),
    _getStudy(params) {
        return this.get('store').findRecord('study', params.study_id);
    },
    _getChild(params) {
        // Note: could handle case where child_id parameter is missing or invalid here and
        // generate an example child record.
        return this.get('store').findRecord('child', params.child_id);
    },
    _createStudyResponse() {
        let response = this.store.createRecord('response', {
            completed: false,
            expData: {},
            sequence: []
        });
        response.set('study', this.get('_study'));
        response.set('child', this.get('_child'));
        return response;
    },
    model(params) {
        return Ember.RSVP.Promise.resolve()
            .then(() => this._getStudy(params))
            .then((study) => {
                this.set('_study', study);
                console.log('Study: ' + study.id);
                return this._getChild(params);
            })
            .then((child) => {
                this.set('_child', child);
                console.log('Child: ' + child.id);
                return this._createStudyResponse().save();
            }).then((response) => {
                this.set('_response', response);
                // merge each page of previous responses into _pastResponses
                return loadAll(this.get('_study'), 'responses', this.get('_pastResponses'), { 'child': this.get('_child').id });
            }).then(() => {
                const response = this.get('_response');
                // WARNING: it seems to be necessary to re-set the response.study property
                // here or else response.study.id isn't available in the template if there
                // is more than one page of past responses - but we don't know why!!
                response.set('study', this.get('_study'));
                response.set('child', this.get('_child'));
                if (!this.get('_pastResponses').includes(response)) {
                    this.get('_pastResponses').pushObject(response);
                }
            })
            .catch((errors) => {
                window.console.log(errors);
                this.transitionTo('page-not-found');
            });
    },
    setupController(controller) {
        this._super(controller);
        controller.set('study', this.get('_study'));
        controller.set('child', this.get('_child'));
        controller.set('response', this.get('_response'));
        controller.set('pastResponses', this.get('_pastResponses'));
    }
});
