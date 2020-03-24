import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

Router.map(function() {
    this.route('preview', {path: '/exp/studies/:study_id/:child_id/preview'});
    this.route('participate', {path: '/studies/:study_id/:child_id'});
    this.route('page-not-found', { path: '/*wildcard' });
    this.route('page-not-found');
});

export default Router;
