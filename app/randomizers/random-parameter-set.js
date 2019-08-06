/**
* @module exp-player
* @submodule randomizers
*/

import Ember from 'ember';

/**
* Randomizer to implement flexible condition assignment and counterbalancing by
* allowing the user to specify an arbitrary sequence of frames to create. A
* set of parameters is randomly selected from a list of available parameterSets,
* and these parameters are substituted in to the parameters specified in the
* list of frames.
*
* For a more detailed walkthrough, please see
* https://lookit.readthedocs.io/en/develop/experiments.html#randomizer-frames
*
* To use, define a frame with "kind": "choice" and "sampler": "random-parameter-set",
* as shown below, in addition to the parameters described under 'properties'.
*
* This
*
```json
"frames": {
    "test-trials": {
        "sampler": "random-parameter-set",
        "kind": "choice",
        "commonFrameProperties": {
            "kind": "exp-lookit-story-page",
            "baseDir": "https://s3.amazonaws.com/lookitcontents/ingroupobligations/",
            "audioTypes": ["mp3", "ogg"],
            "doRecording": true,
            "autoProceed": false,
            "parentTextBlock": {
                "title": "Parents!",
                "text": "Common instructions across test trials here",
                "emph": true
            }
        },
        "frameList": [
            {
                "images": [
                    {
                        "id": "agent",
                        "src": "AGENTIMG1",
                        "left": "40",
                        "width": "20",
                        "top": "10"
                    },
                    {
                        "id": "left",
                        "src": "LEFTIMG1",
                        "left": "10",
                        "width": "20",
                        "top": "50"
                    },
                    {
                        "id": "right",
                        "src": "RIGHTIMG1",
                        "left": "70",
                        "width": "20",
                        "top": "50"
                    }
                ],
                "audioSources": [
                    {
                        "audioId": "questionaudio",
                        "sources": [{"stub": "QUESTION1AUDIO"}],
                        "highlights": "QUESTION1HIGHLIGHTS"
                    }
                ]
            },
            {
                "images": [
                    {
                        "id": "agent",
                        "src": "AGENTIMG2",
                        "left": "40",
                        "width": "20",
                        "top": "10"
                    },
                    {
                        "id": "left",
                        "src": "LEFTIMG2",
                        "left": "10",
                        "width": "20",
                        "top": "50"
                    },
                    {
                        "id": "right",
                        "src": "RIGHTIMG2",
                        "left": "70",
                        "width": "20",
                        "top": "50"
                    }
                ],
                "audioSources": [
                    {
                        "audioId": "questionaudio",
                        "sources": [{"stub": "QUESTION2AUDIO"}],
                        "highlights": "QUESTION2HIGHLIGHTS"
                    }
                ]
            }
        ],
        "parameterSets": [
            {
                "AGENTIMG1": "flurpagent1.jpg",
                "LEFTIMG1": "flurpvictim1.jpg",
                "RIGHTIMG1": "zazzvictim1.jpg",
                "QUESTION1AUDIO": "flurpleftmean1",
                "QUESTION1HIGHLIGHTS": [
                    {"range": [0.399293,	3.617124], "image": "agent"},
                    {"range": [5.085112,	6.811467], "image": "left"},
                    {"range": [6.905418,	8.702236], "image": "right"}
                ],
                "AGENTIMG2": "flurpagent2.jpg",
                "LEFTIMG2": "flurpvictim2.jpg",
                "RIGHTIMG2": "zazzvictim2.jpg",
                "QUESTION2AUDIO": "flurpleftinduct1",
                "QUESTION2HIGHLIGHTS": [
                    {"range": [0.372569,	5.309110], "image": "agent"},
                    {"range": [5.495395,	7.209213], "image": "left"},
                    {"range": [5.495395,	7.209213], "image": "right"},
                    {"range": [9.966225,	11.922212], "image": "left"},
                    {"range": [12.052612,	14.008600], "image": "right"}
                ]
            },
            {
                "AGENTIMG1": "zazzagent1.jpg",
                "LEFTIMG1": "flurpvictim1.jpg",
                "RIGHTIMG1": "zazzvictim1.jpg",
                "QUESTION1AUDIO": "zazzrightnice1",
                "QUESTION1HIGHLIGHTS": [
                    {"range": [0.348454,	3.736871], "image": "agent"},
                    {"range": [5.395033,	6.884975], "image": "left"},
                    {"range": [6.969085,	8.975701], "image": "right"}
                ],
                "AGENTIMG2": "zazzagent2.jpg",
                "LEFTIMG2": "flurpvictim2.jpg",
                "RIGHTIMG2": "zazzvictim2.jpg",
                "QUESTION2AUDIO": "zazzrightinduct1",
                "QUESTION2HIGHLIGHTS": [
                    {"range": [0.572920,	5.138376], "image": "agent"},
                    {"range": [5.335317,	7.089884], "image": "left"},
                    {"range": [5.335317,	7.089884], "image": "right"},
                    {"range": [9.721735,	11.565821], "image": "left"},
                    {"range": [11.655340,	13.535233], "image": "right"}
                ]
            }
        ],
        "parameterSetWeights": [1, 1]
    }
}

* ```
* @class Random-parameter-set
*/

function getRandomElement(arr, weights) {
    weights = weights || Array(arr.length).fill(1);
    var totalProb = weights.reduce((a, b) => a + b, 0);
    var randPos = Math.random() * totalProb;

    var weightSum = 0;
    for (var i = 0; i < arr.length; i++) {
        weightSum += weights[i];
        if (randPos <= weightSum) {
            return [i, arr[i]];
        }
    }
}

// http://stackoverflow.com/a/12646864
function shuffleArray(array) {
    var shuffled = Ember.$.extend(true, [], array); // deep copy array
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

// TODO: in the future we may want to allow nesting of the list-object-selector syntax,
// e.g. LISTVAR__3__4, LISTVAR1__LISTVAR2__3, LISTVAR1__1__LISTVAR2__3 - but this quickly
// also requires appropriate processing of parentheses/order-of-operations.

var randomizer = function(frameId, frameConfig, pastSessions, resolveFrame) {

    // Data provided to randomizer (properties of frameConfig):

    /**
     * Object describing common parameters to use in EVERY frame created
     * by this randomizer. Parameter names and values are as described in
     * the documentation for the frameType used.
     *
     * @property {Object} commonFrameProperties
     */

    /**
     * List of frames to be created by this randomizer. Each frame is an
     * object with any necessary frame-specific properties specified. The
     * `kind` of frame can be specified either here (per frame) or in
     * `commonFrameProperties`. If a property is defined for a given frame both
     * in this frame list and in `commonFrameProperties`, the value in the frame
     * list will take precedence.
     *
     * (E.g., you could include `'kind': 'normal-frame'` in
     * `commmonFrameProperties`, but for a single frame in `frameList`, include
     * `'kind': 'special-frame'`.)
     *
     * Any property VALUES within any of the frames in this list which match
     * a property NAME in the selected `parameterSet` will be replaced by the
     * corresponding `parameterSet` value. E.g., suppose a frame in `frameList` is
     *
```
{
    'leftImage': 'LEFTIMAGE1',
    'rightImage': 'frog.jpg',
    'size': 'IMAGESIZE'
}
```
     *
     * and the row that has been selected randomly of `parameterSets` is
     *
```
{
    'LEFTIMAGE1': 'toad.jpg',
    'LEFTIMAGE2': 'dog.jpg',
    'IMAGESIZE': 250
}
```
     *
     * Then the frame would be transformed into:
```
{
    'leftImage': 'toad.jpg',
     'rightImage': 'frog.jpg',
     'size': 250
}
```
     *
     * The same values may be applied across multiple frames. For instance,
     * suppose `frameList` is

```
       [
            {
                'leftImage': 'LEFTIMAGE1',
                'rightImage': 'frog.jpg',
                'size': 'IMAGESIZE'
            },
            {
                'leftImage': 'LEFTIMAGE2',
                'rightImage': 'frog.jpg',
                'size': 'IMAGESIZE'
            }
        ]
```

     * Then the corresponding processed frames would include the values
```
       [
            {
                'leftImage': 'toad.jpg',
                'rightImage': 'frog.jpg',
                'size': 250
            },
            {
                'leftImage': 'dog.jpg',
                'rightImage': 'frog.jpg',
                'size': 250
            }
        ]
```
     * A property value like `IMAGESIZE` may be placed in a frame definition
     * nested within another object (at any depth) or within a list and
     * will still be replaced.
     *
     * You can also use selectors to randomly sample from or permute
     * a list given in a `parameterSet`. Suppose `LISTVAR` is defined in
     * a `parameterSet` as `THELIST`, e.g. a list of potential stimuli. Within frames in your `frameList`
     * (and in `commonFrameProperties`), you can use any of the following:
     *
     * * Select the Nth element (0-indexed) of `THELIST`: (Will cause error if `N >= THELIST.length`)
```
    'parameterName': 'LISTVAR#N'
```
     * * Select (uniformly) a random element of `THELIST`:
```
    'parameterName': 'LISTVAR#RAND'
```
    * * Set `parameterName` to a random permutation of `THELIST`:
```
    'parameterName': 'LISTVAR#PERM'
```
    * * Select the next element in a random permutation of `THELIST`, which is used across all
    * substitutions in this randomizer. This allows you, for instance, to provide a list
    * of possible images in your `parameterSet`, and use a different one each frame with the
    * subset/order randomized per participant. If more `LISTVAR_UNIQ` parameters than
    * elements of `THELIST` are used, we loop back around to the start of the permutation
    * generated for this randomizer.
```
    'parameterName': 'LISTVAR#UNIQ'
```
     *
     * @property {Object[]} frameList
     */

    /**
     * Array of parameter sets to randomly select from in order to determine
     * the parameters for each frame in this session.
     *
     * A single element of parameterSets will be applied to a given session.
     *
     * @property {Object[]} parameterSets
     */

    /**
     * [Optional] Array of weights for parameter sets; elements correspond to
     * elements of parameterSets. The probability of selecting an element
     * `parameterSets[i]` is `parameterSetWeights[i]/sum(parameterSetWeights)`.
     *
     * If not provided, all `parameterSets` are weighted equally.
     *
     * This is intended to allow manual control of counterbalancing during
     * data collection, e.g. to allow one condition to "catch up" if it was
     * randomly selected less often.
     *
     * @property {Number[]} parameterSetWeights
     */

    function replaceValues(obj, rep) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] === 'object') { // recursively handle objects
                    obj[property] = replaceValues(obj[property], rep);
                } else if (Array.isArray(obj[property])) { // and lists
                    for (var iElement = 0; iElement < obj[property].length; iElement++) {
                        obj[property][iElement] = replaceValues(obj[property][iElement], rep);
                    }
                } else if (typeof obj[property] === 'string') { // do substitution for strings
                    // If rep has this exact property, just sub in that value
                    if (rep.hasOwnProperty(obj[property])) {
                        obj[property] = rep[obj[property]];
                    } else if (typeof obj[property] === 'string' && obj[property].includes('#')) { // Also check for selector syntax:
                        // property of form X__Y, rep has property X, Y is a valid selector.
                        var segments = obj[property].split('#');
                        var propName = segments[0];
                        var selector = segments.slice(1).join('#');
                        if (rep.hasOwnProperty(propName)) {
                            var theList = rep[propName];
                            if (!Array.isArray(theList)) {
                                throw 'Selector syntax used in frame but corresponding value in parameterSet is not a list';
                            }
                            if (Ember.$.isNumeric(selector)) {
                                var index = Math.round(selector);
                                obj[property] = theList[index];
                            } else if (selector === 'RAND') {
                                obj[property] = theList[Math.floor(Math.random() * theList.length)];
                            } else if (selector === 'PERM') {
                                obj[property] = shuffleArray(theList);
                            } else if (selector === 'UNIQ') {
                                // If no shuffled version & index stored for this property, create
                                if (!storedProperties.hasOwnProperty(propName)) {
                                    storedProperties[propName] = {'shuffledArray': shuffleArray(theList), 'index': 0};
                                }
                                // Fetch current element from shuffled array
                                obj[property] = storedProperties[propName].shuffledArray[storedProperties[propName].index];
                                // Move to next for next UNIQ element using this property
                                storedProperties[propName].index = storedProperties[propName].index + 1;
                                // Loop around to start if needed
                                if (storedProperties[propName].index == storedProperties[propName].shuffledArray.length) {
                                    storedProperties[propName].index = 0;
                                }
                            } else {
                                throw 'Unknown selector after # in parameter specification';
                            }
                        }
                    }
                }
            }
        }
        return obj;
    }

    // Select a parameter set to use for this trial.
    if (!(frameConfig.hasOwnProperty('parameterSetWeights'))) {
        frameConfig.parameterSetWeights = new Array(frameConfig.parameterSets.length).fill(1);
    }

    var parameterData = getRandomElement(frameConfig.parameterSets, frameConfig.parameterSetWeights);
    var parameterSetIndex = parameterData[0];
    var parameterSet = parameterData[1];
    var storedProperties = {}; // any properties we need to permute and keep track of indices within, across frames, when replacing

    var frames = [];
    var thisFrame = {};

    for (var iFrame = 0; iFrame < frameConfig.frameList.length; iFrame++) {

        // Assign parameters common to all frames made by this randomizer.
        // Use deep copies to make sure that substitutions (replaceValues)
        // don't affect the original frameConfig values if they're objects
        // themselves!!
        thisFrame = {};
        Ember.$.extend(true, thisFrame, frameConfig.commonFrameProperties);

        // Assign parameters specific to this frame (allow to override
        // common parameters assigned above)
        Ember.$.extend(true, thisFrame, frameConfig.frameList[iFrame]);

        // Substitute any properties that can be replaced based on
        // the parameter set.
        thisFrame = replaceValues(thisFrame, parameterSet);

        // Assign frame ID
        //thisFrame.id = `${frameId}`;

        thisFrame = resolveFrame(frameId, thisFrame)[0];
        frames.push(...thisFrame); // spread syntax important here -- a list of frames is returned by resolveFrame.
    }

    /**
     * Parameters captured and sent to the server
     *
     * @method conditions
     * @param {Number} conditionNum the index of the parameterSet chosen
     * @param {Object} parameterSet the parameterSet chosen
     */

    return [frames, {'conditionNum': parameterSetIndex, 'parameterSet': parameterSet}];

};

export default randomizer;

// Export helper functions to support unit testing
export { getRandomElement, randomizer };
