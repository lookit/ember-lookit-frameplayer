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

test('parser applies parameters to single frame as expected', function(assert) {

    var simpleParameterExperiment = {
        structure: {
            frames: {
                testFrame: {
                    id: 'first-test-trial',
                    kind: 'FRAME_KIND',
                    blocks: [
                        {
                            'text': 'Hello and welcome to the study'
                        }
                    ],
                    parameters: {
                        FRAME_KIND: 'exp-lookit-text'
                    }
                }
            },
            sequence: [
                'testFrame'
            ]
        },
        pastSessions: []
    };



    var experiment = $.extend(true, {}, simpleParameterExperiment);
    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];
    assert.deepEqual(result[0].kind, 'exp-lookit-text', 'FRAME_TYPE parameter should be substituted in for kind');
});

test('parser creates frame group as expected', function(assert) {

    var parameterReplacesCommonPropertiesInGroup = {
        structure: {
            frames: {
                testFrameGroup: {
                    kind: 'group',
                    frameList: [
                        {
                            id: 'first-test-trial',
                            blocks: [
                                {
                                    text: 'Hello and welcome to the study'
                                }
                            ]
                        },
                        {
                            id: 'second-test-trial',
                            blocks: [
                                {
                                    text: 'Some more info'
                                }
                            ]
                        }
                    ],
                    commonFrameProperties: {
                        kind:  'exp-lookit-text'
                    }
                }
            },
            sequence: [
                'testFrameGroup'
            ]
        },
        pastSessions: []
    };

    var experiment = $.extend(true, {}, parameterReplacesCommonPropertiesInGroup);
    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];
    assert.equal(result.length, 2);
    var expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-text']);
    assert.deepEqual(result[0].blocks, [
                                {
                                    text: 'Hello and welcome to the study'
                                }
                            ]);
    assert.deepEqual(result[1].blocks, [
                                {
                                    text: 'Some more info'
                                }
                            ]);

});

test('parser applies parameters to frame group as expected', function(assert) {

    var parameterReplacesCommonPropertiesInGroup = {
        structure: {
            frames: {
                testFrameGroup: {
                    kind: 'group',
                    frameList: [
                        {
                            id: 'first-test-trial',
                            blocks: [
                                {
                                    text: 'Hello and welcome to the study'
                                },
                                {
                                    text: 'EXTRA_PARAGRAPH'
                                }
                            ],
                            parameters: {
                                EXTRA_PARAGRAPH: 'This is special first-page text'
                            }
                        },
                        {
                            id: 'second-test-trial',
                            blocks: [
                                {
                                    text: 'Some more info'
                                }
                            ]
                        }
                    ],
                    parameters: {
                        FRAME_TYPE: 'exp-lookit-text'
                    },
                    commonFrameProperties: {
                        kind: 'FRAME_TYPE'
                    }
                }
            },
            sequence: [
                'testFrameGroup'
            ]
        },
        pastSessions: []
    };

    var experiment = $.extend(true, {}, parameterReplacesCommonPropertiesInGroup);
    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];
    assert.equal(result.length, 2);
    var expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-text']);
    assert.deepEqual(result[0].blocks, [
                                {
                                    text: 'Hello and welcome to the study'
                                },
                                {
                                    text: 'This is special first-page text'
                                }
                            ]);
    assert.deepEqual(result[1].blocks, [
                                {
                                    text: 'Some more info'
                                }
                            ]);

});


test('parser propagates properties through randomizer as expected', function(assert) {

    var parametersAndRandomizer = {
        structure: {
            'frames': {
                'testFrameSet': {
                    'kind': 'choice',
                    'sampler': 'random-parameter-set',
                    'frameList': [
                        {
                            'kind': 'group',
                            'frameList': [
                                {
                                    'id': 'first-test-trial',
                                    'blocks': [
                                        {
                                            'text': 'CONDITION'
                                        },
                                        {
                                            'text': 'MIDDLE_PARAGRAPH'
                                        },
                                        {
                                            'text': 'EXTRA_PARAGRAPH'
                                        },
                                        {
                                            'text': 'part 1'
                                        }
                                    ],
                                    'parameters': {
                                        'EXTRA_PARAGRAPH': 'This is special first-page text'
                                    }
                                },
                                {
                                    'id': 'second-test-trial',
                                    'blocks': [
                                        {
                                            'text': 'CONDITION'
                                        },
                                        {
                                            'text': 'MIDDLE_PARAGRAPH'
                                        },
                                        {
                                            'text': 'part 2'
                                        }
                                    ]
                                }
                            ],
                            'parameters': {
                                'FRAME_TYPE': 'exp-lookit-text'
                            },
                            'commonFrameProperties': {
                                'kind': 'FRAME_TYPE'
                            }
                        }
                    ],
                    'parameterSets': [
                        {
                            'CONDITION': 'A'
                        },
                        {
                            'CONDITION': 'A'
                        }
                    ],
                    'parameterSetWeights': [
                        {
                            'maxAge': 365,
                            'minAge': 0,
                            'weights': [
                                1,
                                1
                            ]
                        },
                        {
                            'maxAge': 5000,
                            'minAge': 365,
                            'weights': [
                                1,
                                1
                            ]
                        }
                    ],
                    'commonFrameProperties': {
                        'parameters': {
                            'MIDDLE_PARAGRAPH': 'This is a really exciting paragraph!'
                        }
                    }
                }
            },
            'sequence': [
                'testFrameSet'
            ]
        },
        pastSessions: []
    };

    var experiment = $.extend(true, {}, parametersAndRandomizer);
    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];
    assert.equal(result.length, 2);
    var expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-text']);
    assert.deepEqual(result[0].blocks, [
                                        {
                                            'text': 'A'
                                        },
                                        {
                                            'text': 'This is a really exciting paragraph!'
                                        },
                                        {
                                            'text': 'This is special first-page text'
                                        },
                                        {
                                            'text': 'part 1'
                                        }
                                    ],);
    assert.deepEqual(result[1].blocks, [
                                        {
                                            'text': 'A'
                                        },
                                        {
                                            'text': 'This is a really exciting paragraph!'
                                        },
                                        {
                                            'text': 'part 2'
                                        }
                            ]);

});

