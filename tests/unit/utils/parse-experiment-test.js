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
