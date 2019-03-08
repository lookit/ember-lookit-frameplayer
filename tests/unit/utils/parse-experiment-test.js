import $ from 'jquery';
import ExperimentParser from '../../../utils/parse-experiment';
import { module, test, skip } from 'qunit';

module('Unit | Utility | parse experiment');

var sampleBaseExperiment = {
    structure: {
        frames: {
            aVideo: {
                kind: 'exp-video'
            },
            aSound: {
                kind: 'exp-audio'
            },
            notMuchOfAChoice: { // randomizer
                kind: 'choice',
                sampler: 'permute',
                frameOptions: [{'kind': 'exp-consent'}]
            },
        }
    },
    pastSessions: []
};

test('parser two single frames stay single frames', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'aSound'];

    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];

    var expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-aVideo', '1-aSound']);
});

test('parser parses a single frame and randomizer', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'notMuchOfAChoice'];

    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];

    var expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-aVideo', '1-notMuchOfAChoice']);
});
