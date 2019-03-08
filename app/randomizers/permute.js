/**
* @module exp-player
* @submodule randomizers
*/

/**
* Randomizer to allow random ordering of a list of frames. Intended to be
* useful for e.g. randomly permuting the order of particular stimuli used during
* a set of trials (although frames need not be of the same kind to permute).
*
* To use, define a frame with "kind": "choice" and "sampler": "permute",
* as shown below, in addition to the parameters described under 'properties'.
*
```json
"frames": {
    "test-trials": {
        "sampler": "permute",
        "kind": "choice",
        "commonFrameProperties": {
            "showPreviousButton": false
        },
        "frameOptions": [
            {
                "blocks": [
                    {
                        "emph": true,
                        "text": "Let's think about hippos!",
                        "title": "hippos!"
                    },
                    {
                        "text": "Some more about hippos..."
                    }
                ],
                "kind": "exp-lookit-text"
            },
            {
                "blocks": [
                    {
                        "emph": false,
                        "text": "Let's think about dolphins!",
                        "title": "dolphins!"
                    }
                ],
                "kind": "exp-lookit-text"
            }
        ]
    }
}
*
* ```
* @class permute
*/

var randomizer = function(frameId, frameConfig, pastSessions, resolveFrame) {

    // Data provided to randomizer (properties of frameConfig):

    /**
     * List of frames to be created by this randomizer. Each frame is an
     * object with any necessary frame-specific properties specified. The
     * 'kind' of frame can be specified either here (per frame) or in
     * commonFrameProperties. If a property is defined for a given frame both
     * in this frame list and in commonFrameProperties, the value in the frame
     * list will take precedence.
     *
     * (E.g., you could include 'kind': 'normal-frame' in
     * commmonFrameProperties, but for a single frame in frameOptions, include
     * 'kind': 'special-frame'.)
     *
     * @property {Object[]} frameOptions
     */

    /**
     * List of sets of frame properties of the same length as frameOptions. The order
     * of this list will be preserved; the properties in orderedFrameOptions[0] will be added to the
     * frame shown first, the properties in orderedFrameOptions[1] will be added to the
     * frame shown second, etc. Properties are applied in this order:
     * commonFrameProperties, frameOptions, orderedFrameOptions
     * so orderedFrameOptions properties will take priority over regular frameOptions.
     * This allows you to, for instance, do something different during the first or last
     * trial (e.g., a practice/training trial or a debriefing trial).
     * If `parameterSets` is included as one of the properties in orderedFrameOptions[n],
     * the values will be added to any parameterSets property on the existing frame
     * (value-by-value, iterating through corresponding parameterSets)
     * rather than overwriting the whole property.
     *
     * @property {Object[]} orderedFrameOptions
     */

    /**
     * Object describing common parameters to use in EVERY frame created
     * by this randomizer. Parameter names and values are as described in
     * the documentation for the frameType used.
     *
     * @property {Object} commonFrameProperties
     */

    // TODO: input checking. Make sure all parameters are given or impute empty vals if
    // not; make sure orderedFrameOptions.length == frameOptions.length if both are given

    // TODO: allow optional specification of how many frames to create!

    /*
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     */
    var array = frameConfig.frameOptions.slice();
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    var thisFrame = {};
    var frames = [];
    for (var iFrame = 0; iFrame < array.length; iFrame++) {
        // Assign parameters common to all frames made by this randomizer
        thisFrame = {};
        Object.assign(thisFrame, frameConfig.commonFrameProperties);

        // Assign parameters specific to this frame (allow to override
        // common parameters assigned above)
        Object.assign(thisFrame, array[iFrame]);

        // Assign parameters specific to the frame occupying this position
        // in the ordered list. These override everything else. If `parameterSets` are
        // included, they are *added* to any parameterSets, rather than overwriting.
        if (frameConfig.hasOwnProperty('orderedFrameOptions') && frameConfig.orderedFrameOptions.length > iFrame) {
            if (frameConfig.orderedFrameOptions[iFrame].hasOwnProperty('parameterSets') && thisFrame.hasOwnProperty('parameterSets')) {
                for (var iPS = 0; iPS < thisFrame.parameterSets.length; iPS++) {
                    Object.assign(thisFrame.parameterSets[iPS], frameConfig.orderedFrameOptions[iFrame].parameterSets[iPS]);
                }
                delete frameConfig.orderedFrameOptions[iFrame].parameterSets;
            }
            Object.assign(thisFrame, frameConfig.orderedFrameOptions[iFrame]);
        }

        thisFrame = resolveFrame(frameId, thisFrame)[0];
        frames.push(...thisFrame);
    }

    /**
     * Parameters captured and sent to the server
     *
     * @method conditions
     * @param {Object[]} frameList the list of frames used, in the final shuffled order
     */
    return [frames, {'frameList': array}];
};
export default randomizer;
