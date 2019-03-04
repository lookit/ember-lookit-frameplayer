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

