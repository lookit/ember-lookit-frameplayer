/* jshint node: true */
'use strict';
var path = require('path');
var Funnel = require('broccoli-funnel');
var generate = require('broccoli-auto-generated');
var BroccoliMergeTrees = require('broccoli-merge-trees');

module.exports = {
    name: 'ember-lookit-frameplayer',

    config(env, baseConfig) {
        // Set default configuration to merge into the consuming application.
        // TODO: This keeps consuming apps from breaking outright, but if you override one you need to override all.
        // In the future we should implement, eg, initializers. Many of these current flags are ISP-specific.
        return {
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
    },

    isDevelopingAddon: function () {
        return true;
    },

    included: function (app) {
        this._super.included(app);
    },

    treeForPublic: function (app) {

        var config = {};

        return new BroccoliMergeTrees([
            new Funnel(path.join(path.resolve(this.root, ''), 'public/'), {
                srcDir: '/',
                destDir: '/',
                include: ['**/*.swf', '**/*.gif', '**/*.png', '**/*.jpg', '**/*.xml', '**/*.php']
            })
        ]);
    }
};

