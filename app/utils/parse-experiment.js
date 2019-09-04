import Ember from 'ember';

var frameNamePattern = new RegExp(/^exp(?:-\w+)+$/);
var urlPattern = /^(URL|JSON):(.*)$/;

import randomizers from '../randomizers/index';
import Substituter from './replace-values';

var ExperimentParser = function (context = {
    pastSessions: [],
    structure: {
        frames: {},
        sequence: []
    },
    child: {}
}) {
    this.pastSessions = context.pastSessions;
    this.frames = context.structure.frames;
    this.sequence = context.structure.sequence;
    this.child = context.child;

};
/* Modifies the data in the experiment schema definition to match
 * the format expected by exp-player
 */
ExperimentParser.prototype._reformatFrame = function (frame, index, prependFrameInds = true) {
    var newConfig = Ember.copy(frame, true);
    if (prependFrameInds) {
        newConfig.id = `${index}-${frame.id}`;
    } else {
        newConfig.id = `${frame.id}`;
    }
    return newConfig;
};
/* Convert a random frame to a list of constituent
 * frame config objects
 */
ExperimentParser.prototype._resolveRandom = function (frame, frameId) {
    var randomizer = frame.sampler;
    if (!randomizers[randomizer]) {
        throw `Randomizer ${randomizer} not recognized`;
    } else {
        return randomizers[randomizer](
            frameId,
            frame,
            this.pastSessions,
            this._resolveFrame.bind(this),
            this.child
        );
    }
};
ExperimentParser.prototype._resolveDependencies = function (frame) {
    Object.keys(frame).forEach((key) => {
        var match = urlPattern.exec(frame[key]);
        if (match) {
            var opts = {
                type: 'GET',
                url: match.pop(),
                async: false,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            };
            var res = Ember.$.ajax(opts);
            if (frame[key].indexOf('JSON') === 0) {
                frame[key] = JSON.parse(res.responseText);
            } else {
                frame[key] = res.responseText;
            }
        }
    });
    return frame;
};

/* Convert any frame to a list of constituent frame config objects.
 * Centrally dispatches logic for all other frame types
 */
ExperimentParser.prototype._resolveFrame = function (frameId, frame) {
    try {
        frame = frame || this.frames[frameId];
        if (frame.parameters) {
            var substituter = new Substituter();
            frame = substituter.replaceValues(frame, frame.parameters);
        }
        if (frameNamePattern.test(frame.kind)) {
            // Base case: this is a plain experiment frame
            frame.id = frame.id || frameId;
            return [[
                this._resolveDependencies(frame)
            ], null];
        } else if (frame.kind === 'group') {
            var resolvedFrameList = [];
            var resolvedChoices = {};

            var thisFrame;
            frame.frameList.forEach((fr, index) => {
                thisFrame = {};
                Ember.$.extend(true, thisFrame, frame.commonFrameProperties || {});
                Ember.$.extend(true, thisFrame, fr);
                var [resolved, choice] = this._resolveFrame(null, thisFrame);
                resolvedFrameList.push(...resolved);
                if (choice) {
                    resolvedChoices[`${index}`] = choice;
                }
            });
            return [resolvedFrameList, resolvedChoices];
        } else if (frame.kind === 'choice') {
            return this._resolveRandom(frame, frameId);
        } else {
            console.log(`Experiment definition specifies an unknown kind of frame: ${frame.kind}`);
            throw `Experiment definition specifies an unknown kind of frame: ${frame.kind}`;
        }
    } catch (error) {
        console.error(error);
    }
};
ExperimentParser.prototype.parse = function (prependFrameInds = true) {
    var expFrames = [];
    var choices = {};
    this.sequence.forEach((frameId, index) => {
        var [resolved, choice] = this._resolveFrame(frameId);
        expFrames.push(...resolved);
        if (choice) {
            choices[`${index}-${frameId}`] = choice;
        }
    });
    return [
        expFrames.map((frame, index) => this._reformatFrame(frame, index, prependFrameInds)),
        choices
    ];
};
export default ExperimentParser;
