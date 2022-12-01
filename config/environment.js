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
        cdn: 'https://cdn.ravenjs.com/3.26.4/ember/raven.min.js', // probably unused
        development: process.env.SENTRY_DSN === ''
    },
    s3: {
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      bucket: process.env.S3_BUCKET
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
      // Host for API endpoint, e.g. http://localhost:8000 (you could also have https set up).
      ENV.APP.host = process.env.LOOKIT_API_HOST || 'http://localhost:8000';
      ENV.APP.apiKey = process.env.LOOKIT_API_KEY;
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
