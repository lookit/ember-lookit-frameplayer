import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('page-not-found', { path: '/*wildcard' });
  this.route('page-not-found');
  this.route('participate', {path: '/studies/:study_id/:child_id'});
  this.route('preview', {path: '/studies/:study_id/:child_id/preview'});
});

export default Router;
