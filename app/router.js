import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('participate', {path: '/studies/:study_id/:profile_id'});
  this.route('preview', {path: '/studies/:study_id/:profile_id/preview'});
  this.route('page-not-found', { path: '/*wildcard' });
  this.route('page-not-found');
});

export default Router;
