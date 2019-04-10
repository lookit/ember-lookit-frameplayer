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
* @class select
*/

var randomizer = function(frameId, frameConfig, pastSessions, resolveFrame) {

    // Data provided to randomizer (properties of frameConfig):

    /**
     * List of frames that can be created by this randomizer. Each frame is an
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
     * Object describing common parameters to use in EVERY frame created
     * by this randomizer. Parameter names and values are as described in
     * the documentation for the frameType used.
     *
     * @property {Object} commonFrameProperties
     */

    /**
     * Index or indices within frameOptions to actually use. This can be either a number
     * (e.g., 0 or 1 to use the first or second option respectively) or an array providing
     * an ordered list of indices to use (e.g., [0, 1] or [1, 0] to use the first then
     * second or second then first options, respectively).
     *
     * @property {Number} frameIndex
     */

    // TODO: input checking
    // TODO: allow providing a list of frame indices

    var thisFrame = {};
    var frames = [];
    if ((typeof frameConfig.frameIndex) === 'number') {
        frameConfig.frameIndex = [frameConfig.frameIndex];
    }

    for (var iFrame = 0; iFrame < frameConfig.frameIndex.length; iFrame++) {
        // Assign parameters common to all frames made by this randomizer
        thisFrame = {};
        Object.assign(thisFrame, frameConfig.commonFrameProperties);

        // Assign parameters specific to this frame (allow to override
        // common parameters assigned above)
        Object.assign(thisFrame, frameConfig.frameOptions[frameConfig.frameIndex[iFrame]]);

        thisFrame = resolveFrame(frameId, thisFrame)[0];
        frames.push(...thisFrame);
    }

    /**
     * Parameters captured and sent to the server
     *
     * @method conditions
     * @param {Object[]} frameIndex the index of the frame used
     */
    return [frames, {'frameIndex': frameConfig.frameIndex}];
};
export default randomizer;
