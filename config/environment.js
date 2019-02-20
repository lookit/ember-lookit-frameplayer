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
        cdn: 'https://cdn.ravenjs.com/3.5.1/ember/raven.min.js',
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

    // TODO: remove these, not actually applicable on Lookit
    featureFlags: {
        // Whether to load existing expData into the exp-frames
        loadData: true,
        // Whether to validate survey forms
        validate: true,
        // Whether to redirect users who have already taken the study to an error page
        // Set to false to test study multiple times with the same account
        showStudyCompletedPage: true
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
  }

  if (environment === 'production') {

  }

  return ENV;
};
