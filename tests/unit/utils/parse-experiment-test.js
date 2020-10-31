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


test('parser parses two single frames and they stay single frames', function(assert) {
    let experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'aSound'];

    const parser = new ExperimentParser(experiment);
    const result = parser.parse()[0];

    const expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-aVideo', '1-aSound']);
});


test('parser parses a single frame and randomizer', function(assert) {
    let experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'notMuchOfAChoice'];

    const parser = new ExperimentParser(experiment);
    const result = parser.parse()[0];

    const expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-aVideo', '1-notMuchOfAChoice']);
});


test('parser errors on frame id with _', function(assert) {
    let experiment = {
        structure: {
            frames: {
                video_frame: {
                    kind: 'exp-video'
                }
            },
            sequence: ['video_frame']
        },
        pastSessions: []
    };

    let parser = new ExperimentParser(experiment);

    assert.throws(parser.parse, 'Underscore allowed in frame ID; should only allow alphanumeric, -, ., space');
});

test('parser errors on frame id with /', function(assert) {
    let experiment = {
        structure: {
            frames: {
                'video/frame': {
                    kind: 'exp-video'
                }
            },
            sequence: ['video/frame']
        },
        pastSessions: []
    };

    let parser = new ExperimentParser(experiment);

    assert.throws(parser.parse, 'Slash allowed in frame ID; should only allow alphanumeric, -, ., space');
});

test('parser errors on frame id with special character', function(assert) {
    let experiment = {
        structure: {
            frames: {
                'video@frame': {
                    kind: 'exp-video'
                }
            },
            sequence: ['video@frame']
        },
        pastSessions: []
    };

    let parser = new ExperimentParser(experiment);

    assert.throws(parser.parse, '@ allowed in frame ID; should only allow alphanumeric, -, ., space');
});

test('parser allows frame id with space, dash, ., numbers', function(assert) {
    let experiment = {
        structure: {
            frames: {
                'video-frame.3 special': {
                    kind: 'exp-video'
                }
            },
            sequence: ['video-frame.3 special']
        },
        pastSessions: []
    };

    const parser = new ExperimentParser(experiment);
    const result = parser.parse()[0];

    const expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-video-frame.3 special']);
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


test('parser applies nested randomization using parameters', function(assert) {

    var nestedParameterization = {
        structure: {
            "frames": {
                "test-trials": {
                    "kind": "group",
                    "frameList": [
                        {
                            "kind": "group",
                            "frameList": [
                                {
                                    "kind": "group",
                                    "frameList": [
                                        {
                                            "kind": "exp-lookit-images-audio",
                                            "images": [
                                                {
                                                    "id": "option1",
                                                    "src": "CATEGORY1#UNIQ",
                                                    "position": "POSITIONLIST#UNIQ"
                                                },
                                                {
                                                    "id": "option2",
                                                    "src": "CATEGORY2#UNIQ",
                                                    "position": "POSITIONLIST#UNIQ"
                                                }
                                            ],
                                            "parameters": {
                                                "POSITIONLIST": ["left", "right"],
                                                "CATEGORY1": "CATEGORYPAIRING#0",
                                                "CATEGORY2": "CATEGORYPAIRING#1"
                                            }
                                        }
                                    ],
                                    "parameters": {
                                        "CATEGORYPAIRING": "CATEGORYPAIRINGOPTIONS#UNIQ"
                                    }
                                },
                                {
                                    "kind": "group",
                                    "frameList": [
                                        {
                                            "kind": "exp-lookit-images-audio",
                                            "images": [
                                                {
                                                    "id": "option1",
                                                    "src": "CATEGORY1#UNIQ",
                                                    "position": "POSITIONLIST#UNIQ"
                                                },
                                                {
                                                    "id": "option2",
                                                    "src": "CATEGORY2#UNIQ",
                                                    "position": "POSITIONLIST#UNIQ"
                                                }
                                            ],
                                            "parameters": {
                                                "POSITIONLIST": ["left", "right"],
                                                "CATEGORY1": "CATEGORYPAIRING#0",
                                                "CATEGORY2": "CATEGORYPAIRING#1"
                                            }
                                        }
                                    ],
                                    "parameters": {
                                        "CATEGORYPAIRING": "CATEGORYPAIRINGOPTIONS#UNIQ"
                                    }
                                }
                            ],
                            "parameters": {
                                "A": ["imageA1.jpg", "imageA2.jpg", "imageA3.jpg", "imageA4.jpg"],
                                "B": ["imageB1.jpg", "imageB2.jpg", "imageB3.jpg", "imageB4.jpg"],
                                "C": ["imageC1.jpg", "imageC2.jpg", "imageC3.jpg", "imageC4.jpg"]
                            }
                        }
                    ],
                    "parameters": {
                        "CATEGORYPAIRINGOPTIONS": [["A", "B"], ["A", "B"], ["B", "C"], ["B", "C"], ["A", "C"], ["A", "C"]],
                    }
                }
            },
            "sequence": [
                "test-trials"
            ]
        },
        pastSessions: []
    };

    var experiment = $.extend(true, {}, nestedParameterization);
    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];
    assert.equal(result.length, 2);
    var expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ["exp-lookit-images-audio", "exp-lookit-images-audio"]);

    // pairing from different categories
    assert.notEqual(result[0].images[0].src.slice(0,6), result[0].images[1].src.slice(0,6));
    // pairing in different positions
    assert.notEqual(result[0].images[0].position, result[0].images[1].position);
    // substituted all the way down to image filenames
    assert.equal(result[0].images[0].src.slice(0,5), "image");
    assert.equal(result[0].images[1].src.slice(0,5), "image");

});


// The below establishes the problems with using complex nested randomizers to e.g.
// use unique stimuli throughout the study.
skip('parser applies nested randomization using parameters', function(assert) {

    var nRepeatedUniqOptions = 0;
    var nLeftFirst = 0;
    var nRightFirst = 0;
    var allSamePositionWithinParse = 0;

    for (var i=0; i<100; i++) {
        var nestedParameterization = {
            structure: {
                "frames": {
                    "test-trial-4": {
                        "kind": "group",
                        "frameList": [
                            {
                                "kind": "group",
                                "frameList": [
                                    {
                                        "kind": "group",
                                        "frameList": [
                                            {
                                                "kind": "group",
                                                "frameList": [
                                                    {
                                                        "kind": "group",
                                                        "frameList": [
                                                            {
                                                                "kind": "group",
                                                                "frameList": [
                                                                    {
                                                                        "kind": "group",
                                                                        "frameList": [
                                                                            {
                                                                                "kind": "exp-lookit-images-audio",
                                                                                "audio": "AUDIO#0",
                                                                                "images": [
                                                                                    {
                                                                                        "id": "option1-test",
                                                                                        "src": "OBJECT1",
                                                                                        "position": "POSITION1"
                                                                                    },
                                                                                    {
                                                                                        "id": "option2-test",
                                                                                        "src": "OBJECT2",
                                                                                        "position": "POSITION2"
                                                                                    }
                                                                                ],
                                                                                "baseDir": "https://raw.githubusercontent.com/schang198/lookit-stimuli-template/master/",
                                                                                "pageColor": "gray",
                                                                                "audioTypes": [
                                                                                    "mp3"
                                                                                ],
                                                                                "parameters": {
                                                                                    "AUDIO": "TRIAL1_CATEGORYPAIRING#2",
                                                                                    "OBJECT1": "ITEM1",
                                                                                    "OBJECT2": "ITEM2",
                                                                                    "POSITION1": "POSITIONPAIRING#0",
                                                                                    "POSITION2": "POSITIONPAIRING#1"
                                                                                },
                                                                                "autoProceed": true
                                                                            }
                                                                        ],
                                                                        "parameters": {
                                                                            "ITEM1": "TRIAL1_IMAGE1",
                                                                            "ITEM2": "TRIAL1_IMAGE2",
                                                                            "POSITIONPAIRING": "POSITIONPAIRINGOPTIONS#RAND"
                                                                        }
                                                                    },
                                                                    {
                                                                        "kind": "group",
                                                                        "frameList": [
                                                                            {
                                                                                "kind": "exp-lookit-images-audio",
                                                                                "audio": "AUDIO#0",
                                                                                "images": [
                                                                                    {
                                                                                        "id": "option1-test",
                                                                                        "src": "OBJECT1",
                                                                                        "position": "POSITION1"
                                                                                    },
                                                                                    {
                                                                                        "id": "option2-test",
                                                                                        "src": "OBJECT2",
                                                                                        "position": "POSITION2"
                                                                                    }
                                                                                ],
                                                                                "baseDir": "https://raw.githubusercontent.com/schang198/lookit-stimuli-template/master/",
                                                                                "pageColor": "gray",
                                                                                "audioTypes": [
                                                                                    "mp3"
                                                                                ],
                                                                                "parameters": {
                                                                                    "AUDIO": "TRIAL2_CATEGORYPAIRING#2",
                                                                                    "OBJECT1": "ITEM1",
                                                                                    "OBJECT2": "ITEM2",
                                                                                    "POSITION1": "POSITIONPAIRING#0",
                                                                                    "POSITION2": "POSITIONPAIRING#1"
                                                                                },
                                                                                "autoProceed": true
                                                                            },

                                                                        ],
                                                                        "parameters": {
                                                                            "ITEM1": "TRIAL2_IMAGE1",
                                                                            "ITEM2": "TRIAL2_IMAGE2",
                                                                            "POSITIONPAIRING": "POSITIONPAIRINGOPTIONS#RAND"
                                                                        }
                                                                    },
                                                                    {
                                                                        "kind": "group",
                                                                        "frameList": [
                                                                            {
                                                                                "kind": "exp-lookit-images-audio",
                                                                                "audio": "AUDIO#0",
                                                                                "images": [
                                                                                    {
                                                                                        "id": "option1-test",
                                                                                        "src": "OBJECT1",
                                                                                        "position": "POSITION1"
                                                                                    },
                                                                                    {
                                                                                        "id": "option2-test",
                                                                                        "src": "OBJECT2",
                                                                                        "position": "POSITION2"
                                                                                    }
                                                                                ],
                                                                                "baseDir": "https://raw.githubusercontent.com/schang198/lookit-stimuli-template/master/",
                                                                                "pageColor": "gray",
                                                                                "audioTypes": [
                                                                                    "mp3"
                                                                                ],
                                                                                "parameters": {
                                                                                    "AUDIO": "TRIAL3_CATEGORYPAIRING#2",
                                                                                    "OBJECT1": "ITEM1",
                                                                                    "OBJECT2": "ITEM2",
                                                                                    "POSITION1": "POSITIONPAIRING#0",
                                                                                    "POSITION2": "POSITIONPAIRING#1"
                                                                                },
                                                                                "autoProceed": true
                                                                            },

                                                                        ],
                                                                        "parameters": {
                                                                            "ITEM1": "TRIAL3_IMAGE1",
                                                                            "ITEM2": "TRIAL3_IMAGE2",
                                                                            "POSITIONPAIRING": "POSITIONPAIRINGOPTIONS#RAND"
                                                                        }
                                                                    },
                                                                    {
                                                                        "kind": "group",
                                                                        "frameList": [
                                                                            {
                                                                                "kind": "exp-lookit-images-audio",
                                                                                "audio": "AUDIO#0",
                                                                                "images": [
                                                                                    {
                                                                                        "id": "option1-test",
                                                                                        "src": "OBJECT1",
                                                                                        "position": "POSITION1"
                                                                                    },
                                                                                    {
                                                                                        "id": "option2-test",
                                                                                        "src": "OBJECT2",
                                                                                        "position": "POSITION2"
                                                                                    }
                                                                                ],
                                                                                "baseDir": "https://raw.githubusercontent.com/schang198/lookit-stimuli-template/master/",
                                                                                "pageColor": "gray",
                                                                                "audioTypes": [
                                                                                    "mp3"
                                                                                ],
                                                                                "parameters": {
                                                                                    "AUDIO": "TRIAL4_CATEGORYPAIRING#2",
                                                                                    "OBJECT1": "ITEM1",
                                                                                    "OBJECT2": "ITEM2",
                                                                                    "POSITION1": "POSITIONPAIRING#0",
                                                                                    "POSITION2": "POSITIONPAIRING#1"
                                                                                },
                                                                                "autoProceed": true
                                                                            },

                                                                        ],
                                                                        "parameters": {
                                                                            "ITEM1": "TRIAL4_IMAGE1",
                                                                            "ITEM2": "TRIAL4_IMAGE2",
                                                                            "POSITIONPAIRING": "POSITIONPAIRINGOPTIONS#RAND"
                                                                        }
                                                                    }
                                                                ],
                                                                "parameters": {
                                                                    "TRIAL1_IMAGE1": "TRIAL1_CATEGORY1#UNIQ",
                                                                    "TRIAL1_IMAGE2": "TRIAL1_CATEGORY2#UNIQ",
                                                                    "TRIAL2_IMAGE1": "TRIAL2_CATEGORY1#UNIQ",
                                                                    "TRIAL2_IMAGE2": "TRIAL2_CATEGORY2#UNIQ",
                                                                    "TRIAL3_IMAGE1": "TRIAL3_CATEGORY1#UNIQ",
                                                                    "TRIAL3_IMAGE2": "TRIAL3_CATEGORY2#UNIQ",
                                                                    "TRIAL4_IMAGE1": "TRIAL4_CATEGORY1#UNIQ",
                                                                    "TRIAL4_IMAGE2": "TRIAL4_CATEGORY2#UNIQ"
                                                                }
                                                            }
                                                        ],
                                                        "parameters": {
                                                            "TRIAL1_CATEGORY1": "TRIAL1_CATEGORYPAIRING#0",
                                                            "TRIAL1_CATEGORY2": "TRIAL1_CATEGORYPAIRING#1",
                                                            "TRIAL2_CATEGORY1": "TRIAL2_CATEGORYPAIRING#0",
                                                            "TRIAL2_CATEGORY2": "TRIAL2_CATEGORYPAIRING#1",
                                                            "TRIAL3_CATEGORY1": "TRIAL3_CATEGORYPAIRING#0",
                                                            "TRIAL3_CATEGORY2": "TRIAL3_CATEGORYPAIRING#1",
                                                            "TRIAL4_CATEGORY1": "TRIAL4_CATEGORYPAIRING#0",
                                                            "TRIAL4_CATEGORY2": "TRIAL4_CATEGORYPAIRING#1"
                                                        }
                                                    }
                                                ],
                                                "parameters": {
                                                    "TRIAL1_CATEGORYPAIRING": "CATEGORYPAIRINGOPTIONS#0",
                                                    "TRIAL2_CATEGORYPAIRING": "CATEGORYPAIRINGOPTIONS#1",
                                                    "TRIAL3_CATEGORYPAIRING": "CATEGORYPAIRINGOPTIONS#2",
                                                    "TRIAL4_CATEGORYPAIRING": "CATEGORYPAIRINGOPTIONS#3"
                                                }
                                            }
                                        ],
                                        "parameters": {
                                            "CATEGORYPAIRINGOPTIONS": "CATEGORYPAIRINGLIST#PERM",
                                            "POSITIONPAIRINGOPTIONS": [
                                                "P",
                                                "Q"
                                            ]
                                        }
                                    }
                                ],
                                "parameters": {
                                    "CATEGORYPAIRINGLIST": [
                                        [
                                            "A",
                                            "B",
                                            "X"
                                        ],
                                        [
                                            "A",
                                            "B",
                                            "Y"
                                        ],
                                        [
                                            "B",
                                            "C",
                                            "Y"
                                        ],
                                        [
                                            "B",
                                            "C",
                                            "Z"
                                        ],
                                        [
                                            "A",
                                            "C",
                                            "X"
                                        ],
                                        [
                                            "A",
                                            "C",
                                            "Z"
                                        ]
                                    ]
                                }
                            }
                        ],
                        "parameters": {
                            "A": [
                                "Adorable_1.png",
                                "Adorable_2.png",
                                "Adorable_3.png",
                                "Adorable_4.png"
                            ],
                            "B": [
                                "Delicious_1.png",
                                "Delicious_2.png",
                                "Delicious_3.png",
                                "Delicious_4.png"
                            ],
                            "C": [
                                "Exciting_1.png",
                                "Exciting_2.png",
                                "Exciting_3.png",
                                "Exciting_4.png"
                            ],
                            "P": [
                                "left",
                                "right"
                            ],
                            "Q": [
                                "right",
                                "left"
                            ],
                            "X": [
                                "Adorable"
                            ],
                            "Y": [
                                "Delicious"
                            ],
                            "Z": [
                                "Exciting"
                            ]
                        }
                    }
                },
                "sequence": ["test-trial-4"]
            },
            pastSessions: []
        };
        var experiment = $.extend(true, {}, nestedParameterization);
        var parser = new ExperimentParser(experiment);
        var frames = parser.parse()[0];
        assert.equal(frames.length, 4);
        var expKinds = frames.map((item) => item.kind);
        assert.deepEqual(expKinds, ["exp-lookit-images-audio", "exp-lookit-images-audio", "exp-lookit-images-audio", "exp-lookit-images-audio"]);
        var allImages = [
            frames[0].images[0].src,
            frames[0].images[1].src,
            frames[1].images[0].src,
            frames[1].images[1].src,
            frames[2].images[0].src,
            frames[2].images[1].src,
            frames[3].images[0].src,
            frames[3].images[1].src
        ];
        console.log(allImages);
        for (var iImage=0; iImage<allImages.length; iImage++) {
            if (allImages.indexOf(allImages[iImage], iImage+1) !== -1) {
                nRepeatedUniqOptions++;
            }
            assert.equal(allImages[iImage].slice(-4), '.png');  // substitute all the way down to image filename
        }

        var nLeftFirstThisParse = 0;
        for (var iFrame=0; iFrame<4; iFrame++) {
            var positions = [frames[iFrame].images[0].position, frames[iFrame].images[1].position];
            assert.deepEqual(positions.sort(), ['left', 'right']);
            if (positions[0] == 'left') {
                nLeftFirst++;
                nLeftFirstThisParse++;
            } else {
                nRightFirst++;
            }
        }
        if (nLeftFirstThisParse == 0 || nLeftFirstThisParse == 4) {
            allSamePositionWithinParse++;
        }
    }
    // use of UNIQ across frames should always select different values. Chance level ~90/100
    assert.equal(nRepeatedUniqOptions, 0, 'Options were repeated when using UNIQ');
    // Make sure we do randomize and not always use left, right or right, left
    assert.notEqual(nLeftFirst, 0, 'Left was never used first but should have been randomly chosen');
    assert.notEqual(nRightFirst, 0, 'Right was never used first but should have been randomly chosen');
    // Make sure we don't always use left, right or right, left WITHIN SINGLE PARSE
    assert.notEqual(allSamePositionWithinParse, 0, 'left, right position not selected randomly per frame (always at least one of each version)');
    assert.notEqual(allSamePositionWithinParse, 100, 'left, right position not selected randomly per frame (always the same within a given parsing)');
});


test('parser does not apply generator function when useGenerator is false', function(assert) {

    let simple_generator = `function generateProtocol2(child, pastSessions) {
        // Define frames that will be used for both the baby and toddler versions of the study
        let frames = {
            "video-config": {
                "kind": "exp-video-config",
                "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to email the XYZ lab at xyz@abc.edu and we'd be glad to help out!"
            },
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "text": "generated survey text"
                }
            }
        }

        let frame_sequence = ['generated-video-config', 'generated-exit-survey']

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: frames,
            sequence: frame_sequence
        };
    }
    `;

    let experiment = {
        structure: {
            frames: {
                "json-config": {
                    "kind": "exp-video-config",
                    "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to email the XYZ lab at xyz@abc.edu and we'd be glad to help out!"
                },
                "json-exit-survey": {
                    "kind": "exp-lookit-exit-survey",
                    "debriefing": {
                        "text": "json survey text"
                    }
                }
            },
            sequence: ["json-config", "json-exit-survey"]
        },
        pastSessions: [],
        generator: simple_generator,
        useGenerator: false,
        child: new Ember.Object()
    };

    // Check that it uses the JSON version
    let parser = new ExperimentParser(experiment);
    let result = parser.parse()[0];
    let expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-video-config', 'exp-lookit-exit-survey'], 'Incorrect frame types when using json rather than generator function');
    let expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-json-config', '1-json-exit-survey'], 'Incorrect frame IDs when using json rather than generator function');
    assert.equal(result[1].debriefing.text, "json survey text", 'Incorrect frame data when using json rather than generator function');
});


test('parser falls back to structure if generator is invalid', function(assert) {

    let simple_generator_invalid = `function generateProtocol2(child, pastSessions) {
        // Define frames that will be used for both the baby and toddler versions of the study
        let frames = {
            "video-config": {
                "kind": "exp-video-config",
                "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to email the XYZ lab at xyz@abc.edu and we'd be glad to help out!"
            },
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "text": "generated survey text"
                }
            }
        }

        // typo in let
        leg frame_sequence = ['generated-video-config', 'generated-exit-survey']

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: frames,
            sequence: frame_sequence
        };
    }
    `;

    let experiment = {
        structure: {
            frames: {
                "json-config": {
                    "kind": "exp-video-config",
                    "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to email the XYZ lab at xyz@abc.edu and we'd be glad to help out!"
                },
                "json-exit-survey": {
                    "kind": "exp-lookit-exit-survey",
                    "debriefing": {
                        "text": "json survey text"
                    }
                }
            },
            sequence: ["json-config", "json-exit-survey"]
        },
        pastSessions: [],
        generator: simple_generator_invalid,
        useGenerator: true,
        child: new Ember.Object()
    };

    // Check that it uses the JSON version
    let parser = new ExperimentParser(experiment);
    let result = parser.parse()[0];
    let expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-video-config', 'exp-lookit-exit-survey'], 'Incorrect frame types when using json rather than generator function');
    let expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-json-config', '1-json-exit-survey'], 'Incorrect frame IDs when using json rather than generator function');
    assert.equal(result[1].debriefing.text, "json survey text", 'Incorrect frame data when using json rather than generator function');
});


test('parser applies generator function and assigns to condition based on age', function(assert) {

    let age_based_generator = `function generateProtocol2(child, pastSessions) {
        /*
         * Generate the protocol for this study.
         *
         * @param {Object} child
         *    The child currently participating in this study. Includes fields:
         *      givenName (string)
         *      birthday (Date)
         *      gender (string, 'm' / 'f' / 'o')
         *      ageAtBirth (string, e.g. '25 weeks'. One of '40 or more weeks',
         *          '39 weeks' through '24 weeks', 'Under 24 weeks', or
         *          'Not sure or prefer not to answer')
         *      additionalInformation (string)
         *      languageList (string) space-separated list of languages child is
         *          exposed to (2-letter codes)
         *      conditionList (string) space-separated list of conditions/characteristics
         *          of child from registration form, as used in criteria expression
         *          - e.g. "autism_spectrum_disorder deaf multiple_birth"
         *
         *      Use child.get to access these fields: e.g., child.get('givenName') returns
         *      the child's given name.
         *
         * @param {!Array<Object>} pastSessions
         *     List of past sessions for this child and this study, in reverse time order:
         *     pastSessions[0] is THIS session, pastSessions[1] the previous session,
         *     back to pastSessions[pastSessions.length - 1] which has the very first
         *     session.
         *
         *     Each session has the following fields, corresponding to values available
         *     in Lookit:
         *
         *     createdOn (Date)
         *     conditions
         *     expData
         *     sequence
         *     completed
         *     globalEventTimings
         *     completedConsentFrame (note - this list will include even "responses")
         *          where the user did not complete the consent form!
         *     demographicSnapshot
         *     isPreview
         *
         * @return {Object} Protocol specification for Lookit study; object with 'frames'
         *    and 'sequence' keys.
         */

        let one_day = 1000 * 60 * 60 * 24; // ms in one day
        let child_age_in_days = -1;
        try {
            child_age_in_days = (new Date() - child.get('birthday')) / one_day;
        } catch (error) {
            // Display what the error was for debugging, but continue with fake
            // age in case we can't calculate age for some reason
            console.error(error);
        }
        child_age_in_days = child_age_in_days || -1; // If undefined/null, set to default

        // Define frames that will be used for both the baby and toddler versions of the study
        let frames = {
            "video-config": {
                "kind": "exp-video-config",
                "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to email the XYZ lab at xyz@abc.edu and we'd be glad to help out!"
            },
            "video-consent": {
                "kind": "exp-lookit-video-consent",
                "PIName": "Jane Smith",
                "datause": "We are primarily interested in your child's emotional reactions to the images and sounds. A research assistant will watch your video to measure the precise amount of delight in your child's face as he or she sees each cat picture.",
                "payment": "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience.",
                "purpose": "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails.",
                "PIContact": "Jane Smith at 123 456 7890",
                "procedures": "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating.",
                "institution": "Science University"
            },
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "text": "Here is where you would enter debriefing information for the family. This is a chance to explain the purpose of your study and how the family helped. At this point it's more obvious to the participant that skimming the info is fine if they're not super-interested, so you can elaborate in ways you might have avoided ahead of time in the interest of keeping instructions short. You may want to mention the various conditions kids were assigned to if you didn't before, and try to head off any concerns parents might have about how their child 'did' on the study, especially if there are 'correct' answers that will have been obvious to a parent. <br><br> It is great if you can link people to a layperson-accessible article on a related topic - e.g., media coverage of one of your previous studies in this research program, a talk on Youtube, a parenting resource. <br><br> If you are compensating participants, restate what the compensation is (and any conditions, and let them know when to expect their payment! E.g.: To thank you for your participation, we'll be emailing you a $4 Amazon gift card - this should arrive in your inbox within the next week after we confirm your consent video and check that your child is in the age range for this study. (If you don't hear from us by then, feel free to reach out!) If you participate again with another child in the age range, you'll receive one gift card per child.",
                    "title": "Thank you!"
                }
            }
        }

        // Add a "test frame" that's different depending on the child's age.
        // You could actually be defining whole separate protocols here (e.g. for
        // a longitudinal study with a bunch of timepoints), using different stimuli
        // in the same frames, just customizing instructions, etc.

        // If the age is -1 because there was some error, they'll get the baby version.
        if (child_age_in_days <= 365) {
            frames["test-frame"] = {
                "kind": "exp-lookit-instructions",
                "blocks": [
                    {
                        "title": "[Example text for BABY version of study]",
                        "listblocks": [
                            {
                                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                            },
                            {
                                "text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                            }
                        ]
                    }
                ],
                "showWebcam": false,
                "nextButtonText": "Finish up"
            };
        } else {
            frames["test-frame"] = {
                "kind": "exp-lookit-instructions",
                "blocks": [
                    {
                        "title": "[Example text for TODDLER version of study]",
                        "listblocks": [
                            {
                                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                            },
                            {
                                "text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                            }
                        ]
                    }
                ],
                "showWebcam": false,
                "nextButtonText": "Finish up"
            }
        }

        // Sequence of frames is the same in both cases, the 'test-frame' will just
        // be differently defined base on age.
        let frame_sequence = ['video-config', 'video-consent', 'test-frame', 'exit-survey']

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: frames,
            sequence: frame_sequence
        };
    }
    `;


    var sixMonthOldBirthday = new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6;
    var eighteenMonthOldBirthday = new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 18;

    let experiment = {
        structure: {
            frames: {},
            sequence: []
        },
        pastSessions: [],
        generator: age_based_generator,
        useGenerator: true,
        child: new Ember.Object({'birthday': sixMonthOldBirthday})
    };

    // Check that it makes the baby version for a six-month-old
    let parser = new ExperimentParser(experiment);
    let result = parser.parse()[0];
    assert.equal(result.length, 4);
    let expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-video-config', 'exp-lookit-video-consent', 'exp-lookit-instructions', 'exp-lookit-exit-survey'], 'Incorrect frame types when generating protocol for six-month-old');
    let testFrame = result[2];
    assert.equal(testFrame["blocks"][0]["title"], "[Example text for BABY version of study]", "Incorrect text in generated protocol for baby");

    // and the toddler version for an eighteen-month-old
    experiment["child"] = new Ember.Object({'birthday': eighteenMonthOldBirthday});
    parser = new ExperimentParser(experiment);
    result = parser.parse()[0];
    assert.equal(result.length, 4);
    expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-video-config', 'exp-lookit-video-consent', 'exp-lookit-instructions', 'exp-lookit-exit-survey'], 'Incorrect frame types when generating protocol for eighteen-month-old');
    testFrame = result[2];
    assert.equal(testFrame["blocks"][0]["title"], "[Example text for TODDLER version of study]", "Incorrect text in generated protocol for toddler");

    // and does not error on unexpected input - default to baby version
    experiment["child"] = new Ember.Object();
    parser = new ExperimentParser(experiment);
    result = parser.parse()[0];
    assert.equal(result.length, 4);
    expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-video-config', 'exp-lookit-video-consent', 'exp-lookit-instructions', 'exp-lookit-exit-survey'], 'Incorrect frame types when generating protocol for child without birthday in database');
    testFrame = result[2];
    assert.equal(testFrame["blocks"][0]["title"], "[Example text for BABY version of study]", "Incorrect text in generated protocol for child without birthday in database");
});


test('parser applies generator function and assigns to condition based on past sessions', function(assert) {

    let session_based_generator = `function generateProtocol(child, pastSessions) {
        /*
         * Generate the protocol for this study.
         *
         */

        // Assign condition randomly as fallback/initial value. This will be true/false
        // with equal probability.
        let is_happy_condition = Math.random() > 0.5;

        try {
            // First, find the most recent session where the participant got to the point
            // of the "test trial"
            var mostRecentSession = pastSessions.find(
                sess => Object.keys(sess.get('expData', {})).some(frId => frId.endsWith('-match-emotion')));
            // If there is such a session, find out what condition they were in that time
            // and flip it
            if (mostRecentSession) {
                let expData = mostRecentSession.get('expData', {});
                let frameKey = Object.keys(expData).find(frId => frId.endsWith('-match-emotion'));
                // Flip condition from last time: do happy condition this time if last
                // time 'happy' was NOT in the *-match-emotion frame ID
                is_happy_condition = !(frameKey.includes('happy'));
            }
        } catch (error) {
            // Just in case - wrap the above in a try block so we fall back to
            // random assignment if something is weird about the pastSessions data
            console.error(error);
        }


        // Define all possible frames that might be used
        let frames = {
            "intro": {
                "blocks": [{
                        "text": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
                        "title": "[Introduction frame]"
                    },
                    {
                        "text": "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
                    },
                    {
                        "text": "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
                    }
                ],
                "showPreviousButton": false,
                "kind": "exp-lookit-text"
            },
            "happy-match-emotion": {
                "kind": "exp-lookit-images-audio",
                "audio": "matchremy",
                "images": [{
                        "id": "cue",
                        "src": "happy_remy.jpg",
                        "position": "center",
                        "nonChoiceOption": true
                    },
                    {
                        "id": "option1",
                        "src": "happy_zenna.jpg",
                        "position": "left",
                        "displayDelayMs": 2000
                    },
                    {
                        "id": "option2",
                        "src": "annoyed_zenna.jpg",
                        "position": "right",
                        "displayDelayMs": 2000
                    }
                ],
                "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
                "autoProceed": false,
                "doRecording": false,
                "choiceRequired": true,
                "parentTextBlock": {
                    "text": "Some explanatory text for parents",
                    "title": "For parents"
                },
                "canMakeChoiceBeforeAudioFinished": true
            },
            "sad-match-emotion": {
                "kind": "exp-lookit-images-audio",
                "audio": "matchzenna",
                "images": [{
                        "id": "cue",
                        "src": "sad_zenna.jpg",
                        "position": "center",
                        "nonChoiceOption": true
                    },
                    {
                        "id": "option1",
                        "src": "surprised_remy.jpg",
                        "position": "left",
                        "feedbackAudio": "negativefeedback",
                        "displayDelayMs": 3500
                    },
                    {
                        "id": "option2",
                        "src": "sad_remy.jpg",
                        "correct": true,
                        "position": "right",
                        "displayDelayMs": 3500
                    }
                ],
                "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
                "autoProceed": false,
                "doRecording": false,
                "choiceRequired": true,
                "parentTextBlock": {
                    "text": "Some explanatory text for parents",
                    "title": "For parents"
                },
                "canMakeChoiceBeforeAudioFinished": true
            },
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "text": "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. <br> <br> Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. <br> <br> Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
                    "title": "Thank you!"
                }
            }
        }

        // Construct the sequence based on the condition.
        let frame_sequence = [
            'intro',
            is_happy_condition ? "happy-match-emotion" : "sad-match-emotion",
            'exit-survey'
        ]

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: frames,
            sequence: frame_sequence
        };
    }

    `;

    let experiment = {
        structure: {
            frames: {},
            sequence: []
        },
        pastSessions: [],
        generator: session_based_generator,
        useGenerator: true,
        child: new Ember.Object()
    };

    // Check that it works without any prior sessions
    let parser = new ExperimentParser(experiment);
    let result = parser.parse()[0];
    assert.equal(result.length, 3);
    let expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-images-audio', 'exp-lookit-exit-survey']);

    let noAssignmentSession = new Ember.Object( {
        "completedConsentFrame": false,
        "expData": {
                "0-intro": {
                    "kind": "exp-lookit-text"
                }
        }
    });

    let happySession = new Ember.Object( {
        "completedConsentFrame": false,
        "expData": {
                "0-intro": {
                    "kind": "exp-lookit-text"
                },
                "1-happy-match-emotion": {
                    "kind": "exp-lookit-images-audio"
                },
                "2-exit-survey": {
                    "kind": "exp-lookit-exit-survey",
                    "databrary": "no"
                }
        }
    });

    let sadSession = new Ember.Object( {
        "completedConsentFrame": false,
        "expData": {
                "0-intro": {
                    "kind": "exp-lookit-text"
                },
                "1-sad-match-emotion": {
                    "kind": "exp-lookit-images-audio"
                }
        }
    });

    // Check that it works with a prior session with no condition assignment
    experiment["pastSessions"] = [ noAssignmentSession ];
    parser = new ExperimentParser(experiment);
    result = parser.parse()[0];
    assert.equal(result.length, 3);
    expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-images-audio', 'exp-lookit-exit-survey']);

    // Check that it assigns to sad after happy
    experiment["pastSessions"] = [ happySession ];
    parser = new ExperimentParser(experiment);
    result = parser.parse()[0];
    assert.equal(result.length, 3);
    expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-images-audio', 'exp-lookit-exit-survey']);
    let expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-intro', '1-sad-match-emotion', '2-exit-survey']);
    assert.equal(result[1]["audio"], "matchzenna");

    // Check that it assigns to happy after sad
    experiment["pastSessions"] = [ sadSession ];
    parser = new ExperimentParser(experiment);
    result = parser.parse()[0];
    assert.equal(result.length, 3);
    expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-images-audio', 'exp-lookit-exit-survey']);
    expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-intro', '1-happy-match-emotion', '2-exit-survey']);
    assert.equal(result[1]["audio"], "matchremy");

    // Check that it uses the most recent session for assignment
    experiment["pastSessions"] = [ sadSession, happySession ];
    parser = new ExperimentParser(experiment);
    result = parser.parse()[0];
    assert.equal(result.length, 3);
    expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-images-audio', 'exp-lookit-exit-survey']);
    expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-intro', '1-happy-match-emotion', '2-exit-survey']);
    assert.equal(result[1]["audio"], "matchremy");

    // Check that it uses the most recent session with condition if very most recent has none
    experiment["pastSessions"] = [ noAssignmentSession, sadSession, happySession ];
    parser = new ExperimentParser(experiment);
    result = parser.parse()[0];
    assert.equal(result.length, 3);
    expKinds = result.map((item) => item.kind);
    assert.deepEqual(expKinds, ['exp-lookit-text', 'exp-lookit-images-audio', 'exp-lookit-exit-survey']);
    expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-intro', '1-happy-match-emotion', '2-exit-survey']);
    assert.equal(result[1]["audio"], "matchremy");

});


test('parser applies generator function and randomizes as expected without repeating images', function(assert) {

    let randomization_generator = `function generateProtocol3(child, pastSessions) {
        /*
         * Generate the protocol for this study.
         *
         * @param {Object} child
         *    The child currently participating in this study. Includes fields:
         *      givenName (string)
         *      birthday (Date)
         *      gender (string, 'm' / 'f' / 'o')
         *      ageAtBirth (string, e.g. '25 weeks'. One of '40 or more weeks',
         *          '39 weeks' through '24 weeks', 'Under 24 weeks', or
         *          'Not sure or prefer not to answer')
         *      additionalInformation (string)
         *      languageList (string) space-separated list of languages child is
         *          exposed to (2-letter codes)
         *      conditionList (string) space-separated list of conditions/characteristics
         *          of child from registration form, as used in criteria expression
         *          - e.g. "autism_spectrum_disorder deaf multiple_birth"
         *
         *      Use child.get to access these fields: e.g., child.get('givenName') returns
         *      the child's given name.
         *
         * @param {!Array<Object>} pastSessions
         *     List of past sessions for this child and this study, in reverse time order:
         *     pastSessions[0] is THIS session, pastSessions[1] the previous session,
         *     back to pastSessions[pastSessions.length - 1] which has the very first
         *     session.
         *
         *     Each session has the following fields, corresponding to values available
         *     in Lookit:
         *
         *     createdOn (Date)
         *     conditions
         *     expData
         *     sequence
         *     completed
         *     globalEventTimings
         *     completedConsentFrame (note - this list will include even "responses")
         *          where the user did not complete the consent form!
         *     demographicSnapshot
         *     isPreview
         *
         * @return {Object} Protocol specification for Lookit study; object with 'frames'
         *    and 'sequence' keys.
         */

        // -------- Helper functions ----------------------------------------------

        // See http://stackoverflow.com/a/12646864
        // Returns a new array with elements of the array in random order.
        function shuffle(array) {
            var shuffled = Ember.$.extend(true, [], array); // deep copy array
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = temp;
            }
            return shuffled;
        }

        // Returns a random element of an array, and removes that element from the array
        function pop_random(array) {
            var randIndex = Math.floor(Math.random() * array.length);
            if (array.length) {
                return array.pop(randIndex);
            }
            return null
        }

        // -------- End helper functions -------------------------------------------

        // Define common (non-test-trial) frames
        let frames = {
            "video-config": {
                "kind": "exp-video-config",
                "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to email the XYZ lab at xyz@abc.edu and we'd be glad to help out!"
            },
            "video-consent": {
                "kind": "exp-lookit-video-consent",
                "PIName": "Jane Smith",
                "datause": "We are primarily interested in your child's emotional reactions to the images and sounds. A research assistant will watch your video to measure the precise amount of delight in your child's face as he or she sees each cat picture.",
                "payment": "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience.",
                "purpose": "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails.",
                "PIContact": "Jane Smith at 123 456 7890",
                "procedures": "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating.",
                "institution": "Science University"
            },
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "text": "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. <br> <br> Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. <br> <br> Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
                    "title": "Thank you!"
                }
            }
        }

        // Start off the frame sequence with config/consent frames; we'll add test
        // trials as we construct them
        let frame_sequence = ['video-config', 'video-consent']

        // start at a random point in this list and cycle through across trials.
        // each element is a list: category1, category2, audio.
        // category1 and category2 match up to keys in available_images; audio
        // should be filenames in baseDir/mp3
        let all_category_pairings = [
            [
                "adorable",
                "delicious",
                "Adorable"
            ],
            [
                "adorable",
                "delicious",
                "Delicious"
            ],
            [
                "delicious",
                "exciting",
                "Delicious"
            ],
            [
                "delicious",
                "exciting",
                "Exciting"
            ],
            [
                "adorable",
                "exciting",
                "Adorable"
            ],
            [
                "adorable",
                "exciting",
                "Exciting"
            ]
        ]

        // Every image is just used once total, either as a target or as a distractor.
        // We'll remove the images from these lists as they get used.
        let available_images = {
            "adorable": [
                "Adorable_1.png",
                "Adorable_2.png",
                "Adorable_3.png",
                "Adorable_4.png"
            ],
            "delicious": [
                "Delicious_1.png",
                "Delicious_2.png",
                "Delicious_3.png",
                "Delicious_4.png"
            ],
            "exciting": [
                "Exciting_1.png",
                "Exciting_2.png",
                "Exciting_3.png",
                "Exciting_4.png"
            ]
        }

        // Make a deep copy of the original available images, in case we run out
        // (e.g. after adding additional trials) and need to "refill" a category.
        let all_images = Ember.$.extend(true, {}, available_images)

        // Choose a random starting point and order for the category pairings
        let ordered_category_pairings = shuffle(all_category_pairings)

        for (iTrial = 0; iTrial < 4; iTrial++) {

            let category_pairing = ordered_category_pairings[iTrial]
            let category_id_1 = category_pairing[0]
            let category_id_2 = category_pairing[1]
            let audio = category_pairing[2]

            // "Refill" available images if empty
            if (!available_images[category_id_1].length) {
                available_images[category_id_1] = all_images[category_id_1]
            }
            if (!available_images[category_id_2].length) {
                available_images[category_id_2] = all_images[category_id_2]
            }

            let image1 = pop_random(available_images[category_id_1])
            let image2 = pop_random(available_images[category_id_2])

            let left_right_pairing = shuffle(["left", "right"])

            thisTrial = {
                "kind": "exp-lookit-images-audio",
                "audio": audio,
                "images": [{
                        "id": "option1-test",
                        "src": image1,
                        "position": left_right_pairing[0]
                    },
                    {
                        "id": "option2-test",
                        "src": image2,
                        "position": left_right_pairing[1]
                    }
                ],
                "baseDir": "https://raw.githubusercontent.com/schang198/lookit-stimuli-template/master/",
                "pageColor": "gray",
                "audioTypes": [
                    "mp3"
                ],
                "autoProceed": true
            }

            // Store this frame in frames and in the sequence
            frameId = 'test-trial-' + (iTrial + 1)
            frames[frameId] = thisTrial;
            frame_sequence.push(frameId);
        }

        // Finish up the frame sequence with the exit survey
        frame_sequence = frame_sequence.concat(['exit-survey'])

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: frames,
            sequence: frame_sequence
        };
    }
    `

    let experiment = {
        structure: {
            frames: {},
            sequence: []
        },
        pastSessions: [],
        generator: randomization_generator,
        useGenerator: true,
        child: new Ember.Object()
    };

    for (var iRep=0; iRep<100; iRep++) {
        let parser = new ExperimentParser(experiment);
        let result = parser.parse()[0];
        let expKinds = result.map((item) => item.kind);
        assert.deepEqual(expKinds, ['exp-video-config', 'exp-lookit-video-consent', "exp-lookit-images-audio", "exp-lookit-images-audio", "exp-lookit-images-audio", "exp-lookit-images-audio", 'exp-lookit-exit-survey'], 'Incorrect frame types generated by randomization generator');
        let expIds = result.map((item) => item.id);
        assert.deepEqual(expIds, ['0-video-config', '1-video-consent', "2-test-trial-1", "3-test-trial-2", "4-test-trial-3", "5-test-trial-4", "6-exit-survey"], 'Incorrect frame IDs generated by randomization generator');

        let testTrials = result.slice(2, 6);

        for (let iTrial = 0; iTrial < 4; iTrial++) {
            let thisTrial = testTrials[iTrial];
            assert.notEqual(thisTrial.images[0].src, thisTrial.images[1].src, "Same image presented on left and right");
            assert.notEqual(thisTrial.images[0].position, thisTrial.images[1].position, "Images presented on same side");
            assert.ok(thisTrial.images[0].src.startsWith(thisTrial.audio) || thisTrial.images[1].src.startsWith(thisTrial.audio), "Audio doesn't match either image");
        }

        let allLeftImages = testTrials.map((item) => item.images[0].src);
        let allRightImages = testTrials.map((item) => item.images[1].src);
        let allImages = allLeftImages.concat(allRightImages);
        for (var iImage=0; iImage<8; iImage++) {
            assert.equal(allImages.indexOf(allImages[iImage], iImage + 1), -1, 'Image used more than once during study');
            assert.equal(allImages[iImage].slice(-4), '.png', 'Image property was not substituted in all the way down to filename');
        }
    }

});
