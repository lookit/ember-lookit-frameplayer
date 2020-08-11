import Ember from 'ember';

var frameNamePattern = new RegExp(/^exp(?:-\w+)+$/);
var urlPattern = /^(URL|JSON):(.*)$/;

import randomizers from '../randomizers/index';
import Substituter from './replace-values';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

var ExperimentParser = function (context = {
    pastSessions: [],
    structure: {
        frames: {},
        sequence: []
    },
    child: {},
    useGenerator: false,
    generator: ''
}) {
    this.pastSessions = context.pastSessions;
    this.frames = context.structure.frames;
    this.sequence = context.structure.sequence;
    this.child = context.child;
    this.useGenerator = context.useGenerator;
    this.generator = context.generator;
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
        throw `Parse error: Randomizer ${randomizer} not recognized in frame ${frameId}. In any 'choice' frame, the 'sampler' property must be set to one of the available randomizers: ${Object.keys(randomizers)}`;
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
 * Provide EITHER frameId (index into this.frames) or frame object (with frameId null)
 */
ExperimentParser.prototype._resolveFrame = function (frameId, frame) {
    try {
        if (frameId && !frame) {
            if (!this.frames.hasOwnProperty(frameId)) {
                console.error(`Parse error: Experiment sequence includes an undefined frame '${frameId}'. Each element of the 'sequence' in your study JSON must also be a key in the 'frames'. The frames you can use are: ${Object.keys(this.frames)}`);
            }
        }

        frame = frame || this.frames[frameId];
        if (frame && frame.parameters) { // Allow use of parameters to set kind
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
                Ember.$.extend(thisFrame, frame.commonFrameProperties || {}); // NOT deep-copying so we can recognize instances of the same list
                Ember.$.extend(thisFrame, fr);
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
            throw `Parse error: Experiment definition specifies an unknown kind of frame: ${frame.kind}. Frame kind should be one of 'group', 'choice', or 'exp-<specific-frame-name>'.`;
        }
    } catch (error) {
        console.error(error);
    }
};
ExperimentParser.prototype.parse = function (prependFrameInds = true) {
    var expFrames = [];
    var choices = {};

    // First, if useGenerator & generator defined, generate the sequence & frames.
    if (this.useGenerator) {
        var generatedStructure = {};
        try {
            new Function(this.generator)();
            try {
                let generatorFn = new Function('return ' + this.generator)();
                assert(typeof generatorFn === 'function');
                generatedStructure = generatorFn(this.child, this.pastSessions);
                try {
                    assert(generatedStructure.hasOwnProperty('frames'));
                    assert(generatedStructure.hasOwnProperty('sequence'));
                } catch (error) {
                    this.useGenerator = false;
                    console.error(error);
                    console.warn('Generator function does not return an object with "sequence" and "frames" fields.');
                }
            } catch (error) {
                this.useGenerator = false;
                console.error(error);
                console.warn('Generator function does not evaluate to single function, or error upon calling function. Falling back to standard protocol definition.');
            }
        } catch (error) {
            this.useGenerator = false;
            console.error(error);
            console.warn('Generator function provided is not valid Javascript. Falling back to standard protocol definition.');
        } finally {
            if (this.useGenerator) {
                console.log('Using generator function in place of standard protocol definition.');
                this.sequence = generatedStructure.sequence;
                this.frames = generatedStructure.frames;
            }
        }
    }
    // After generating, process exactly as if these had been provided as a standard protocol.

    this.sequence.forEach((frameId, index) => {
        var [resolved, choice] = this._resolveFrame(frameId);
        expFrames.push(...resolved);
        if (choice) {
            choices[`${index}-${frameId}`] = choice;
        }
    });

    // Basic checks to warn about unusual sequences
    var frameKinds = expFrames.map(frame => frame.kind);
    var nFrames = expFrames.length;
    if (nFrames > 0 && frameKinds[0] != 'exp-video-config') {
        console.warn('Parse warning: First frame is not an exp-video-config frame. Lookit recommends starting with an exp-video-config frame to help participants set up their webcams. If you are testing out a subset of your study, or using a custom replacement for exp-video-config, you can disregard this warning.');
    }
    if (!(frameKinds.includes('exp-lookit-video-consent') || frameKinds.includes('exp-video-consent'))) {
        console.warn('Parse warning: No consent frame detected. All studies must include a consent frame such as exp-lookit-video-consent. If you are testing out a subset of your study or have received approval to use a custom replacement for exp-lookit-video-consent, you can disregard this warning.');
    }
    if (frameKinds[nFrames - 1] != 'exp-lookit-exit-survey') {
        console.warn('Parse warning: Last frame of study is not an exp-lookit-exit-survey frame. All studies must end with an exit survey including video permission level and an option to withdraw video. If you are testing out a subset of your study or have received approval to use a custom replacement for exp-lookit-exit-survey, you can disregard this warning.');
    }

    return [
        expFrames.map((frame, index) => this._reformatFrame(frame, index, prependFrameInds)),
        choices
    ];
};
export default ExperimentParser;
