/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js, like this:

import <%= camelizedModuleName %> from './<%= dasherizedModuleName %>';
...
export default {
    ...
    <%= dasherizedModuleName %>: <%= camelizedModuleName %>
};

For example:

import randomParameterSet from './random-parameter-set';

export default {
    ...
    'random-parameter-set': randomParameterSet
};

 */


/**
* TODO: SHORT DESCRIPTION OF YOUR RANDOMIZER FRAME HERE (will be used by YUIdoc)
* INSERT EXAMPLE USAGE BELOW.

*
```json
"frames": {
    "test-trials": {
        "sampler": "your-randomizer-name",
        "kind": "choice",
        "id": "test-trials"
    }
}

* ```
* @class yourRandomizerName
*/


var randomizer = function(/*frameId, frameConfig, pastSessions, resolveFrame*/) {
    /*  Arguments:
    frameId: An ID for the set of frames being created, provided by the end user in their
        study JSON as the ID for this randomizer frame (e.g. 'test-trials')
    frameConfig: This object contains all the properties the end user of your randomizer
        specifies in their study JSON. E.g., if a property 'startOnLeft' is provided, you
        can access it as frameConfig.startOnLeft.
    pastSessions: A list of all past sessions for this study/participant pair, from newest
        to oldest. Each session has the data corresponding to the "response" data described here:
        https://lookit.readthedocs.io/en/latest/experimentdata.html#structure-of-session-data
    resolveFrame: A function that takes a frame ID and frame object and resolves any
        dependencies to return [resolvedFrames, conditions], just like this randomizer does.
        If you have created a single frame to return (an object with properties corresponding to
        the info that frame type needs), you can resolve it using
        resolveFrame(yourFrameID, yourFrame)[0] (which will be a list of your one frame).
        If you are making a sequence of frames (e.g. deciding the order of a set of frames),
        you will need to put the resolved lists together.
    */


    // To specify the data a user needs to provide to your randomizer (i.e. the expected
    // fields of frameConfig), include YUIdoc "properties" using YUIdoc comment syntax.
    // These can be anywhere in your file. Here's an example...

    /**
     * An example property.
     *
     * @property {Boolean} whetherToStartOnLeft
     */


    /* Return:
         resolvedFrames: a list of resolved frames that have resulted from your randomization
           process, like resolveFrames(...)[0] returns.
         conditions: an object with keys/values for any conditions assigned during randomization,
           which will become available to end research user in the 'conditions' field of their
           response data. These keys should be documented as shown below, using a 'method'
           called 'conditions':
    */

    /**
     * Parameters captured and sent to the server
     *
     * @attribute conditions
     * @param {Number} exampleConditionNumber which condition was chosen
     * @param {Array} exampleConditionObject which images were shown
     */

    // return [resolvedFrames, conditions]

};
export default randomizer;
