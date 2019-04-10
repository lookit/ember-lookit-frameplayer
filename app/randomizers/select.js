/**
* @module exp-player
* @submodule randomizers
*/

/**
* Randomizer to allow selection of one (or arbitrary sequence) of defined frames.
* Intended to be useful for e.g. selecting which of several paths to take upon completion
* of an eligibility survey, in conjunction with a custom generateProperties function.
*
* To use, define a frame with "kind": "choice" and "sampler": "select",
* as shown below, in addition to the parameters described under 'properties'.
*
```json
"frames": {
    "select-randomizer-test": {
        "sampler": "select",
        "kind": "choice",
        "frameIndex": 0,
        "commonFrameProperties": {
            "kind": "exp-lookit-text"
        },
        "frameOptions": [
            {
                "blocks": [
                    {
                        "emph": true,
                        "text": "Let's think about hippos!",
                        "title": "FRAME 1"
                    },
                    {
                        "text": "Some more about hippos..."
                    }
                ]
            },
            {
                "blocks": [
                    {
                        "emph": false,
                        "text": "Let's think about dolphins!",
                        "title": "FRAME 2"
                    }
                ]
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
     * Index or indices (0-indexed) within frameOptions to actually use. This can be either a number
     * (e.g., 0 or 1 to use the first or second option respectively) or an array providing
     * an ordered list of indices to use (e.g., [0, 1] or [1, 0] to use the first then
     * second or second then first options, respectively). All indices must be integers
     * in [0, frameOptions.length).
     *
     * If not provided or False, the entire frameOptions list is used in order. (If empty
     * list is provided, however, that is respected and no frames are inserted by this
     * randomizer.)
     *
     * @property {Number} frameIndex
     */

    var thisFrame = {};
    var frames = [];

    // If a single frame index is provided, convert to a single-element list
    if ((typeof frameConfig.frameIndex) === 'number') {
        frameConfig.frameIndex = [frameConfig.frameIndex];
    } else if (!frameConfig.hasOwnProperty('frameIndex') || !frameConfig.frameIndex) {
        frameConfig.frameIndex = [...frameConfig.frameOptions.keys()];
    }

    for (var iFrame = 0; iFrame < frameConfig.frameIndex.length; iFrame++) {
        if (frameConfig.frameIndex[iFrame] < 0 || frameConfig.frameIndex[iFrame] >= frameConfig.frameOptions.length) {
            throw `Frame index out of range in select randomizer. All frame indices must be between 0 and frameOptions.length - 1.`;
        }

        // Assign parameters common to all frames made by this randomizer
        thisFrame = {};
        Object.assign(thisFrame, frameConfig.commonFrameProperties);

        // Assign parameters specific to this frame (allow to override
        // common parameters assigned above)
        Object.assign(thisFrame, frameConfig.frameOptions[frameConfig.frameIndex[iFrame]]);

        thisFrame = resolveFrame(frameId + '-' + iFrame + '-' + thisFrame.kind, thisFrame)[0];
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
