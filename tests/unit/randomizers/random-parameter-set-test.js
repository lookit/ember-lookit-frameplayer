import { module, skip } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';
import Ember from 'ember';
import Child from '../../../models/child';
import Response from '../../../models/response';
import { getRandomElement, randomizer } from '../../../randomizers/random-parameter-set';
import ExperimentParser from '../../../utils/parse-experiment';

module('Unit | Randomizer | random parameter set');

test('Random element selected from weighted list is a possible choice', function (assert) {
    const arr       = [1, 2, 3, 4, 5, 6, 7, 8];
    const weights   = [0, 0, 0, 0, 0, 1, 0, 0];

    const expectedResult = 6;

    let [, actualResult] = getRandomElement(arr, weights);

    assert.deepEqual(actualResult, expectedResult,
        'Random element selected should not have probability weight 0'
    );
});

test('Values are replaced at multiple levels of object hierarchy and within arrays', function (assert) {

    const frameId = 'frame-id';
    const frameConfig = {
        commonFrameProperties: {
        },
        frameList: [
            {
                kind: 'exp-lookit-experiment-page',
                prop0: 'val4',
                prop1: {
                    setting1: 1,
                    setting2: "val1",
                    setting3: "val1",
                    setting4: [4,"val3",6],
                    setting5: 5
                },
                prop2: {
                    setting1: {
                        subSetting: "val2"
                    },
                    setting2: "val3"
                },
                prop3: {
                    setting: "val4"
                }
            },
        ],
        parameterSets: [
            {
                "val1": "replacedvalue1",
                "val2": "replacedvalue2",
                "val3": "replacedvalue3",
                "val4": "replacedvalue4"
            },
        ],
        parameterSetWeights: [1]
    };

    const expectedResult = [
            {
                id: 'frame-id',
                kind: 'exp-lookit-experiment-page',
                prop0: 'replacedvalue4',
                prop1: {
                    setting1: 1,
                    setting2: "replacedvalue1",
                    setting3: "replacedvalue1",
                    setting4: [4,"replacedvalue3",6],
                    setting5: 5
                },
                prop2: {
                    setting1: {
                        subSetting: "replacedvalue2"
                    },
                    setting2: "replacedvalue3"
                },
                prop3: {
                    setting: "replacedvalue4"
                },
            },
        ];

    var parser = new ExperimentParser();
    let [actualResult, ] = randomizer(frameId, frameConfig, [], parser._resolveFrame.bind(parser));

    assert.deepEqual(actualResult, expectedResult,
        'Strings that are properties of replace should be replaced throughout object'
    );

});

test('Randomizer appropriately persists and rotates conditions', function (assert) {

    const frameId = 'frame-id';
    const frameConfig = {
        commonFrameProperties: {
        },
        frameList: [
            {
                kind: 'exp-lookit-experiment-page',
                prop0: 'val4',
                prop1: {
                    setting1: 1,
                    setting2: "val1",
                    setting3: "val1",
                    setting4: [4,"val3",6],
                    setting5: 5
                },
                prop2: {
                    setting1: {
                        subSetting: "val2"
                    },
                    setting2: "val3"
                },
                prop3: {
                    setting: "val4"
                }
            },
        ],
        parameterSets: [
            {
                "val1": "replacedvalue1A",
                "val2": "replacedvalue2A",
                "val3": "replacedvalue3A",
                "val4": "replacedvalue4A"
            },
            {
                "val1": "replacedvalue1B",
                "val2": "replacedvalue2B",
                "val3": "replacedvalue3B",
                "val4": "replacedvalue4B"
            },
            {
                "val1": "replacedvalue1C",
                "val2": "replacedvalue2C",
                "val3": "replacedvalue3C",
                "val4": "replacedvalue4C"
            },
        ],
        parameterSetWeights: [1, 1, 1],
        conditionForAdditionalSessions: "persist"
    };

    let response1 = new Ember.Object( {
        "completedConsentFrame": false, // didn't complete consent frame!
        "conditions": {
                "1-frame-id": {
                    "conditionNum": 0,
                    "parameterSet": {
                        "val1": "replacedvalue1C",
                        "val2": "replacedvalue2C",
                        "val3": "replacedvalue3C",
                        "val4": "replacedvalue4C"
                    }
                }
            }
    });
    let response2 = new Ember.Object( {
            "completedConsentFrame": true,
            "conditions": {
                "1-silly-id": { // no matching condition key!
                    "conditionNum": 2,
                    "parameterSet": {
                        "val1": "replacedvalue1C",
                        "val2": "replacedvalue2C",
                        "val3": "replacedvalue3C",
                        "val4": "replacedvalue4C"
                    }
                }
            }
    });
    let response3 = new Ember.Object( {
            "completedConsentFrame": true,
            "conditions": {
                "1-frame-id": { // first valid previous session
                    "conditionNum": 1,
                    "parameterSet": {
                        "val1": "replacedvalue1C",
                        "val2": "replacedvalue2C",
                        "val3": "replacedvalue3C",
                        "val4": "replacedvalue4C"
                    }
                }
            }
    });
    let response4 = new Ember.Object( {
            "completedConsentFrame": true,
            "conditions": {
                "1-frame-id": {
                    "conditionNum": 2,
                    "parameterSet": {
                        "val1": "replacedvalue1C",
                        "val2": "replacedvalue2C",
                        "val3": "replacedvalue3C",
                        "val4": "replacedvalue4C"
                    }
                }
            }
    });

    let pastSessions = [response1, response2, response3, response4];

    var parser = new ExperimentParser();
    let [, conditionsPersisted] = randomizer(frameId, frameConfig, pastSessions, parser._resolveFrame.bind(parser));

    assert.equal(conditionsPersisted.conditionNum, 1,
        'Condition number should persist from most recent session with completed consent and equivalent frame'
    );

    frameConfig.conditionForAdditionalSessions = 'rotate';
    let [, conditionsRotated] = randomizer(frameId, frameConfig, pastSessions, parser._resolveFrame.bind(parser));

    assert.equal(conditionsRotated.conditionNum, 2,
        'Condition number should rotate from most recent session with completed consent and equivalent frame'
    );

    frameConfig.conditionForAdditionalSessions = 'littledance';
    assert.throws(function() {
          return randomizer(frameId, frameConfig, pastSessions, parser._resolveFrame.bind(parser))
        },
        'Randomizer should not accept options besides random, persist, or rotate'
    );

});


test('Randomizer does basic parameter replacement using expected parameter set based on fixed and age-based weights', function (assert) {

    const frameId = 'frame-id';
    const frameConfig = {
        commonFrameProperties: {
            'kind': 'exp-lookit-experiment-page'
        },
        frameList: [
            {
                'leftImage': 'LEFTIMAGE1',
                'rightImage': 'frog.jpg',
                'size': 'IMAGESIZE'
            },
            {
                'leftImage': 'LEFTIMAGE2',
                'rightImage': 'frog.jpg'
            },
            {
                'leftImage': 'LEFTIMAGE3',
                'rightImage': 'giraffe.jpg',
                'size': 'IMAGESIZE',
                'endAudio': 'ENDAUDIO'
            },
        ],
        parameterSets: [
            {
                'LEFTIMAGE1': 'toad.jpg',
                'LEFTIMAGE2': 'snake.jpg',
                'LEFTIMAGE3': 'zebra.jpg',
                'IMAGESIZE': 250,
                'ENDAUDIO': 'roar.mp3'
            },
            {
                'LEFTIMAGE1': 'bunny.jpg',
                'LEFTIMAGE2': 'cat.jpg',
                'LEFTIMAGE3': 'dog.jpg',
                'IMAGESIZE': 300,
                'ENDAUDIO': 'purr.mp3'
            },
        ],
        parameterSetWeights: [1, 0]
    };

    const set1Result = [
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'toad.jpg',
                'rightImage': 'frog.jpg',
                'size': 250
            },
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'snake.jpg',
                'rightImage': 'frog.jpg'
            },
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'zebra.jpg',
                'rightImage': 'giraffe.jpg',
                'size': 250,
                'endAudio': 'roar.mp3'
            },
        ];
    const set2Result = [
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'bunny.jpg',
                'rightImage': 'frog.jpg',
                'size': 300
            },
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'cat.jpg',
                'rightImage': 'frog.jpg'
            },
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'dog.jpg',
                'rightImage': 'giraffe.jpg',
                'size': 300,
                'endAudio': 'purr.mp3'
            },
        ];

    var parser = new ExperimentParser();
    let [actualResult, ] = randomizer(frameId, frameConfig, [], parser._resolveFrame.bind(parser));

    assert.deepEqual(actualResult, set1Result,
        'Randomizer did not create expected frame list'
    );

    frameConfig.parameterSetWeights = [
       {
           'minAge': 0,
           'maxAge': 365,
           'weight': [1, 0]
       },
       {
           'minAge': 365,
           'maxAge': 10000,
           'weight': [0, 1]
       }
   ];

    var sixMonthOldBirthday = new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6;
    var eighteenMonthOldBirthday = new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 18;

    for (var i = 0; i++; i < 20) {
        let [sixMonthResult, ] = randomizer(frameId, frameConfig, [], parser._resolveFrame.bind(parser), new Ember.Object({'birthday': sixMonthOldBirthday}));
        let [eighteenMonthResult, ] = randomizer(frameId, frameConfig, [], parser._resolveFrame.bind(parser), new Ember.Object({'birthday': eighteenMonthOldBirthday}));
        assert.deepEqual(sixMonthResult, set1Result,
            'Child in age range 0-365 days was not assigned to correct age-based parameter set'
        );
        assert.deepEqual(eighteenMonthResult, set2Result,
            'Child in age range 365-10000 days was not assigned to correct age-based parameter set'
        );
    }
});

test('Randomizer accepts selector syntax INDEX, RAND, PERM, UNIQ to choose from lists in parameter set', function (assert) {

    const frameId = 'frame-id';
    const imageList = ['a.jpg', 'b.jpg', 'c.jpg'];
    const soundList = ['hiss', 'bark', 'meow'];
    const nameList = ['bob', 'joe', 'suzie', 'jill'];

    const frameConfig = {
        commonFrameProperties: {
            'kind': 'exp-lookit-experiment-page'
        },
        frameList: [
            {
                'leftImage': 'IMAGES#2',
                'animalNoise': 'SOUNDS#RAND',
                'animalName': 'NAMES#UNIQ',
                'nameList': 'NAMES#PERM',
            },
            {
                'leftImage': 'IMAGES#0',
                'animalNoise': 'SOUNDS#RAND',
                'animalName': 'NAMES#UNIQ',
            },
            {
                'leftImage': 'IMAGES#1',
                'animalNoise': 'SOUNDS#RAND',
                'animalName': 'NAMES#UNIQ',
            },
            {
                'leftImage': 'IMAGES#1',
                'animalNoise': 'SOUNDS#RAND',
                'animalName': 'NAMES#UNIQ',
            },
        ],
        parameterSets: [
            {
                'IMAGES': imageList,
                'SOUNDS': soundList,
                'NAMES': nameList,
            },
        ],
        parameterSetWeights: [1]
    };

    var parser = new ExperimentParser();
    let [actualResult, ] = randomizer(frameId, frameConfig, [], parser._resolveFrame.bind(parser));

    let images = actualResult.map((fr) => fr.leftImage);
    assert.deepEqual(images, [imageList[2], imageList[0], imageList[1], imageList[1]],
        'Randomizer did not use #INDEX syntax as expected'
    );

    let sounds = actualResult.map((fr) => fr.animalNoise);
    assert.ok(sounds.every((s) => soundList.includes(s)),
        'Randomizer did not use #RAND syntax as expected'
    );

    let names = actualResult.map((fr) => fr.animalName);
    assert.deepEqual(names.sort(), nameList.sort(),
        'Randomizer did not use #UNIQ syntax as expected'
    );

    let namePerm = actualResult[0].nameList;
    assert.deepEqual(namePerm.sort(), nameList.sort(),
        'Randomizer did not use #PERM syntax as expected'
    );

});
