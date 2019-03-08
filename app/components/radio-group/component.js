import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
    options: null,
    value: null,
    labelLeft: null,
    labelRight: null
});
