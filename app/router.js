import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
    this.route('participate', {path: '/studies/:study_id/:participant_child_ids'});
});

export default Router;
