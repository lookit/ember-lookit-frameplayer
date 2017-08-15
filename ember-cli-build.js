/* eslint-env node */
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
require('dotenv').config();
module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
          sourcemaps: {
              enabled: true
          },
          minifyJS: {
              enabled: EmberApp.env() === 'production'
          },
          minifyCSS: {
              enabled: EmberApp.env() === 'production'
          },
          emberWowza: {
              // Config for video recorder config
              asp: JSON.parse(process.env.WOWZA_ASP),
              // Config for actual video recording
              php: JSON.parse(process.env.WOWZA_PHP)
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
              prepend: ''
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
