/* eslint-env node */
/* jshint node:true */
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var nodeSass = require('node-sass'); // yarn install sometimes fails to create the 'vendor'
// directory in node_modules/node-sass; using yarn install --force makes it work if you're
// seeing Could not require 'ember-cli-build.js': ENOENT: no such file or directory,
// scandir 'ember-lookit-frameplayer/node_modules/node-sass/vendor'
// (per https://github.com/yarnpkg/yarn/issues/4867)
require('dotenv').config();
module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
          sourcemaps: {
              enabled: true
          },
          sassOptions: {
            implementation: nodeSass
          },
          minifyJS: {
              enabled: EmberApp.env() === 'production'
          },
          minifyCSS: {
              enabled: EmberApp.env() === 'production'
          },
          'ember-bootstrap': {
            importBootstrapFont: true,
            'bootstrapVersion': 3,
            'importBootstrapCSS': true
          },
          'ember-bootstrap-datetimepicker': {
              importBootstrapCSS: false
          },
          fingerprint: {
              prepend: '',
              exclude: ['apple-touch-icon', 'favicon', 'mstile'],
          },
          'ember-cli-dynamic-forms': {
              includeBootstrapAssets: false
          },
          'ember-cli-template-lint': {
              testGenerator: 'qunit' // or 'mocha', etc.
          }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
