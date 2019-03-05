/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ember-lookit-frameplayer',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    pipeLoc: process.env.PIPE_ACCOUNT_HASH,
    pipeEnv: process.env.PIPE_ENVIRONMENT,
    sentry: {
        dsn: process.env.SENTRY_DSN || '',
        cdn: 'https://cdn.ravenjs.com/3.26.4/ember/raven.min.js',
        development: process.env.SENTRY_DSN === ''
    },
    EmberENV: {
      EXTEND_PROTOTYPES: true,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    featureFlags: {
    }

  };


  if (environment === 'development') {
      ENV.host = 'http://localhost:8000';
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

  }

  if (environment === 'production') {

  }

  return ENV;
};
