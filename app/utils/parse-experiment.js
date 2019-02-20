import Ember from 'ember';

var frameNamePattern = new RegExp(/^exp(?:-\w+)+$/);
var urlPattern = /^(URL|JSON):(.*)$/;

import randomizers from '../randomizers/index';

var ExperimentParser = function (context = {
    pastSessions: [],
    structure: {
        frames: {},
        sequence: []
    }
}) {
    this.pastSessions = context.pastSessions;
    this.frames = context.structure.frames;
    this.sequence = context.structure.sequence;

};
/* Modifies the data in the experiment schema definition to match
 * the format expected by exp-player
 */
ExperimentParser.prototype._reformatFrame = function (frame, index) {
    var newConfig = Ember.copy(frame, true);
    newConfig.id = `${index}-${frame.id}`;
    return newConfig;
};
/* Convert a random frame to a list of constituent
 * frame config objects
 */
ExperimentParser.prototype._resolveRandom = function (frame, frameId) {
    var randomizer = frame.sampler || 'random';  // Random sampling by default
    if (!randomizers[randomizer]) {
        throw `Randomizer ${randomizer} not recognized`;
    } else {
        return randomizers[randomizer](
            frameId,
            frame,
            this.pastSessions,
            this._resolveFrame.bind(this)
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
        if (frameNamePattern.test(frame.kind)) {
            // Base case: this is a plain experiment frame
            frame.id = frame.id || frameId;
            return [[
                this._resolveDependencies(frame)
            ], null];
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
ExperimentParser.prototype.parse = function () {
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
        expFrames.map((frame, index) => this._reformatFrame(frame, index)),
        choices
    ];
};
export default ExperimentParser;
