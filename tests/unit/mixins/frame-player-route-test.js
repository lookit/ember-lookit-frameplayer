import Ember from 'ember';
import FramePlayerRouteMixin from 'ember-lookit-frame-player/mixins/frame-player-route';
import { module, test } from 'qunit';

module('Unit | Mixin | frame player route');

// Replace this with your real tests.
test('it works', function(assert) {
  let FramePlayerRouteObject = Ember.Object.extend(FramePlayerRouteMixin);
  let subject = FramePlayerRouteObject.create();
  assert.ok(subject);
});
