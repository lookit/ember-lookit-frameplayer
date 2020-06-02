import Ember from 'ember';

// http://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/**
 * Select the first matching session from an array of options, according to the specified rules
 *
 * @method getLastSession
 * @param {Session[]} pastSessions An array of session records. This returns the first match, eg assumes newest-first sort order
 * @return {Session} The model representing the last session in which the user participated
 */
function getLastSession(pastSessions) {
    // Base randomization on the newest (last completed) session for which the participant got at
    // least as far as recording data for a single video ID.
    for (let i = 0; i < pastSessions.length; i++) {
        let session = pastSessions[i];
        // Frames might be numbered differently in different experiments... rather than check for a frame ID, check that at least one frame referencing the videos exists at all.
        let expData = session.get('expData') || {};
        let keys = Object.keys(expData);
        for (let i = 0; i < keys.length; i++) {
            let frameKeyName = keys[i];
            let frameData = expData[frameKeyName];
            if (frameKeyName.indexOf('pref-phys-videos') !== -1 && frameData && frameData.videoId) {
                return session;
            }
        }
    }
    // If no match found, explicitly return null
    return null;
}

function getConditions(lastSession, frameId) {
    var startType, showStay, whichObjects;
    const cb = counterbalancingLists();
    // The last session payload refers to the frame we want by number (#-frameName), but frames aren't numbered until the sequence
    //   has been resolved (eg until we expand pref-phys-videos into a series of video frames, we won't know how many
    //   frames there are or in what order)
    // To find the last conditions, we take the last (and presumably only) key of session.conditions that looks like
    //  the name (without the leading number part)

    // This works insofar as this function only targets one sort of frame that we expect to occur only once in
    // the pref-phys experiment. Otherwise this function would get confused.
    let lastConditions = lastSession ? lastSession.get('conditions') : null;
    let lastFrameConditions;
    Object.keys(lastConditions || {}).forEach((keyName) => {
        if (keyName.indexOf(frameId) !== -1) {
            lastFrameConditions = lastConditions[keyName];
        }
    });

    // If there are no conditions from previous sessions, just choose randomly!
    if (!lastFrameConditions) {
        // Select counterbalancing conditions from the pseudorandom lists
        // defined in counterbalancingLists. startType and showStay are
        // indices into conceptOrderRotation and useFallRotation respectively.
        // This is very clunky but preserved to ensure functionality is
        // consistent.

        // startType defines the order in which to rotate through concepts.
        startType = Math.floor(Math.random() * cb.conceptOrderRotation.length);
        // showStay (historical name) says which support comparisons we should
        //    use 'fall' rather than 'stay' videos for.
        showStay = Math.floor(Math.random() * cb.useFallRotation.length);

        // the whichObjects[X] variables select comparison-object pairings to
        // use for [concepts] - G = gravity, I = inertia, S = support,
        // C = control. (E.g., pair 'lotion' with 'down-up ramp' comparison,
        // 'cup' with 'down-up toss' comparison, etc.) Choose random indices
        // into each respective pseudorandom list of possible pairings. (Note
        // that the lists are not simply all permutations, because in a few
        // cases we don't have particular objects for comparisons.)
        const whichObjectG = Math.floor(Math.random() * cb.objectRotations[0].length);
        const whichObjectI = Math.floor(Math.random() * cb.objectRotations[1].length);
        const whichObjectS = Math.floor(Math.random() * cb.objectRotations[2].length);
        const whichObjectC = Math.floor(Math.random() * cb.objectRotations[3].length);
        // Store the indices into the comparison-object mapping lists as one
        // array, gravity/inertia/support/control.
        whichObjects = [whichObjectG, whichObjectI, whichObjectS, whichObjectC];
    } else { // Otherwise, increment each condition, which is actually an index
    // into a predefined pseudorandom list of conditions to loop through.

        startType = lastFrameConditions.startType;
        startType++;
        if (startType >= cb.conceptOrderRotation.length) {
            startType = 0;
        }

        showStay = lastFrameConditions.showStay;
        showStay++;
        if (showStay >= cb.useFallRotation.length) {
            showStay = 0;
        }

        whichObjects = Ember.copy(lastFrameConditions.whichObjects);
        for (var i = 0; i < 4; i++) {
            whichObjects[i]++;
            if (whichObjects[i] >= cb.objectRotations[i].length) {
                whichObjects[i] = 0;
            }
        }
    }
    return {
        startType: startType,
        showStay: showStay,
        whichObjects: whichObjects
    };
}

function counterbalancingLists() {

    // List of comparisons to show 'fall' videos for; each session, increment
    // position in this list so that kids see a variety of stay/fall groupings.
    var useFallRotation = [
        [1, 2, 5],
        [1, 3, 5],
        [0, 1, 5],
        [0, 2, 4],
        [1, 4, 5],
        [0, 3, 5],
        [1, 3, 4],
        [0, 1, 2],
        [1, 2, 3],
        [1, 2, 4],
        [0, 2, 3],
        [0, 1, 4],
        [2, 3, 5],
        [0, 3, 4],
        [0, 2, 5],
        [0, 4, 5],
        [0, 1, 3],
        [2, 3, 4],
        [3, 4, 5],
        [2, 4, 5]
    ];

    var conceptOrderRotation = [
        ['control', 'inertia', 'gravity', 'support'],
        ['support', 'control', 'inertia', 'gravity'],
        ['gravity', 'support', 'inertia', 'control'],
        ['support', 'inertia', 'gravity', 'control'],
        ['gravity', 'inertia', 'support', 'control'],
        ['inertia', 'control', 'support', 'gravity'],
        ['support', 'control', 'gravity', 'inertia'],
        ['gravity', 'support', 'control', 'inertia'],
        ['inertia', 'control', 'gravity', 'support'],
        ['inertia', 'gravity', 'control', 'support'],
        ['support', 'inertia', 'control', 'gravity'],
        ['control', 'support', 'inertia', 'gravity'],
        ['gravity', 'control', 'inertia', 'support'],
        ['inertia', 'support', 'control', 'gravity'],
        ['inertia', 'support', 'gravity', 'control'],
        ['gravity', 'control', 'support', 'inertia'],
        ['control', 'gravity', 'support', 'inertia'],
        ['inertia', 'gravity', 'support', 'control'],
        ['control', 'support', 'gravity', 'inertia'],
        ['control', 'inertia', 'support', 'gravity'],
        ['support', 'gravity', 'control', 'inertia'],
        ['support', 'gravity', 'inertia', 'control'],
        ['control', 'gravity', 'inertia', 'support'],
        ['gravity', 'inertia', 'control', 'support']
    ];

    var gravityObjectRotation = [
        ['lotion', 'whiteball', 'orangeball', 'cup', 'apple', 'spray'],
        ['apple', 'cup', 'orangeball', 'spray', 'whiteball', 'lotion'],
        ['apple', 'orangeball', 'cup', 'whiteball', 'spray', 'lotion'],
        ['orangeball', 'lotion', 'apple', 'cup', 'whiteball', 'spray'],
        ['orangeball', 'lotion', 'cup', 'apple', 'spray', 'whiteball'],
        ['lotion', 'whiteball', 'apple', 'spray', 'cup', 'orangeball'],
        ['apple', 'orangeball', 'whiteball', 'lotion', 'cup', 'spray'],
        ['lotion', 'orangeball', 'cup', 'spray', 'whiteball', 'apple'],
        ['cup', 'orangeball', 'whiteball', 'lotion', 'apple', 'spray'],
        ['lotion', 'orangeball', 'apple', 'whiteball', 'spray', 'cup'],
        ['cup', 'apple', 'orangeball', 'whiteball', 'spray', 'lotion'],
        ['orangeball', 'lotion', 'whiteball', 'apple', 'spray', 'cup'],
        ['orangeball', 'apple', 'lotion', 'whiteball', 'spray', 'cup'],
        ['apple', 'cup', 'orangeball', 'whiteball', 'lotion', 'spray'],
        ['whiteball', 'orangeball', 'cup', 'spray', 'apple', 'lotion'],
        ['cup', 'apple', 'lotion', 'spray', 'whiteball', 'orangeball'],
        ['apple', 'orangeball', 'whiteball', 'cup', 'lotion', 'spray'],
        ['orangeball', 'whiteball', 'lotion', 'spray', 'apple', 'cup'],
        ['apple', 'lotion', 'cup', 'spray', 'whiteball', 'orangeball'],
        ['apple', 'cup', 'orangeball', 'spray', 'lotion', 'whiteball'],
        ['lotion', 'orangeball', 'whiteball', 'spray', 'cup', 'apple'],
        ['lotion', 'cup', 'orangeball', 'spray', 'whiteball', 'apple'],
        ['orangeball', 'cup', 'apple', 'spray', 'whiteball', 'lotion'],
        ['orangeball', 'cup', 'apple', 'lotion', 'spray', 'whiteball'],
        ['orangeball', 'apple', 'lotion', 'spray', 'cup', 'whiteball'],
        ['orangeball', 'cup', 'whiteball', 'lotion', 'spray', 'apple'],
        ['orangeball', 'apple', 'whiteball', 'lotion', 'spray', 'cup'],
        ['whiteball', 'lotion', 'orangeball', 'apple', 'spray', 'cup'],
        ['orangeball', 'whiteball', 'cup', 'apple', 'lotion', 'spray'],
        ['orangeball', 'apple', 'whiteball', 'cup', 'spray', 'lotion'],
        ['lotion', 'orangeball', 'cup', 'whiteball', 'spray', 'apple'],
        ['cup', 'whiteball', 'orangeball', 'lotion', 'apple', 'spray'],
        ['whiteball', 'apple', 'lotion', 'cup', 'spray', 'orangeball'],
        ['cup', 'apple', 'orangeball', 'spray', 'whiteball', 'lotion'],
        ['whiteball', 'orangeball', 'lotion', 'spray', 'apple', 'cup'],
        ['apple', 'whiteball', 'lotion', 'spray', 'cup', 'orangeball'],
        ['lotion', 'apple', 'cup', 'whiteball', 'spray', 'orangeball'],
        ['apple', 'cup', 'lotion', 'spray', 'whiteball', 'orangeball'],
        ['apple', 'whiteball', 'orangeball', 'cup', 'lotion', 'spray'],
        ['apple', 'lotion', 'orangeball', 'whiteball', 'spray', 'cup'],
        ['lotion', 'orangeball', 'whiteball', 'spray', 'apple', 'cup'],
        ['lotion', 'cup', 'orangeball', 'whiteball', 'apple', 'spray'],
        ['orangeball', 'lotion', 'apple', 'spray', 'cup', 'whiteball'],
        ['whiteball', 'cup', 'orangeball', 'spray', 'lotion', 'apple'],
        ['lotion', 'apple', 'orangeball', 'whiteball', 'spray', 'cup'],
        ['whiteball', 'apple', 'cup', 'spray', 'lotion', 'orangeball'],
        ['lotion', 'orangeball', 'apple', 'spray', 'cup', 'whiteball'],
        ['orangeball', 'cup', 'lotion', 'whiteball', 'spray', 'apple'],
        ['whiteball', 'lotion', 'apple', 'cup', 'spray', 'orangeball'],
        ['cup', 'whiteball', 'orangeball', 'spray', 'apple', 'lotion'],
        ['apple', 'orangeball', 'lotion', 'cup', 'spray', 'whiteball'],
        ['cup', 'orangeball', 'apple', 'lotion', 'spray', 'whiteball'],
        ['cup', 'orangeball', 'whiteball', 'lotion', 'spray', 'apple'],
        ['whiteball', 'orangeball', 'cup', 'apple', 'spray', 'lotion'],
        ['whiteball', 'orangeball', 'cup', 'lotion', 'apple', 'spray'],
        ['orangeball', 'whiteball', 'apple', 'cup', 'spray', 'lotion'],
        ['whiteball', 'orangeball', 'lotion', 'apple', 'cup', 'spray'],
        ['cup', 'whiteball', 'orangeball', 'apple', 'lotion', 'spray'],
        ['cup', 'lotion', 'whiteball', 'apple', 'spray', 'orangeball'],
        ['whiteball', 'cup', 'orangeball', 'apple', 'spray', 'lotion'],
        ['orangeball', 'cup', 'lotion', 'spray', 'whiteball', 'apple'],
        ['cup', 'apple', 'orangeball', 'lotion', 'spray', 'whiteball'],
        ['whiteball', 'orangeball', 'apple', 'spray', 'lotion', 'cup'],
        ['apple', 'orangeball', 'cup', 'lotion', 'whiteball', 'spray'],
        ['apple', 'cup', 'orangeball', 'lotion', 'spray', 'whiteball'],
        ['whiteball', 'orangeball', 'apple', 'spray', 'cup', 'lotion'],
        ['lotion', 'apple', 'orangeball', 'spray', 'whiteball', 'cup'],
        ['lotion', 'whiteball', 'cup', 'spray', 'apple', 'orangeball'],
        ['orangeball', 'apple', 'lotion', 'cup', 'whiteball', 'spray'],
        ['orangeball', 'apple', 'cup', 'whiteball', 'spray', 'lotion'],
        ['lotion', 'apple', 'cup', 'spray', 'whiteball', 'orangeball'],
        ['lotion', 'apple', 'whiteball', 'spray', 'cup', 'orangeball'],
        ['cup', 'lotion', 'orangeball', 'apple', 'whiteball', 'spray'],
        ['lotion', 'orangeball', 'whiteball', 'cup', 'apple', 'spray'],
        ['orangeball', 'cup', 'apple', 'whiteball', 'lotion', 'spray'],
        ['apple', 'cup', 'whiteball', 'spray', 'lotion', 'orangeball'],
        ['orangeball', 'cup', 'whiteball', 'spray', 'lotion', 'apple'],
        ['whiteball', 'orangeball', 'apple', 'lotion', 'spray', 'cup'],
        ['cup', 'orangeball', 'apple', 'whiteball', 'lotion', 'spray'],
        ['orangeball', 'cup', 'whiteball', 'apple', 'spray', 'lotion'],
        ['lotion', 'orangeball', 'whiteball', 'cup', 'spray', 'apple'],
        ['orangeball', 'apple', 'cup', 'lotion', 'spray', 'whiteball'],
        ['cup', 'whiteball', 'apple', 'spray', 'lotion', 'orangeball'],
        ['whiteball', 'orangeball', 'cup', 'apple', 'lotion', 'spray'],
        ['apple', 'orangeball', 'whiteball', 'spray', 'lotion', 'cup'],
        ['whiteball', 'orangeball', 'cup', 'lotion', 'spray', 'apple'],
        ['whiteball', 'cup', 'orangeball', 'lotion', 'spray', 'apple'],
        ['orangeball', 'whiteball', 'lotion', 'cup', 'spray', 'apple'],
        ['apple', 'orangeball', 'lotion', 'whiteball', 'cup', 'spray'],
        ['apple', 'whiteball', 'cup', 'lotion', 'spray', 'orangeball'],
        ['orangeball', 'lotion', 'whiteball', 'spray', 'apple', 'cup'],
        ['orangeball', 'cup', 'apple', 'whiteball', 'spray', 'lotion'],
        ['lotion', 'cup', 'orangeball', 'spray', 'apple', 'whiteball'],
        ['orangeball', 'lotion', 'cup', 'whiteball', 'spray', 'apple'],
        ['lotion', 'orangeball', 'cup', 'spray', 'apple', 'whiteball'],
        ['orangeball', 'apple', 'whiteball', 'spray', 'cup', 'lotion'],
        ['whiteball', 'orangeball', 'apple', 'cup', 'lotion', 'spray'],
        ['orangeball', 'cup', 'apple', 'spray', 'lotion', 'whiteball'],
        ['orangeball', 'cup', 'lotion', 'whiteball', 'apple', 'spray'],
        ['orangeball', 'apple', 'cup', 'whiteball', 'lotion', 'spray'],
        ['whiteball', 'cup', 'orangeball', 'lotion', 'apple', 'spray'],
        ['orangeball', 'whiteball', 'apple', 'lotion', 'cup', 'spray'],
        ['cup', 'orangeball', 'lotion', 'apple', 'spray', 'whiteball'],
        ['whiteball', 'lotion', 'orangeball', 'spray', 'cup', 'apple'],
        ['cup', 'lotion', 'orangeball', 'spray', 'apple', 'whiteball'],
        ['apple', 'cup', 'orangeball', 'lotion', 'whiteball', 'spray'],
        ['apple', 'lotion', 'whiteball', 'spray', 'cup', 'orangeball'],
        ['lotion', 'apple', 'orangeball', 'cup', 'whiteball', 'spray'],
        ['orangeball', 'whiteball', 'lotion', 'apple', 'spray', 'cup'],
        ['apple', 'lotion', 'whiteball', 'cup', 'spray', 'orangeball'],
        ['cup', 'orangeball', 'apple', 'spray', 'lotion', 'whiteball'],
        ['orangeball', 'lotion', 'apple', 'whiteball', 'cup', 'spray'],
        ['apple', 'cup', 'whiteball', 'lotion', 'spray', 'orangeball'],
        ['orangeball', 'apple', 'lotion', 'spray', 'whiteball', 'cup'],
        ['orangeball', 'apple', 'whiteball', 'cup', 'lotion', 'spray'],
        ['orangeball', 'apple', 'cup', 'spray', 'whiteball', 'lotion'],
        ['cup', 'whiteball', 'apple', 'lotion', 'spray', 'orangeball'],
        ['whiteball', 'orangeball', 'lotion', 'cup', 'spray', 'apple'],
        ['lotion', 'orangeball', 'cup', 'apple', 'whiteball', 'spray'],
        ['whiteball', 'apple', 'orangeball', 'spray', 'cup', 'lotion'],
        ['orangeball', 'lotion', 'apple', 'whiteball', 'spray', 'cup'],
        ['lotion', 'orangeball', 'whiteball', 'apple', 'cup', 'spray'],
        ['whiteball', 'lotion', 'cup', 'apple', 'spray', 'orangeball'],
        ['whiteball', 'lotion', 'apple', 'spray', 'cup', 'orangeball'],
        ['whiteball', 'orangeball', 'lotion', 'apple', 'spray', 'cup'],
        ['lotion', 'orangeball', 'cup', 'apple', 'spray', 'whiteball'],
        ['apple', 'orangeball', 'lotion', 'spray', 'whiteball', 'cup'],
        ['lotion', 'cup', 'orangeball', 'apple', 'whiteball', 'spray'],
        ['apple', 'orangeball', 'whiteball', 'cup', 'spray', 'lotion'],
        ['lotion', 'cup', 'orangeball', 'whiteball', 'spray', 'apple'],
        ['cup', 'apple', 'whiteball', 'spray', 'lotion', 'orangeball'],
        ['cup', 'orangeball', 'lotion', 'apple', 'whiteball', 'spray'],
        ['apple', 'lotion', 'orangeball', 'spray', 'cup', 'whiteball'],
        ['cup', 'lotion', 'orangeball', 'whiteball', 'apple', 'spray'],
        ['orangeball', 'whiteball', 'cup', 'spray', 'apple', 'lotion'],
        ['lotion', 'whiteball', 'orangeball', 'spray', 'cup', 'apple'],
        ['lotion', 'orangeball', 'apple', 'cup', 'whiteball', 'spray'],
        ['orangeball', 'whiteball', 'apple', 'spray', 'lotion', 'cup'],
        ['whiteball', 'orangeball', 'lotion', 'spray', 'cup', 'apple'],
        ['apple', 'lotion', 'orangeball', 'cup', 'whiteball', 'spray'],
        ['apple', 'whiteball', 'cup', 'spray', 'lotion', 'orangeball'],
        ['whiteball', 'apple', 'cup', 'lotion', 'spray', 'orangeball'],
        ['whiteball', 'cup', 'orangeball', 'apple', 'lotion', 'spray'],
        ['cup', 'orangeball', 'apple', 'lotion', 'whiteball', 'spray'],
        ['lotion', 'orangeball', 'apple', 'whiteball', 'cup', 'spray'],
        ['cup', 'lotion', 'orangeball', 'apple', 'spray', 'whiteball'],
        ['cup', 'apple', 'whiteball', 'lotion', 'spray', 'orangeball'],
        ['cup', 'apple', 'orangeball', 'lotion', 'whiteball', 'spray'],
        ['lotion', 'whiteball', 'orangeball', 'spray', 'apple', 'cup'],
        ['apple', 'whiteball', 'orangeball', 'lotion', 'spray', 'cup'],
        ['cup', 'apple', 'orangeball', 'whiteball', 'lotion', 'spray'],
        ['orangeball', 'lotion', 'whiteball', 'cup', 'apple', 'spray'],
        ['apple', 'whiteball', 'orangeball', 'lotion', 'cup', 'spray'],
        ['whiteball', 'apple', 'orangeball', 'cup', 'lotion', 'spray'],
        ['orangeball', 'whiteball', 'cup', 'lotion', 'apple', 'spray'],
        ['orangeball', 'lotion', 'whiteball', 'apple', 'cup', 'spray'],
        ['cup', 'orangeball', 'lotion', 'spray', 'apple', 'whiteball'],
        ['lotion', 'whiteball', 'cup', 'apple', 'spray', 'orangeball'],
        ['whiteball', 'orangeball', 'apple', 'lotion', 'cup', 'spray'],
        ['orangeball', 'whiteball', 'apple', 'spray', 'cup', 'lotion'],
        ['whiteball', 'lotion', 'orangeball', 'cup', 'spray', 'apple'],
        ['cup', 'apple', 'lotion', 'whiteball', 'spray', 'orangeball'],
        ['orangeball', 'lotion', 'apple', 'cup', 'spray', 'whiteball'],
        ['cup', 'whiteball', 'orangeball', 'apple', 'spray', 'lotion'],
        ['cup', 'whiteball', 'lotion', 'apple', 'spray', 'orangeball'],
        ['lotion', 'cup', 'whiteball', 'apple', 'spray', 'orangeball'],
        ['cup', 'orangeball', 'whiteball', 'apple', 'lotion', 'spray'],
        ['whiteball', 'lotion', 'orangeball', 'cup', 'apple', 'spray'],
        ['whiteball', 'lotion', 'cup', 'spray', 'apple', 'orangeball'],
        ['orangeball', 'whiteball', 'cup', 'spray', 'lotion', 'apple'],
        ['cup', 'orangeball', 'lotion', 'whiteball', 'apple', 'spray'],
        ['apple', 'orangeball', 'lotion', 'whiteball', 'spray', 'cup'],
        ['orangeball', 'whiteball', 'lotion', 'spray', 'cup', 'apple'],
        ['apple', 'orangeball', 'whiteball', 'lotion', 'spray', 'cup'],
        ['orangeball', 'apple', 'lotion', 'cup', 'spray', 'whiteball'],
        ['apple', 'orangeball', 'cup', 'spray', 'lotion', 'whiteball'],
        ['lotion', 'whiteball', 'orangeball', 'apple', 'spray', 'cup'],
        ['cup', 'lotion', 'whiteball', 'spray', 'apple', 'orangeball'],
        ['apple', 'cup', 'lotion', 'whiteball', 'spray', 'orangeball'],
        ['orangeball', 'whiteball', 'apple', 'lotion', 'spray', 'cup'],
        ['orangeball', 'whiteball', 'apple', 'cup', 'lotion', 'spray'],
        ['whiteball', 'cup', 'apple', 'lotion', 'spray', 'orangeball'],
        ['lotion', 'apple', 'orangeball', 'spray', 'cup', 'whiteball'],
        ['whiteball', 'cup', 'apple', 'spray', 'lotion', 'orangeball'],
        ['lotion', 'apple', 'orangeball', 'whiteball', 'cup', 'spray'],
        ['whiteball', 'apple', 'orangeball', 'lotion', 'spray', 'cup'],
        ['apple', 'lotion', 'orangeball', 'whiteball', 'cup', 'spray'],
        ['orangeball', 'cup', 'whiteball', 'spray', 'apple', 'lotion'],
        ['apple', 'whiteball', 'orangeball', 'spray', 'cup', 'lotion'],
        ['orangeball', 'apple', 'whiteball', 'lotion', 'cup', 'spray'],
        ['lotion', 'cup', 'apple', 'whiteball', 'spray', 'orangeball'],
        ['cup', 'lotion', 'orangeball', 'whiteball', 'spray', 'apple'],
        ['lotion', 'orangeball', 'apple', 'spray', 'whiteball', 'cup'],
        ['apple', 'orangeball', 'cup', 'lotion', 'spray', 'whiteball'],
        ['orangeball', 'apple', 'whiteball', 'spray', 'lotion', 'cup'],
        ['lotion', 'cup', 'apple', 'spray', 'whiteball', 'orangeball'],
        ['lotion', 'cup', 'orangeball', 'apple', 'spray', 'whiteball'],
        ['orangeball', 'apple', 'lotion', 'whiteball', 'cup', 'spray'],
        ['cup', 'orangeball', 'whiteball', 'apple', 'spray', 'lotion'],
        ['cup', 'lotion', 'apple', 'spray', 'whiteball', 'orangeball'],
        ['whiteball', 'apple', 'lotion', 'spray', 'cup', 'orangeball'],
        ['lotion', 'orangeball', 'whiteball', 'apple', 'spray', 'cup'],
        ['orangeball', 'cup', 'lotion', 'apple', 'whiteball', 'spray'],
        ['whiteball', 'orangeball', 'apple', 'cup', 'spray', 'lotion'],
        ['cup', 'orangeball', 'whiteball', 'spray', 'apple', 'lotion'],
        ['lotion', 'whiteball', 'orangeball', 'cup', 'spray', 'apple'],
        ['orangeball', 'lotion', 'apple', 'spray', 'whiteball', 'cup'],
        ['orangeball', 'cup', 'lotion', 'apple', 'spray', 'whiteball'],
        ['orangeball', 'lotion', 'cup', 'apple', 'whiteball', 'spray'],
        ['whiteball', 'orangeball', 'lotion', 'cup', 'apple', 'spray'],
        ['cup', 'whiteball', 'orangeball', 'lotion', 'spray', 'apple'],
        ['orangeball', 'lotion', 'cup', 'spray', 'apple', 'whiteball'],
        ['cup', 'whiteball', 'lotion', 'spray', 'apple', 'orangeball'],
        ['cup', 'apple', 'orangeball', 'spray', 'lotion', 'whiteball'],
        ['orangeball', 'cup', 'whiteball', 'apple', 'lotion', 'spray'],
        ['lotion', 'orangeball', 'apple', 'cup', 'spray', 'whiteball'],
        ['apple', 'orangeball', 'whiteball', 'spray', 'cup', 'lotion'],
        ['lotion', 'cup', 'whiteball', 'spray', 'apple', 'orangeball'],
        ['apple', 'orangeball', 'cup', 'whiteball', 'lotion', 'spray'],
        ['apple', 'whiteball', 'orangeball', 'spray', 'lotion', 'cup'],
        ['orangeball', 'whiteball', 'lotion', 'apple', 'cup', 'spray'],
        ['orangeball', 'whiteball', 'cup', 'lotion', 'spray', 'apple'],
        ['whiteball', 'lotion', 'orangeball', 'spray', 'apple', 'cup'],
        ['lotion', 'apple', 'whiteball', 'cup', 'spray', 'orangeball'],
        ['apple', 'lotion', 'orangeball', 'spray', 'whiteball', 'cup'],
        ['apple', 'whiteball', 'orangeball', 'cup', 'spray', 'lotion'],
        ['whiteball', 'orangeball', 'cup', 'spray', 'lotion', 'apple'],
        ['whiteball', 'apple', 'orangeball', 'lotion', 'cup', 'spray'],
        ['cup', 'orangeball', 'lotion', 'spray', 'whiteball', 'apple'],
        ['orangeball', 'cup', 'lotion', 'spray', 'apple', 'whiteball'],
        ['whiteball', 'lotion', 'orangeball', 'apple', 'cup', 'spray'],
        ['lotion', 'orangeball', 'cup', 'whiteball', 'apple', 'spray'],
        ['whiteball', 'apple', 'orangeball', 'cup', 'spray', 'lotion'],
        ['orangeball', 'lotion', 'cup', 'whiteball', 'apple', 'spray'],
        ['whiteball', 'cup', 'lotion', 'apple', 'spray', 'orangeball'],
        ['orangeball', 'cup', 'apple', 'lotion', 'whiteball', 'spray'],
        ['orangeball', 'lotion', 'cup', 'spray', 'whiteball', 'apple'],
        ['apple', 'cup', 'orangeball', 'whiteball', 'spray', 'lotion'],
        ['lotion', 'apple', 'orangeball', 'cup', 'spray', 'whiteball'],
        ['apple', 'lotion', 'orangeball', 'cup', 'spray', 'whiteball'],
        ['whiteball', 'cup', 'orangeball', 'spray', 'apple', 'lotion'],
        ['apple', 'whiteball', 'lotion', 'cup', 'spray', 'orangeball'],
        ['whiteball', 'cup', 'lotion', 'spray', 'apple', 'orangeball'],
        ['orangeball', 'apple', 'cup', 'lotion', 'whiteball', 'spray'],
        ['whiteball', 'apple', 'orangeball', 'spray', 'lotion', 'cup'],
        ['lotion', 'whiteball', 'apple', 'cup', 'spray', 'orangeball'],
        ['cup', 'lotion', 'apple', 'whiteball', 'spray', 'orangeball'],
        ['orangeball', 'whiteball', 'cup', 'apple', 'spray', 'lotion'],
        ['orangeball', 'cup', 'whiteball', 'lotion', 'apple', 'spray'],
        ['orangeball', 'lotion', 'whiteball', 'cup', 'spray', 'apple'],
        ['apple', 'orangeball', 'lotion', 'cup', 'whiteball', 'spray'],
        ['cup', 'lotion', 'orangeball', 'spray', 'whiteball', 'apple'],
        ['lotion', 'whiteball', 'orangeball', 'apple', 'cup', 'spray'],
        ['orangeball', 'lotion', 'whiteball', 'spray', 'cup', 'apple'],
        ['cup', 'orangeball', 'lotion', 'whiteball', 'spray', 'apple'],
        ['cup', 'orangeball', 'apple', 'spray', 'whiteball', 'lotion'],
        ['cup', 'whiteball', 'orangeball', 'spray', 'lotion', 'apple'],
        ['cup', 'orangeball', 'whiteball', 'spray', 'lotion', 'apple'],
        ['orangeball', 'whiteball', 'lotion', 'cup', 'apple', 'spray'],
        ['orangeball', 'apple', 'cup', 'spray', 'lotion', 'whiteball'],
        ['cup', 'orangeball', 'apple', 'whiteball', 'spray', 'lotion'],
        ['apple', 'lotion', 'cup', 'whiteball', 'spray', 'orangeball'],
        ['apple', 'orangeball', 'cup', 'spray', 'whiteball', 'lotion'],
        ['apple', 'orangeball', 'lotion', 'spray', 'cup', 'whiteball']
    ];

    var supportObjectRotation = [
        ['tissues', 'duck', 'hammer', 'shoe', 'brush', 'book'],
        ['brush', 'tissues', 'hammer', 'duck', 'book', 'shoe'],
        ['shoe', 'hammer', 'book', 'tissues', 'duck', 'brush'],
        ['book', 'hammer', 'shoe', 'tissues', 'brush', 'duck'],
        ['hammer', 'tissues', 'brush', 'duck', 'shoe', 'book'],
        ['shoe', 'brush', 'hammer', 'duck', 'tissues', 'book'],
        ['tissues', 'shoe', 'duck', 'book', 'brush', 'hammer'],
        ['tissues', 'book', 'shoe', 'brush', 'hammer', 'duck'],
        ['hammer', 'shoe', 'tissues', 'brush', 'duck', 'book'],
        ['hammer', 'book', 'brush', 'tissues', 'shoe', 'duck'],
        ['tissues', 'shoe', 'book', 'duck', 'hammer', 'brush'],
        ['brush', 'hammer', 'shoe', 'tissues', 'duck', 'book'],
        ['brush', 'hammer', 'shoe', 'tissues', 'book', 'duck'],
        ['brush', 'hammer', 'duck', 'tissues', 'book', 'shoe'],
        ['duck', 'shoe', 'tissues', 'hammer', 'brush', 'book'],
        ['duck', 'shoe', 'tissues', 'hammer', 'book', 'brush'],
        ['tissues', 'brush', 'book', 'shoe', 'duck', 'hammer'],
        ['hammer', 'tissues', 'shoe', 'brush', 'duck', 'book'],
        ['book', 'tissues', 'hammer', 'shoe', 'brush', 'duck'],
        ['shoe', 'book', 'tissues', 'hammer', 'brush', 'duck'],
        ['hammer', 'brush', 'shoe', 'tissues', 'book', 'duck'],
        ['shoe', 'tissues', 'brush', 'book', 'duck', 'hammer'],
        ['duck', 'brush', 'tissues', 'book', 'hammer', 'shoe'],
        ['brush', 'tissues', 'book', 'shoe', 'duck', 'hammer'],
        ['duck', 'tissues', 'brush', 'hammer', 'book', 'shoe'],
        ['tissues', 'shoe', 'hammer', 'book', 'brush', 'duck'],
        ['shoe', 'duck', 'tissues', 'brush', 'book', 'hammer'],
        ['shoe', 'brush', 'tissues', 'book', 'hammer', 'duck'],
        ['book', 'duck', 'shoe', 'hammer', 'brush', 'tissues'],
        ['book', 'brush', 'shoe', 'tissues', 'duck', 'hammer'],
        ['hammer', 'shoe', 'book', 'tissues', 'brush', 'duck'],
        ['brush', 'shoe', 'tissues', 'book', 'hammer', 'duck'],
        ['brush', 'hammer', 'tissues', 'book', 'duck', 'shoe'],
        ['tissues', 'brush', 'hammer', 'shoe', 'book', 'duck'],
        ['book', 'brush', 'tissues', 'shoe', 'duck', 'hammer'],
        ['shoe', 'brush', 'duck', 'tissues', 'hammer', 'book'],
        ['hammer', 'duck', 'tissues', 'book', 'shoe', 'brush'],
        ['hammer', 'duck', 'book', 'tissues', 'brush', 'shoe'],
        ['tissues', 'hammer', 'book', 'duck', 'shoe', 'brush'],
        ['shoe', 'book', 'brush', 'hammer', 'tissues', 'duck'],
        ['hammer', 'book', 'tissues', 'brush', 'duck', 'shoe'],
        ['hammer', 'brush', 'book', 'shoe', 'duck', 'tissues'],
        ['hammer', 'shoe', 'duck', 'book', 'brush', 'tissues'],
        ['book', 'hammer', 'duck', 'shoe', 'tissues', 'brush'],
        ['shoe', 'brush', 'book', 'tissues', 'duck', 'hammer'],
        ['shoe', 'duck', 'book', 'tissues', 'brush', 'hammer'],
        ['duck', 'hammer', 'brush', 'shoe', 'book', 'tissues'],
        ['tissues', 'hammer', 'book', 'brush', 'shoe', 'duck'],
        ['tissues', 'hammer', 'brush', 'book', 'shoe', 'duck'],
        ['shoe', 'duck', 'book', 'hammer', 'brush', 'tissues'],
        ['shoe', 'tissues', 'duck', 'brush', 'hammer', 'book'],
        ['tissues', 'book', 'shoe', 'duck', 'brush', 'hammer'],
        ['duck', 'shoe', 'hammer', 'tissues', 'brush', 'book'],
        ['shoe', 'tissues', 'brush', 'duck', 'hammer', 'book'],
        ['hammer', 'brush', 'duck', 'tissues', 'shoe', 'book'],
        ['duck', 'tissues', 'brush', 'shoe', 'hammer', 'book'],
        ['shoe', 'hammer', 'brush', 'book', 'duck', 'tissues'],
        ['duck', 'shoe', 'book', 'hammer', 'tissues', 'brush'],
        ['duck', 'book', 'shoe', 'hammer', 'tissues', 'brush'],
        ['book', 'hammer', 'shoe', 'duck', 'tissues', 'brush'],
        ['tissues', 'book', 'shoe', 'brush', 'duck', 'hammer'],
        ['book', 'shoe', 'brush', 'hammer', 'duck', 'tissues'],
        ['tissues', 'book', 'hammer', 'shoe', 'duck', 'brush'],
        ['brush', 'duck', 'book', 'shoe', 'hammer', 'tissues'],
        ['tissues', 'shoe', 'hammer', 'duck', 'brush', 'book'],
        ['hammer', 'book', 'duck', 'brush', 'tissues', 'shoe'],
        ['book', 'shoe', 'hammer', 'tissues', 'duck', 'brush'],
        ['hammer', 'brush', 'shoe', 'duck', 'book', 'tissues'],
        ['hammer', 'tissues', 'duck', 'brush', 'shoe', 'book'],
        ['brush', 'book', 'hammer', 'shoe', 'duck', 'tissues'],
        ['book', 'shoe', 'hammer', 'duck', 'tissues', 'brush'],
        ['hammer', 'brush', 'duck', 'book', 'shoe', 'tissues'],
        ['brush', 'tissues', 'hammer', 'shoe', 'duck', 'book'],
        ['brush', 'book', 'tissues', 'shoe', 'duck', 'hammer'],
        ['tissues', 'book', 'shoe', 'duck', 'hammer', 'brush'],
        ['duck', 'tissues', 'shoe', 'hammer', 'book', 'brush'],
        ['duck', 'book', 'hammer', 'shoe', 'tissues', 'brush'],
        ['brush', 'tissues', 'duck', 'shoe', 'book', 'hammer'],
        ['duck', 'hammer', 'shoe', 'book', 'brush', 'tissues'],
        ['tissues', 'brush', 'book', 'duck', 'shoe', 'hammer'],
        ['book', 'tissues', 'brush', 'duck', 'shoe', 'hammer'],
        ['shoe', 'brush', 'book', 'hammer', 'duck', 'tissues'],
        ['book', 'duck', 'tissues', 'hammer', 'shoe', 'brush'],
        ['shoe', 'book', 'tissues', 'brush', 'duck', 'hammer'],
        ['duck', 'tissues', 'shoe', 'hammer', 'brush', 'book'],
        ['tissues', 'shoe', 'book', 'duck', 'brush', 'hammer'],
        ['hammer', 'book', 'duck', 'tissues', 'shoe', 'brush'],
        ['hammer', 'duck', 'book', 'brush', 'shoe', 'tissues'],
        ['duck', 'shoe', 'brush', 'hammer', 'book', 'tissues'],
        ['tissues', 'duck', 'shoe', 'brush', 'book', 'hammer'],
        ['book', 'duck', 'brush', 'hammer', 'shoe', 'tissues'],
        ['tissues', 'book', 'duck', 'brush', 'shoe', 'hammer'],
        ['duck', 'hammer', 'book', 'brush', 'shoe', 'tissues'],
        ['brush', 'hammer', 'duck', 'shoe', 'book', 'tissues'],
        ['brush', 'duck', 'book', 'shoe', 'tissues', 'hammer'],
        ['hammer', 'tissues', 'shoe', 'book', 'duck', 'brush'],
        ['duck', 'brush', 'book', 'shoe', 'tissues', 'hammer'],
        ['shoe', 'hammer', 'tissues', 'brush', 'book', 'duck'],
        ['duck', 'shoe', 'hammer', 'brush', 'book', 'tissues'],
        ['shoe', 'tissues', 'brush', 'hammer', 'duck', 'book'],
        ['duck', 'book', 'hammer', 'tissues', 'shoe', 'brush'],
        ['hammer', 'shoe', 'duck', 'book', 'tissues', 'brush'],
        ['duck', 'hammer', 'shoe', 'brush', 'tissues', 'book'],
        ['book', 'tissues', 'duck', 'brush', 'hammer', 'shoe'],
        ['tissues', 'brush', 'hammer', 'book', 'shoe', 'duck'],
        ['shoe', 'book', 'brush', 'hammer', 'duck', 'tissues'],
        ['brush', 'book', 'tissues', 'duck', 'shoe', 'hammer'],
        ['shoe', 'brush', 'duck', 'hammer', 'tissues', 'book'],
        ['book', 'brush', 'hammer', 'duck', 'tissues', 'shoe'],
        ['book', 'shoe', 'tissues', 'hammer', 'brush', 'duck'],
        ['duck', 'tissues', 'hammer', 'shoe', 'brush', 'book'],
        ['hammer', 'brush', 'book', 'duck', 'shoe', 'tissues'],
        ['book', 'duck', 'tissues', 'shoe', 'hammer', 'brush'],
        ['hammer', 'duck', 'shoe', 'brush', 'tissues', 'book'],
        ['book', 'hammer', 'brush', 'duck', 'tissues', 'shoe'],
        ['shoe', 'tissues', 'brush', 'duck', 'book', 'hammer'],
        ['duck', 'hammer', 'tissues', 'brush', 'shoe', 'book'],
        ['tissues', 'duck', 'brush', 'book', 'hammer', 'shoe'],
        ['shoe', 'brush', 'duck', 'tissues', 'book', 'hammer'],
        ['brush', 'shoe', 'tissues', 'hammer', 'duck', 'book'],
        ['duck', 'shoe', 'brush', 'book', 'hammer', 'tissues'],
        ['book', 'brush', 'hammer', 'shoe', 'tissues', 'duck'],
        ['tissues', 'brush', 'book', 'hammer', 'duck', 'shoe'],
        ['hammer', 'duck', 'shoe', 'tissues', 'book', 'brush'],
        ['shoe', 'tissues', 'duck', 'hammer', 'brush', 'book'],
        ['brush', 'book', 'duck', 'tissues', 'hammer', 'shoe'],
        ['duck', 'book', 'hammer', 'brush', 'shoe', 'tissues'],
        ['hammer', 'tissues', 'shoe', 'book', 'brush', 'duck'],
        ['tissues', 'duck', 'brush', 'shoe', 'book', 'hammer'],
        ['duck', 'tissues', 'shoe', 'book', 'hammer', 'brush'],
        ['duck', 'hammer', 'brush', 'shoe', 'tissues', 'book'],
        ['brush', 'shoe', 'tissues', 'hammer', 'book', 'duck'],
        ['book', 'hammer', 'duck', 'brush', 'shoe', 'tissues'],
        ['duck', 'shoe', 'brush', 'tissues', 'hammer', 'book'],
        ['duck', 'tissues', 'hammer', 'brush', 'book', 'shoe'],
        ['shoe', 'brush', 'hammer', 'tissues', 'book', 'duck'],
        ['hammer', 'shoe', 'tissues', 'duck', 'book', 'brush'],
        ['duck', 'brush', 'hammer', 'tissues', 'book', 'shoe'],
        ['shoe', 'book', 'hammer', 'tissues', 'brush', 'duck'],
        ['book', 'shoe', 'duck', 'brush', 'hammer', 'tissues'],
        ['tissues', 'book', 'brush', 'duck', 'hammer', 'shoe'],
        ['book', 'hammer', 'shoe', 'tissues', 'duck', 'brush'],
        ['hammer', 'duck', 'brush', 'shoe', 'book', 'tissues'],
        ['brush', 'duck', 'shoe', 'tissues', 'hammer', 'book'],
        ['duck', 'shoe', 'tissues', 'book', 'hammer', 'brush'],
        ['shoe', 'brush', 'duck', 'book', 'tissues', 'hammer'],
        ['book', 'duck', 'hammer', 'tissues', 'shoe', 'brush'],
        ['shoe', 'duck', 'book', 'brush', 'hammer', 'tissues'],
        ['brush', 'hammer', 'shoe', 'duck', 'tissues', 'book'],
        ['brush', 'tissues', 'duck', 'hammer', 'shoe', 'book'],
        ['shoe', 'book', 'duck', 'tissues', 'hammer', 'brush'],
        ['duck', 'book', 'tissues', 'brush', 'hammer', 'shoe'],
        ['tissues', 'brush', 'duck', 'shoe', 'book', 'hammer'],
        ['brush', 'book', 'tissues', 'hammer', 'duck', 'shoe'],
        ['shoe', 'book', 'brush', 'tissues', 'hammer', 'duck'],
        ['brush', 'shoe', 'duck', 'book', 'hammer', 'tissues'],
        ['book', 'duck', 'brush', 'tissues', 'hammer', 'shoe'],
        ['hammer', 'book', 'brush', 'duck', 'shoe', 'tissues'],
        ['hammer', 'shoe', 'tissues', 'book', 'duck', 'brush'],
        ['tissues', 'hammer', 'shoe', 'duck', 'brush', 'book'],
        ['brush', 'shoe', 'duck', 'book', 'tissues', 'hammer'],
        ['duck', 'tissues', 'brush', 'book', 'hammer', 'shoe'],
        ['hammer', 'duck', 'book', 'shoe', 'brush', 'tissues'],
        ['duck', 'hammer', 'shoe', 'tissues', 'brush', 'book'],
        ['book', 'tissues', 'hammer', 'brush', 'shoe', 'duck'],
        ['shoe', 'duck', 'brush', 'book', 'tissues', 'hammer'],
        ['brush', 'tissues', 'duck', 'book', 'shoe', 'hammer'],
        ['shoe', 'tissues', 'book', 'duck', 'hammer', 'brush'],
        ['book', 'shoe', 'duck', 'hammer', 'tissues', 'brush'],
        ['shoe', 'tissues', 'duck', 'book', 'brush', 'hammer'],
        ['hammer', 'brush', 'duck', 'tissues', 'book', 'shoe'],
        ['brush', 'hammer', 'tissues', 'book', 'shoe', 'duck'],
        ['brush', 'shoe', 'hammer', 'book', 'duck', 'tissues'],
        ['shoe', 'duck', 'tissues', 'book', 'hammer', 'brush'],
        ['hammer', 'shoe', 'book', 'duck', 'tissues', 'brush'],
        ['tissues', 'shoe', 'duck', 'brush', 'hammer', 'book'],
        ['duck', 'brush', 'tissues', 'book', 'shoe', 'hammer'],
        ['duck', 'brush', 'hammer', 'shoe', 'book', 'tissues'],
        ['tissues', 'shoe', 'duck', 'book', 'hammer', 'brush'],
        ['hammer', 'tissues', 'duck', 'book', 'brush', 'shoe'],
        ['hammer', 'brush', 'duck', 'book', 'tissues', 'shoe'],
        ['brush', 'tissues', 'duck', 'book', 'hammer', 'shoe'],
        ['tissues', 'book', 'hammer', 'duck', 'shoe', 'brush'],
        ['tissues', 'hammer', 'shoe', 'book', 'brush', 'duck'],
        ['book', 'tissues', 'hammer', 'shoe', 'duck', 'brush'],
        ['tissues', 'book', 'hammer', 'brush', 'duck', 'shoe'],
        ['brush', 'tissues', 'book', 'duck', 'hammer', 'shoe'],
        ['duck', 'shoe', 'book', 'tissues', 'brush', 'hammer'],
        ['duck', 'tissues', 'hammer', 'book', 'shoe', 'brush'],
        ['tissues', 'hammer', 'book', 'shoe', 'brush', 'duck'],
        ['brush', 'tissues', 'shoe', 'book', 'duck', 'hammer'],
        ['hammer', 'duck', 'book', 'brush', 'tissues', 'shoe'],
        ['hammer', 'tissues', 'brush', 'book', 'shoe', 'duck'],
        ['shoe', 'tissues', 'brush', 'book', 'hammer', 'duck'],
        ['book', 'shoe', 'brush', 'duck', 'hammer', 'tissues'],
        ['shoe', 'hammer', 'duck', 'book', 'tissues', 'brush'],
        ['brush', 'book', 'duck', 'hammer', 'shoe', 'tissues'],
        ['tissues', 'shoe', 'brush', 'duck', 'book', 'hammer'],
        ['duck', 'book', 'shoe', 'tissues', 'brush', 'hammer'],
        ['hammer', 'shoe', 'book', 'brush', 'duck', 'tissues'],
        ['tissues', 'brush', 'duck', 'hammer', 'book', 'shoe'],
        ['duck', 'brush', 'shoe', 'tissues', 'book', 'hammer'],
        ['tissues', 'book', 'hammer', 'brush', 'shoe', 'duck'],
        ['shoe', 'duck', 'hammer', 'brush', 'tissues', 'book'],
        ['book', 'shoe', 'hammer', 'brush', 'duck', 'tissues'],
        ['tissues', 'brush', 'hammer', 'book', 'duck', 'shoe'],
        ['brush', 'shoe', 'tissues', 'duck', 'book', 'hammer'],
        ['book', 'hammer', 'brush', 'shoe', 'duck', 'tissues'],
        ['tissues', 'hammer', 'brush', 'book', 'duck', 'shoe'],
        ['brush', 'shoe', 'hammer', 'duck', 'book', 'tissues'],
        ['shoe', 'duck', 'book', 'hammer', 'tissues', 'brush'],
        ['brush', 'hammer', 'duck', 'book', 'tissues', 'shoe'],
        ['brush', 'book', 'tissues', 'hammer', 'shoe', 'duck'],
        ['book', 'hammer', 'brush', 'shoe', 'tissues', 'duck'],
        ['brush', 'tissues', 'hammer', 'duck', 'shoe', 'book'],
        ['tissues', 'duck', 'book', 'hammer', 'brush', 'shoe'],
        ['hammer', 'book', 'shoe', 'brush', 'tissues', 'duck'],
        ['duck', 'shoe', 'tissues', 'brush', 'book', 'hammer'],
        ['tissues', 'hammer', 'book', 'shoe', 'duck', 'brush'],
        ['shoe', 'hammer', 'brush', 'tissues', 'book', 'duck'],
        ['duck', 'shoe', 'hammer', 'book', 'tissues', 'brush'],
        ['book', 'shoe', 'duck', 'hammer', 'brush', 'tissues'],
        ['brush', 'shoe', 'book', 'tissues', 'hammer', 'duck'],
        ['shoe', 'hammer', 'book', 'duck', 'tissues', 'brush'],
        ['tissues', 'brush', 'book', 'shoe', 'hammer', 'duck'],
        ['duck', 'tissues', 'book', 'shoe', 'hammer', 'brush'],
        ['shoe', 'brush', 'book', 'hammer', 'tissues', 'duck'],
        ['book', 'hammer', 'shoe', 'brush', 'duck', 'tissues'],
        ['brush', 'duck', 'shoe', 'tissues', 'book', 'hammer'],
        ['hammer', 'brush', 'duck', 'shoe', 'tissues', 'book'],
        ['duck', 'tissues', 'book', 'brush', 'hammer', 'shoe'],
        ['hammer', 'book', 'tissues', 'shoe', 'duck', 'brush'],
        ['tissues', 'shoe', 'book', 'hammer', 'duck', 'brush'],
        ['brush', 'book', 'tissues', 'duck', 'hammer', 'shoe'],
        ['duck', 'book', 'tissues', 'shoe', 'hammer', 'brush'],
        ['shoe', 'hammer', 'book', 'duck', 'brush', 'tissues'],
        ['duck', 'hammer', 'brush', 'book', 'shoe', 'tissues'],
        ['shoe', 'tissues', 'book', 'hammer', 'duck', 'brush'],
        ['brush', 'duck', 'book', 'tissues', 'shoe', 'hammer'],
        ['brush', 'book', 'hammer', 'duck', 'tissues', 'shoe'],
        ['brush', 'book', 'duck', 'tissues', 'shoe', 'hammer'],
        ['shoe', 'hammer', 'brush', 'duck', 'book', 'tissues'],
        ['shoe', 'duck', 'tissues', 'hammer', 'brush', 'book'],
        ['tissues', 'shoe', 'hammer', 'brush', 'book', 'duck'],
        ['tissues', 'brush', 'shoe', 'book', 'duck', 'hammer'],
        ['hammer', 'tissues', 'shoe', 'brush', 'book', 'duck'],
        ['book', 'hammer', 'tissues', 'duck', 'brush', 'shoe'],
        ['hammer', 'brush', 'shoe', 'book', 'duck', 'tissues'],
        ['tissues', 'brush', 'shoe', 'hammer', 'duck', 'book'],
        ['tissues', 'brush', 'duck', 'shoe', 'hammer', 'book'],
        ['hammer', 'shoe', 'duck', 'brush', 'tissues', 'book'],
        ['book', 'brush', 'duck', 'tissues', 'hammer', 'shoe'],
        ['brush', 'book', 'duck', 'hammer', 'tissues', 'shoe'],
        ['tissues', 'book', 'brush', 'shoe', 'hammer', 'duck'],
        ['book', 'tissues', 'duck', 'hammer', 'brush', 'shoe'],
        ['book', 'shoe', 'hammer', 'duck', 'brush', 'tissues'],
        ['hammer', 'tissues', 'book', 'duck', 'brush', 'shoe'],
        ['book', 'brush', 'duck', 'hammer', 'shoe', 'tissues'],
        ['book', 'brush', 'tissues', 'shoe', 'hammer', 'duck'],
        ['tissues', 'book', 'brush', 'shoe', 'duck', 'hammer'],
        ['tissues', 'duck', 'brush', 'shoe', 'hammer', 'book'],
        ['duck', 'hammer', 'tissues', 'book', 'brush', 'shoe'],
        ['tissues', 'book', 'hammer', 'shoe', 'brush', 'duck'],
        ['duck', 'tissues', 'brush', 'hammer', 'shoe', 'book'],
        ['hammer', 'brush', 'book', 'duck', 'tissues', 'shoe'],
        ['tissues', 'shoe', 'hammer', 'duck', 'book', 'brush'],
        ['book', 'duck', 'hammer', 'brush', 'shoe', 'tissues'],
        ['brush', 'tissues', 'shoe', 'book', 'hammer', 'duck'],
        ['duck', 'hammer', 'tissues', 'brush', 'book', 'shoe'],
        ['brush', 'duck', 'shoe', 'book', 'hammer', 'tissues'],
        ['book', 'brush', 'shoe', 'hammer', 'duck', 'tissues'],
        ['tissues', 'duck', 'shoe', 'book', 'brush', 'hammer'],
        ['shoe', 'duck', 'brush', 'hammer', 'book', 'tissues'],
        ['duck', 'hammer', 'book', 'shoe', 'tissues', 'brush'],
        ['tissues', 'brush', 'book', 'hammer', 'shoe', 'duck'],
        ['brush', 'duck', 'tissues', 'hammer', 'shoe', 'book'],
        ['tissues', 'duck', 'brush', 'hammer', 'shoe', 'book'],
        ['duck', 'book', 'tissues', 'shoe', 'brush', 'hammer'],
        ['brush', 'hammer', 'tissues', 'shoe', 'book', 'duck'],
        ['book', 'brush', 'shoe', 'duck', 'hammer', 'tissues'],
        ['shoe', 'hammer', 'brush', 'book', 'tissues', 'duck'],
        ['tissues', 'shoe', 'brush', 'book', 'hammer', 'duck'],
        ['duck', 'hammer', 'book', 'brush', 'tissues', 'shoe'],
        ['tissues', 'shoe', 'brush', 'hammer', 'book', 'duck'],
        ['book', 'duck', 'shoe', 'hammer', 'tissues', 'brush'],
        ['shoe', 'duck', 'book', 'brush', 'tissues', 'hammer'],
        ['book', 'tissues', 'brush', 'hammer', 'duck', 'shoe'],
        ['tissues', 'duck', 'shoe', 'hammer', 'book', 'brush'],
        ['hammer', 'shoe', 'tissues', 'duck', 'brush', 'book'],
        ['book', 'brush', 'duck', 'shoe', 'tissues', 'hammer'],
        ['shoe', 'tissues', 'hammer', 'duck', 'brush', 'book'],
        ['book', 'hammer', 'brush', 'duck', 'shoe', 'tissues'],
        ['book', 'shoe', 'brush', 'duck', 'tissues', 'hammer'],
        ['tissues', 'duck', 'book', 'shoe', 'brush', 'hammer'],
        ['brush', 'tissues', 'hammer', 'shoe', 'book', 'duck'],
        ['book', 'brush', 'tissues', 'duck', 'hammer', 'shoe'],
        ['brush', 'hammer', 'tissues', 'duck', 'shoe', 'book'],
        ['brush', 'book', 'shoe', 'duck', 'hammer', 'tissues'],
        ['brush', 'duck', 'hammer', 'tissues', 'book', 'shoe'],
        ['book', 'duck', 'shoe', 'brush', 'hammer', 'tissues'],
        ['brush', 'shoe', 'duck', 'tissues', 'hammer', 'book'],
        ['hammer', 'duck', 'tissues', 'brush', 'book', 'shoe'],
        ['tissues', 'book', 'duck', 'shoe', 'hammer', 'brush'],
        ['book', 'duck', 'hammer', 'shoe', 'tissues', 'brush'],
        ['tissues', 'hammer', 'brush', 'duck', 'shoe', 'book'],
        ['book', 'tissues', 'duck', 'shoe', 'brush', 'hammer'],
        ['shoe', 'hammer', 'duck', 'tissues', 'book', 'brush'],
        ['hammer', 'shoe', 'duck', 'tissues', 'brush', 'book'],
        ['hammer', 'book', 'tissues', 'shoe', 'brush', 'duck'],
        ['shoe', 'hammer', 'duck', 'brush', 'tissues', 'book'],
        ['shoe', 'brush', 'tissues', 'duck', 'hammer', 'book'],
        ['shoe', 'duck', 'book', 'tissues', 'hammer', 'brush'],
        ['shoe', 'brush', 'tissues', 'hammer', 'book', 'duck'],
        ['book', 'shoe', 'duck', 'brush', 'tissues', 'hammer'],
        ['tissues', 'shoe', 'book', 'brush', 'hammer', 'duck'],
        ['brush', 'hammer', 'shoe', 'book', 'tissues', 'duck'],
        ['shoe', 'brush', 'hammer', 'book', 'duck', 'tissues'],
        ['brush', 'duck', 'book', 'hammer', 'shoe', 'tissues'],
        ['shoe', 'hammer', 'book', 'brush', 'duck', 'tissues'],
        ['hammer', 'duck', 'brush', 'book', 'shoe', 'tissues'],
        ['brush', 'duck', 'tissues', 'book', 'shoe', 'hammer'],
        ['duck', 'book', 'shoe', 'brush', 'tissues', 'hammer'],
        ['brush', 'tissues', 'shoe', 'hammer', 'book', 'duck'],
        ['book', 'tissues', 'hammer', 'duck', 'brush', 'shoe'],
        ['duck', 'book', 'hammer', 'tissues', 'brush', 'shoe'],
        ['shoe', 'book', 'duck', 'brush', 'tissues', 'hammer'],
        ['brush', 'duck', 'tissues', 'hammer', 'book', 'shoe'],
        ['duck', 'brush', 'tissues', 'hammer', 'book', 'shoe'],
        ['shoe', 'hammer', 'duck', 'book', 'brush', 'tissues'],
        ['shoe', 'tissues', 'duck', 'hammer', 'book', 'brush'],
        ['hammer', 'book', 'tissues', 'duck', 'shoe', 'brush'],
        ['duck', 'brush', 'shoe', 'hammer', 'tissues', 'book'],
        ['brush', 'shoe', 'duck', 'hammer', 'tissues', 'book'],
        ['hammer', 'shoe', 'brush', 'duck', 'tissues', 'book'],
        ['brush', 'hammer', 'book', 'tissues', 'shoe', 'duck'],
        ['duck', 'brush', 'shoe', 'book', 'tissues', 'hammer'],
        ['book', 'hammer', 'duck', 'shoe', 'brush', 'tissues'],
        ['shoe', 'tissues', 'book', 'hammer', 'brush', 'duck'],
        ['duck', 'book', 'tissues', 'hammer', 'shoe', 'brush'],
        ['brush', 'duck', 'shoe', 'book', 'tissues', 'hammer'],
        ['brush', 'tissues', 'hammer', 'book', 'shoe', 'duck'],
        ['tissues', 'shoe', 'brush', 'duck', 'hammer', 'book'],
        ['duck', 'tissues', 'brush', 'shoe', 'book', 'hammer'],
        ['shoe', 'duck', 'tissues', 'brush', 'hammer', 'book'],
        ['hammer', 'shoe', 'duck', 'brush', 'book', 'tissues'],
        ['book', 'tissues', 'shoe', 'hammer', 'duck', 'brush'],
        ['brush', 'hammer', 'book', 'tissues', 'duck', 'shoe'],
        ['duck', 'tissues', 'hammer', 'shoe', 'book', 'brush'],
        ['brush', 'duck', 'book', 'hammer', 'tissues', 'shoe'],
        ['book', 'duck', 'tissues', 'hammer', 'brush', 'shoe'],
        ['hammer', 'tissues', 'brush', 'duck', 'book', 'shoe'],
        ['book', 'hammer', 'tissues', 'shoe', 'brush', 'duck'],
        ['book', 'duck', 'brush', 'hammer', 'tissues', 'shoe'],
        ['shoe', 'tissues', 'hammer', 'brush', 'book', 'duck'],
        ['duck', 'shoe', 'hammer', 'tissues', 'book', 'brush'],
        ['duck', 'hammer', 'shoe', 'brush', 'book', 'tissues'],
        ['book', 'shoe', 'tissues', 'duck', 'hammer', 'brush'],
        ['book', 'duck', 'brush', 'shoe', 'tissues', 'hammer'],
        ['tissues', 'shoe', 'hammer', 'book', 'duck', 'brush'],
        ['hammer', 'duck', 'tissues', 'shoe', 'brush', 'book'],
        ['brush', 'shoe', 'hammer', 'tissues', 'book', 'duck'],
        ['duck', 'brush', 'hammer', 'shoe', 'tissues', 'book'],
        ['brush', 'book', 'hammer', 'tissues', 'duck', 'shoe'],
        ['brush', 'shoe', 'hammer', 'duck', 'tissues', 'book'],
        ['hammer', 'duck', 'shoe', 'book', 'tissues', 'brush'],
        ['shoe', 'tissues', 'brush', 'hammer', 'book', 'duck'],
        ['tissues', 'duck', 'brush', 'hammer', 'book', 'shoe'],
        ['shoe', 'tissues', 'hammer', 'duck', 'book', 'brush'],
        ['hammer', 'brush', 'shoe', 'book', 'tissues', 'duck'],
        ['tissues', 'book', 'hammer', 'duck', 'brush', 'shoe'],
        ['book', 'tissues', 'shoe', 'brush', 'hammer', 'duck'],
        ['brush', 'hammer', 'tissues', 'shoe', 'duck', 'book'],
        ['book', 'shoe', 'tissues', 'duck', 'brush', 'hammer'],
        ['hammer', 'brush', 'tissues', 'duck', 'book', 'shoe'],
        ['book', 'duck', 'shoe', 'tissues', 'hammer', 'brush'],
        ['hammer', 'brush', 'book', 'tissues', 'shoe', 'duck'],
        ['book', 'tissues', 'hammer', 'brush', 'duck', 'shoe'],
        ['hammer', 'brush', 'tissues', 'duck', 'shoe', 'book'],
        ['tissues', 'brush', 'duck', 'book', 'hammer', 'shoe'],
        ['book', 'hammer', 'brush', 'tissues', 'shoe', 'duck'],
        ['hammer', 'duck', 'shoe', 'book', 'brush', 'tissues'],
        ['hammer', 'shoe', 'duck', 'tissues', 'book', 'brush'],
        ['tissues', 'brush', 'shoe', 'duck', 'hammer', 'book'],
        ['book', 'shoe', 'hammer', 'brush', 'tissues', 'duck'],
        ['book', 'tissues', 'shoe', 'duck', 'hammer', 'brush'],
        ['brush', 'book', 'shoe', 'duck', 'tissues', 'hammer'],
        ['tissues', 'hammer', 'duck', 'shoe', 'book', 'brush'],
        ['duck', 'book', 'brush', 'hammer', 'shoe', 'tissues'],
        ['book', 'hammer', 'duck', 'brush', 'tissues', 'shoe'],
        ['hammer', 'book', 'brush', 'tissues', 'duck', 'shoe'],
        ['hammer', 'book', 'shoe', 'duck', 'brush', 'tissues'],
        ['brush', 'duck', 'hammer', 'book', 'tissues', 'shoe'],
        ['tissues', 'hammer', 'duck', 'book', 'brush', 'shoe'],
        ['shoe', 'duck', 'hammer', 'book', 'tissues', 'brush'],
        ['shoe', 'duck', 'brush', 'book', 'hammer', 'tissues'],
        ['tissues', 'book', 'duck', 'brush', 'hammer', 'shoe'],
        ['hammer', 'brush', 'tissues', 'shoe', 'duck', 'book'],
        ['duck', 'brush', 'shoe', 'book', 'hammer', 'tissues'],
        ['brush', 'book', 'shoe', 'hammer', 'tissues', 'duck'],
        ['duck', 'brush', 'tissues', 'shoe', 'book', 'hammer'],
        ['brush', 'book', 'duck', 'shoe', 'tissues', 'hammer'],
        ['hammer', 'book', 'duck', 'brush', 'shoe', 'tissues'],
        ['book', 'shoe', 'tissues', 'brush', 'hammer', 'duck'],
        ['hammer', 'duck', 'brush', 'tissues', 'shoe', 'book'],
        ['book', 'brush', 'hammer', 'tissues', 'duck', 'shoe'],
        ['shoe', 'hammer', 'brush', 'duck', 'tissues', 'book'],
        ['book', 'brush', 'shoe', 'duck', 'tissues', 'hammer'],
        ['book', 'hammer', 'tissues', 'shoe', 'duck', 'brush'],
        ['duck', 'book', 'hammer', 'brush', 'tissues', 'shoe'],
        ['tissues', 'brush', 'book', 'duck', 'hammer', 'shoe'],
        ['duck', 'book', 'shoe', 'tissues', 'hammer', 'brush'],
        ['brush', 'tissues', 'shoe', 'duck', 'hammer', 'book'],
        ['brush', 'tissues', 'duck', 'shoe', 'hammer', 'book'],
        ['hammer', 'shoe', 'brush', 'book', 'duck', 'tissues'],
        ['brush', 'hammer', 'book', 'duck', 'shoe', 'tissues'],
        ['hammer', 'duck', 'book', 'tissues', 'shoe', 'brush'],
        ['hammer', 'tissues', 'duck', 'brush', 'book', 'shoe'],
        ['shoe', 'book', 'brush', 'duck', 'tissues', 'hammer'],
        ['shoe', 'hammer', 'tissues', 'book', 'duck', 'brush'],
        ['hammer', 'duck', 'brush', 'book', 'tissues', 'shoe'],
        ['brush', 'book', 'hammer', 'duck', 'shoe', 'tissues'],
        ['brush', 'book', 'hammer', 'tissues', 'shoe', 'duck'],
        ['shoe', 'brush', 'book', 'tissues', 'hammer', 'duck'],
        ['book', 'brush', 'hammer', 'duck', 'shoe', 'tissues'],
        ['duck', 'shoe', 'hammer', 'book', 'brush', 'tissues'],
        ['brush', 'book', 'shoe', 'tissues', 'hammer', 'duck'],
        ['duck', 'tissues', 'shoe', 'book', 'brush', 'hammer'],
        ['tissues', 'duck', 'shoe', 'book', 'hammer', 'brush'],
        ['hammer', 'book', 'shoe', 'tissues', 'brush', 'duck'],
        ['book', 'shoe', 'duck', 'tissues', 'brush', 'hammer'],
        ['tissues', 'hammer', 'shoe', 'duck', 'book', 'brush'],
        ['shoe', 'brush', 'hammer', 'duck', 'book', 'tissues'],
        ['brush', 'hammer', 'book', 'shoe', 'tissues', 'duck'],
        ['hammer', 'brush', 'tissues', 'book', 'shoe', 'duck'],
        ['shoe', 'book', 'brush', 'duck', 'hammer', 'tissues'],
        ['duck', 'shoe', 'book', 'brush', 'tissues', 'hammer'],
        ['tissues', 'hammer', 'brush', 'shoe', 'book', 'duck'],
        ['book', 'brush', 'duck', 'tissues', 'shoe', 'hammer'],
        ['hammer', 'book', 'shoe', 'brush', 'duck', 'tissues'],
        ['hammer', 'duck', 'tissues', 'book', 'brush', 'shoe'],
        ['duck', 'book', 'brush', 'hammer', 'tissues', 'shoe'],
        ['brush', 'tissues', 'hammer', 'book', 'duck', 'shoe'],
        ['shoe', 'tissues', 'hammer', 'brush', 'duck', 'book'],
        ['shoe', 'brush', 'book', 'duck', 'hammer', 'tissues'],
        ['duck', 'tissues', 'book', 'shoe', 'brush', 'hammer'],
        ['hammer', 'shoe', 'brush', 'duck', 'book', 'tissues'],
        ['duck', 'tissues', 'book', 'hammer', 'shoe', 'brush'],
        ['brush', 'shoe', 'hammer', 'book', 'tissues', 'duck'],
        ['tissues', 'duck', 'brush', 'book', 'shoe', 'hammer'],
        ['book', 'duck', 'brush', 'shoe', 'hammer', 'tissues'],
        ['shoe', 'book', 'hammer', 'duck', 'tissues', 'brush'],
        ['shoe', 'brush', 'hammer', 'tissues', 'duck', 'book'],
        ['shoe', 'brush', 'tissues', 'book', 'duck', 'hammer'],
        ['shoe', 'tissues', 'duck', 'book', 'hammer', 'brush'],
        ['tissues', 'shoe', 'brush', 'book', 'duck', 'hammer'],
        ['brush', 'hammer', 'book', 'duck', 'tissues', 'shoe'],
        ['book', 'tissues', 'brush', 'hammer', 'shoe', 'duck'],
        ['brush', 'tissues', 'shoe', 'duck', 'book', 'hammer'],
        ['brush', 'tissues', 'book', 'hammer', 'shoe', 'duck'],
        ['shoe', 'book', 'duck', 'brush', 'hammer', 'tissues'],
        ['brush', 'shoe', 'hammer', 'tissues', 'duck', 'book'],
        ['tissues', 'shoe', 'duck', 'brush', 'book', 'hammer'],
        ['hammer', 'brush', 'shoe', 'duck', 'tissues', 'book'],
        ['hammer', 'duck', 'book', 'shoe', 'tissues', 'brush'],
        ['hammer', 'brush', 'duck', 'shoe', 'book', 'tissues'],
        ['tissues', 'hammer', 'brush', 'shoe', 'duck', 'book'],
        ['hammer', 'tissues', 'shoe', 'duck', 'book', 'brush'],
        ['hammer', 'book', 'shoe', 'duck', 'tissues', 'brush'],
        ['shoe', 'hammer', 'tissues', 'duck', 'brush', 'book'],
        ['tissues', 'hammer', 'duck', 'brush', 'shoe', 'book'],
        ['shoe', 'tissues', 'hammer', 'book', 'brush', 'duck'],
        ['brush', 'duck', 'hammer', 'tissues', 'shoe', 'book'],
        ['duck', 'book', 'hammer', 'shoe', 'brush', 'tissues'],
        ['hammer', 'tissues', 'brush', 'shoe', 'duck', 'book'],
        ['tissues', 'brush', 'shoe', 'hammer', 'book', 'duck'],
        ['duck', 'hammer', 'tissues', 'shoe', 'brush', 'book'],
        ['brush', 'duck', 'tissues', 'book', 'hammer', 'shoe'],
        ['hammer', 'tissues', 'book', 'duck', 'shoe', 'brush'],
        ['shoe', 'duck', 'brush', 'tissues', 'book', 'hammer'],
        ['book', 'duck', 'shoe', 'brush', 'tissues', 'hammer'],
        ['tissues', 'shoe', 'hammer', 'brush', 'duck', 'book'],
        ['hammer', 'tissues', 'book', 'shoe', 'duck', 'brush'],
        ['shoe', 'tissues', 'book', 'duck', 'brush', 'hammer'],
        ['tissues', 'book', 'brush', 'duck', 'shoe', 'hammer'],
        ['duck', 'shoe', 'tissues', 'brush', 'hammer', 'book'],
        ['hammer', 'shoe', 'brush', 'tissues', 'duck', 'book'],
        ['brush', 'shoe', 'book', 'hammer', 'tissues', 'duck'],
        ['hammer', 'tissues', 'duck', 'shoe', 'book', 'brush'],
        ['brush', 'hammer', 'shoe', 'duck', 'book', 'tissues'],
        ['tissues', 'hammer', 'duck', 'book', 'shoe', 'brush'],
        ['book', 'shoe', 'brush', 'tissues', 'duck', 'hammer'],
        ['book', 'duck', 'hammer', 'shoe', 'brush', 'tissues'],
        ['book', 'duck', 'hammer', 'brush', 'tissues', 'shoe'],
        ['brush', 'duck', 'shoe', 'hammer', 'book', 'tissues'],
        ['brush', 'hammer', 'tissues', 'duck', 'book', 'shoe'],
        ['duck', 'book', 'shoe', 'brush', 'hammer', 'tissues'],
        ['duck', 'book', 'brush', 'shoe', 'hammer', 'tissues'],
        ['shoe', 'hammer', 'duck', 'brush', 'book', 'tissues'],
        ['shoe', 'brush', 'book', 'duck', 'tissues', 'hammer'],
        ['shoe', 'brush', 'tissues', 'duck', 'book', 'hammer'],
        ['shoe', 'tissues', 'book', 'brush', 'duck', 'hammer'],
        ['tissues', 'duck', 'hammer', 'brush', 'shoe', 'book'],
        ['brush', 'shoe', 'book', 'tissues', 'duck', 'hammer'],
        ['tissues', 'hammer', 'shoe', 'brush', 'book', 'duck'],
        ['tissues', 'brush', 'duck', 'book', 'shoe', 'hammer'],
        ['duck', 'hammer', 'brush', 'book', 'tissues', 'shoe'],
        ['hammer', 'brush', 'book', 'tissues', 'duck', 'shoe'],
        ['shoe', 'hammer', 'duck', 'tissues', 'brush', 'book'],
        ['hammer', 'tissues', 'book', 'shoe', 'brush', 'duck'],
        ['brush', 'shoe', 'tissues', 'book', 'duck', 'hammer'],
        ['tissues', 'duck', 'book', 'shoe', 'hammer', 'brush'],
        ['brush', 'hammer', 'book', 'shoe', 'duck', 'tissues'],
        ['tissues', 'duck', 'book', 'hammer', 'shoe', 'brush'],
        ['tissues', 'book', 'shoe', 'hammer', 'brush', 'duck'],
        ['brush', 'tissues', 'book', 'duck', 'shoe', 'hammer'],
        ['tissues', 'duck', 'hammer', 'shoe', 'book', 'brush'],
        ['book', 'hammer', 'tissues', 'brush', 'duck', 'shoe'],
        ['hammer', 'book', 'shoe', 'tissues', 'duck', 'brush'],
        ['tissues', 'book', 'brush', 'hammer', 'duck', 'shoe'],
        ['book', 'tissues', 'brush', 'shoe', 'duck', 'hammer'],
        ['shoe', 'tissues', 'hammer', 'book', 'duck', 'brush'],
        ['book', 'duck', 'brush', 'tissues', 'shoe', 'hammer'],
        ['duck', 'book', 'tissues', 'brush', 'shoe', 'hammer'],
        ['hammer', 'book', 'duck', 'tissues', 'brush', 'shoe'],
        ['shoe', 'duck', 'hammer', 'tissues', 'brush', 'book'],
        ['hammer', 'shoe', 'book', 'brush', 'tissues', 'duck'],
        ['hammer', 'book', 'brush', 'shoe', 'duck', 'tissues'],
        ['duck', 'brush', 'tissues', 'hammer', 'shoe', 'book'],
        ['duck', 'book', 'brush', 'tissues', 'shoe', 'hammer'],
        ['tissues', 'brush', 'hammer', 'shoe', 'duck', 'book'],
        ['duck', 'brush', 'book', 'shoe', 'hammer', 'tissues'],
        ['tissues', 'hammer', 'book', 'duck', 'brush', 'shoe'],
        ['tissues', 'brush', 'shoe', 'duck', 'book', 'hammer'],
        ['tissues', 'duck', 'book', 'brush', 'hammer', 'shoe'],
        ['book', 'tissues', 'duck', 'hammer', 'shoe', 'brush'],
        ['book', 'hammer', 'tissues', 'brush', 'shoe', 'duck'],
        ['shoe', 'book', 'duck', 'hammer', 'tissues', 'brush'],
        ['hammer', 'duck', 'tissues', 'shoe', 'book', 'brush'],
        ['tissues', 'book', 'brush', 'hammer', 'shoe', 'duck'],
        ['duck', 'tissues', 'shoe', 'brush', 'book', 'hammer'],
        ['hammer', 'duck', 'brush', 'shoe', 'tissues', 'book'],
        ['hammer', 'shoe', 'book', 'duck', 'brush', 'tissues'],
        ['duck', 'brush', 'book', 'hammer', 'shoe', 'tissues'],
        ['book', 'tissues', 'shoe', 'hammer', 'brush', 'duck'],
        ['brush', 'duck', 'book', 'tissues', 'hammer', 'shoe'],
        ['shoe', 'brush', 'duck', 'book', 'hammer', 'tissues'],
        ['brush', 'shoe', 'book', 'duck', 'hammer', 'tissues'],
        ['duck', 'tissues', 'brush', 'book', 'shoe', 'hammer'],
        ['tissues', 'hammer', 'shoe', 'brush', 'duck', 'book'],
        ['duck', 'tissues', 'book', 'hammer', 'brush', 'shoe'],
        ['shoe', 'book', 'hammer', 'brush', 'tissues', 'duck'],
        ['tissues', 'hammer', 'book', 'brush', 'duck', 'shoe'],
        ['brush', 'duck', 'hammer', 'book', 'shoe', 'tissues'],
        ['brush', 'shoe', 'duck', 'hammer', 'book', 'tissues'],
        ['shoe', 'book', 'hammer', 'brush', 'duck', 'tissues'],
        ['brush', 'tissues', 'book', 'shoe', 'hammer', 'duck'],
        ['book', 'shoe', 'hammer', 'tissues', 'brush', 'duck'],
        ['duck', 'brush', 'shoe', 'tissues', 'hammer', 'book'],
        ['hammer', 'duck', 'shoe', 'brush', 'book', 'tissues'],
        ['tissues', 'brush', 'shoe', 'book', 'hammer', 'duck'],
        ['book', 'hammer', 'shoe', 'duck', 'brush', 'tissues'],
        ['duck', 'hammer', 'book', 'tissues', 'brush', 'shoe'],
        ['book', 'duck', 'shoe', 'tissues', 'brush', 'hammer'],
        ['duck', 'shoe', 'brush', 'hammer', 'tissues', 'book'],
        ['book', 'shoe', 'tissues', 'hammer', 'duck', 'brush'],
        ['duck', 'hammer', 'brush', 'tissues', 'shoe', 'book'],
        ['brush', 'hammer', 'duck', 'tissues', 'shoe', 'book'],
        ['duck', 'brush', 'tissues', 'shoe', 'hammer', 'book'],
        ['shoe', 'tissues', 'duck', 'brush', 'book', 'hammer'],
        ['duck', 'book', 'shoe', 'hammer', 'brush', 'tissues'],
        ['brush', 'duck', 'tissues', 'shoe', 'hammer', 'book'],
        ['tissues', 'book', 'shoe', 'hammer', 'duck', 'brush'],
        ['shoe', 'hammer', 'book', 'brush', 'tissues', 'duck'],
        ['brush', 'book', 'shoe', 'hammer', 'duck', 'tissues'],
        ['book', 'hammer', 'duck', 'tissues', 'shoe', 'brush'],
        ['book', 'duck', 'tissues', 'brush', 'shoe', 'hammer'],
        ['duck', 'hammer', 'tissues', 'shoe', 'book', 'brush'],
        ['hammer', 'tissues', 'brush', 'book', 'duck', 'shoe'],
        ['tissues', 'hammer', 'duck', 'brush', 'book', 'shoe'],
        ['shoe', 'hammer', 'tissues', 'duck', 'book', 'brush'],
        ['tissues', 'brush', 'hammer', 'duck', 'book', 'shoe'],
        ['tissues', 'shoe', 'duck', 'hammer', 'brush', 'book'],
        ['hammer', 'brush', 'tissues', 'shoe', 'book', 'duck'],
        ['duck', 'shoe', 'brush', 'book', 'tissues', 'hammer'],
        ['duck', 'brush', 'hammer', 'book', 'tissues', 'shoe'],
        ['tissues', 'book', 'duck', 'hammer', 'shoe', 'brush'],
        ['shoe', 'hammer', 'brush', 'tissues', 'duck', 'book'],
        ['duck', 'brush', 'hammer', 'tissues', 'shoe', 'book'],
        ['tissues', 'duck', 'hammer', 'brush', 'book', 'shoe'],
        ['book', 'brush', 'hammer', 'shoe', 'duck', 'tissues'],
        ['shoe', 'duck', 'tissues', 'hammer', 'book', 'brush'],
        ['book', 'duck', 'hammer', 'tissues', 'brush', 'shoe'],
        ['book', 'hammer', 'duck', 'tissues', 'brush', 'shoe'],
        ['hammer', 'brush', 'tissues', 'book', 'duck', 'shoe'],
        ['duck', 'brush', 'shoe', 'hammer', 'book', 'tissues'],
        ['brush', 'duck', 'hammer', 'shoe', 'tissues', 'book'],
        ['brush', 'book', 'tissues', 'shoe', 'hammer', 'duck'],
        ['shoe', 'duck', 'tissues', 'book', 'brush', 'hammer'],
        ['duck', 'book', 'brush', 'shoe', 'tissues', 'hammer'],
        ['hammer', 'tissues', 'book', 'brush', 'shoe', 'duck'],
        ['shoe', 'duck', 'hammer', 'book', 'brush', 'tissues'],
        ['hammer', 'shoe', 'tissues', 'book', 'brush', 'duck'],
        ['shoe', 'book', 'hammer', 'tissues', 'duck', 'brush'],
        ['book', 'brush', 'duck', 'hammer', 'tissues', 'shoe'],
        ['brush', 'hammer', 'duck', 'shoe', 'tissues', 'book'],
        ['duck', 'shoe', 'book', 'brush', 'hammer', 'tissues'],
        ['tissues', 'book', 'duck', 'shoe', 'brush', 'hammer'],
        ['brush', 'shoe', 'duck', 'tissues', 'book', 'hammer'],
        ['tissues', 'shoe', 'book', 'brush', 'duck', 'hammer'],
        ['shoe', 'book', 'tissues', 'hammer', 'duck', 'brush'],
        ['book', 'shoe', 'tissues', 'brush', 'duck', 'hammer'],
        ['shoe', 'book', 'duck', 'hammer', 'brush', 'tissues'],
        ['duck', 'shoe', 'tissues', 'book', 'brush', 'hammer'],
        ['duck', 'hammer', 'book', 'shoe', 'brush', 'tissues'],
        ['shoe', 'duck', 'hammer', 'tissues', 'book', 'brush'],
        ['duck', 'hammer', 'shoe', 'tissues', 'book', 'brush'],
        ['hammer', 'book', 'brush', 'duck', 'tissues', 'shoe'],
        ['duck', 'tissues', 'hammer', 'brush', 'shoe', 'book'],
        ['shoe', 'hammer', 'tissues', 'brush', 'duck', 'book'],
        ['book', 'brush', 'shoe', 'hammer', 'tissues', 'duck'],
        ['duck', 'hammer', 'book', 'tissues', 'shoe', 'brush'],
        ['duck', 'hammer', 'tissues', 'book', 'shoe', 'brush'],
        ['duck', 'shoe', 'brush', 'tissues', 'book', 'hammer'],
        ['hammer', 'tissues', 'brush', 'shoe', 'book', 'duck'],
        ['tissues', 'duck', 'shoe', 'brush', 'hammer', 'book'],
        ['book', 'brush', 'tissues', 'duck', 'shoe', 'hammer'],
        ['tissues', 'duck', 'hammer', 'book', 'brush', 'shoe'],
        ['tissues', 'hammer', 'duck', 'shoe', 'brush', 'book'],
        ['tissues', 'shoe', 'book', 'hammer', 'brush', 'duck'],
        ['shoe', 'book', 'tissues', 'duck', 'brush', 'hammer'],
        ['shoe', 'duck', 'brush', 'hammer', 'tissues', 'book'],
        ['hammer', 'book', 'brush', 'shoe', 'tissues', 'duck'],
        ['shoe', 'book', 'duck', 'tissues', 'brush', 'hammer'],
        ['tissues', 'duck', 'shoe', 'hammer', 'brush', 'book'],
        ['shoe', 'brush', 'hammer', 'book', 'tissues', 'duck'],
        ['duck', 'book', 'brush', 'tissues', 'hammer', 'shoe'],
        ['shoe', 'brush', 'duck', 'hammer', 'book', 'tissues'],
        ['hammer', 'tissues', 'duck', 'shoe', 'brush', 'book'],
        ['book', 'brush', 'hammer', 'tissues', 'shoe', 'duck'],
        ['tissues', 'book', 'duck', 'hammer', 'brush', 'shoe'],
        ['book', 'brush', 'tissues', 'hammer', 'duck', 'shoe'],
        ['hammer', 'book', 'duck', 'shoe', 'brush', 'tissues'],
        ['brush', 'book', 'hammer', 'shoe', 'tissues', 'duck'],
        ['book', 'brush', 'tissues', 'hammer', 'shoe', 'duck'],
        ['book', 'hammer', 'tissues', 'duck', 'shoe', 'brush'],
        ['shoe', 'book', 'tissues', 'duck', 'hammer', 'brush'],
        ['hammer', 'shoe', 'tissues', 'brush', 'book', 'duck'],
        ['book', 'shoe', 'brush', 'hammer', 'tissues', 'duck'],
        ['book', 'tissues', 'shoe', 'duck', 'brush', 'hammer'],
        ['hammer', 'duck', 'shoe', 'tissues', 'brush', 'book'],
        ['book', 'tissues', 'brush', 'duck', 'hammer', 'shoe'],
        ['shoe', 'book', 'tissues', 'brush', 'hammer', 'duck'],
        ['tissues', 'shoe', 'brush', 'hammer', 'duck', 'book'],
        ['duck', 'tissues', 'shoe', 'brush', 'hammer', 'book'],
        ['brush', 'shoe', 'book', 'hammer', 'duck', 'tissues'],
        ['book', 'shoe', 'duck', 'tissues', 'hammer', 'brush'],
        ['shoe', 'hammer', 'book', 'tissues', 'brush', 'duck'],
        ['book', 'duck', 'tissues', 'shoe', 'brush', 'hammer'],
        ['duck', 'tissues', 'hammer', 'book', 'brush', 'shoe'],
        ['hammer', 'tissues', 'duck', 'book', 'shoe', 'brush'],
        ['tissues', 'duck', 'hammer', 'book', 'shoe', 'brush'],
        ['brush', 'duck', 'shoe', 'hammer', 'tissues', 'book'],
        ['hammer', 'shoe', 'book', 'tissues', 'duck', 'brush'],
        ['brush', 'tissues', 'duck', 'hammer', 'book', 'shoe'],
        ['brush', 'hammer', 'duck', 'book', 'shoe', 'tissues'],
        ['brush', 'shoe', 'tissues', 'duck', 'hammer', 'book'],
        ['tissues', 'duck', 'book', 'brush', 'shoe', 'hammer'],
        ['duck', 'shoe', 'book', 'tissues', 'hammer', 'brush'],
        ['tissues', 'hammer', 'brush', 'duck', 'book', 'shoe'],
        ['book', 'tissues', 'duck', 'shoe', 'hammer', 'brush'],
        ['hammer', 'brush', 'shoe', 'tissues', 'duck', 'book'],
        ['tissues', 'shoe', 'duck', 'hammer', 'book', 'brush'],
        ['duck', 'brush', 'book', 'hammer', 'tissues', 'shoe'],
        ['book', 'brush', 'duck', 'shoe', 'hammer', 'tissues'],
        ['book', 'shoe', 'brush', 'tissues', 'hammer', 'duck'],
        ['shoe', 'book', 'brush', 'tissues', 'duck', 'hammer'],
        ['hammer', 'duck', 'brush', 'tissues', 'book', 'shoe'],
        ['brush', 'shoe', 'book', 'duck', 'tissues', 'hammer'],
        ['brush', 'tissues', 'shoe', 'hammer', 'duck', 'book'],
        ['duck', 'brush', 'book', 'tissues', 'hammer', 'shoe'],
        ['duck', 'tissues', 'book', 'brush', 'shoe', 'hammer'],
        ['tissues', 'brush', 'duck', 'hammer', 'shoe', 'book'],
        ['duck', 'hammer', 'shoe', 'book', 'tissues', 'brush'],
        ['brush', 'hammer', 'shoe', 'book', 'duck', 'tissues'],
        ['hammer', 'shoe', 'brush', 'book', 'tissues', 'duck'],
        ['book', 'duck', 'tissues', 'brush', 'hammer', 'shoe'],
        ['duck', 'shoe', 'book', 'hammer', 'brush', 'tissues'],
        ['duck', 'shoe', 'hammer', 'brush', 'tissues', 'book'],
        ['hammer', 'duck', 'tissues', 'brush', 'shoe', 'book'],
        ['shoe', 'duck', 'hammer', 'brush', 'book', 'tissues'],
        ['tissues', 'hammer', 'shoe', 'book', 'duck', 'brush'],
        ['brush', 'book', 'duck', 'shoe', 'hammer', 'tissues'],
        ['tissues', 'brush', 'hammer', 'duck', 'shoe', 'book'],
        ['duck', 'book', 'tissues', 'hammer', 'brush', 'shoe'],
        ['book', 'tissues', 'brush', 'shoe', 'hammer', 'duck'],
        ['shoe', 'hammer', 'tissues', 'book', 'brush', 'duck'],
        ['hammer', 'book', 'tissues', 'duck', 'brush', 'shoe'],
        ['duck', 'brush', 'book', 'tissues', 'shoe', 'hammer'],
        ['duck', 'brush', 'hammer', 'book', 'shoe', 'tissues'],
        ['book', 'tissues', 'shoe', 'brush', 'duck', 'hammer'],
        ['shoe', 'book', 'hammer', 'duck', 'brush', 'tissues'],
        ['hammer', 'tissues', 'shoe', 'duck', 'brush', 'book'],
        ['brush', 'tissues', 'book', 'hammer', 'duck', 'shoe'],
        ['book', 'tissues', 'duck', 'brush', 'shoe', 'hammer'],
        ['shoe', 'duck', 'brush', 'tissues', 'hammer', 'book'],
        ['shoe', 'brush', 'tissues', 'hammer', 'duck', 'book'],
        ['book', 'hammer', 'brush', 'tissues', 'duck', 'shoe'],
        ['duck', 'hammer', 'brush', 'tissues', 'book', 'shoe'],
        ['hammer', 'tissues', 'book', 'brush', 'duck', 'shoe'],
        ['hammer', 'book', 'tissues', 'brush', 'shoe', 'duck'],
        ['shoe', 'tissues', 'book', 'brush', 'hammer', 'duck'],
        ['hammer', 'shoe', 'brush', 'tissues', 'book', 'duck'],
        ['book', 'tissues', 'hammer', 'duck', 'shoe', 'brush'],
        ['brush', 'duck', 'hammer', 'shoe', 'book', 'tissues'],
        ['book', 'brush', 'shoe', 'tissues', 'hammer', 'duck'],
        ['book', 'hammer', 'shoe', 'brush', 'tissues', 'duck'],
        ['brush', 'book', 'shoe', 'tissues', 'duck', 'hammer'],
        ['hammer', 'brush', 'book', 'shoe', 'tissues', 'duck'],
        ['hammer', 'book', 'duck', 'shoe', 'tissues', 'brush'],
        ['brush', 'duck', 'tissues', 'shoe', 'book', 'hammer']
    ];

    var controlObjectRotation = [
        ['box', 'scissors', 'spoon', 'eraser', 'funnel', 'wrench'],
        ['eraser', 'spoon', 'wrench', 'box', 'funnel', 'scissors'],
        ['eraser', 'scissors', 'spoon', 'box', 'funnel', 'wrench'],
        ['box', 'eraser', 'scissors', 'funnel', 'spoon', 'wrench'],
        ['scissors', 'spoon', 'wrench', 'box', 'eraser', 'funnel'],
        ['eraser', 'funnel', 'scissors', 'box', 'spoon', 'wrench'],
        ['funnel', 'scissors', 'spoon', 'box', 'eraser', 'wrench'],
        ['box', 'scissors', 'wrench', 'eraser', 'funnel', 'spoon'],
        ['funnel', 'spoon', 'wrench', 'box', 'eraser', 'scissors'],
        ['eraser', 'funnel', 'wrench', 'box', 'scissors', 'spoon'],
        ['eraser', 'funnel', 'spoon', 'box', 'scissors', 'wrench'],
        ['eraser', 'scissors', 'wrench', 'box', 'funnel', 'spoon'],
        ['box', 'eraser', 'wrench', 'funnel', 'scissors', 'spoon'],
        ['box', 'eraser', 'funnel', 'scissors', 'spoon', 'wrench'],
        ['box', 'spoon', 'wrench', 'eraser', 'funnel', 'scissors'],
        ['funnel', 'scissors', 'wrench', 'box', 'eraser', 'spoon'],
        ['box', 'funnel', 'scissors', 'eraser', 'spoon', 'wrench'],
        ['box', 'eraser', 'spoon', 'funnel', 'scissors', 'wrench'],
        ['box', 'funnel', 'wrench', 'eraser', 'scissors', 'spoon'],
        ['box', 'funnel', 'spoon', 'eraser', 'scissors', 'wrench']
    ];

    var inertiaObjectRotation = [
        ['flashlight', 'sunglasses', 'block', 'marker', 'toycar', 'train'],
        ['block', 'train', 'marker', 'flashlight', 'toycar', 'sunglasses'],
        ['train', 'block', 'sunglasses', 'toycar', 'marker', 'flashlight'],
        ['toycar', 'marker', 'block', 'sunglasses', 'flashlight', 'train'],
        ['sunglasses', 'train', 'block', 'flashlight', 'marker', 'toycar'],
        ['marker', 'sunglasses', 'toycar', 'flashlight', 'train', 'block'],
        ['toycar', 'flashlight', 'sunglasses', 'marker', 'train', 'block'],
        ['flashlight', 'block', 'toycar', 'sunglasses', 'train', 'marker'],
        ['marker', 'block', 'sunglasses', 'flashlight', 'train', 'toycar'],
        ['toycar', 'block', 'train', 'flashlight', 'marker', 'sunglasses'],
        ['toycar', 'train', 'flashlight', 'sunglasses', 'marker', 'block'],
        ['flashlight', 'block', 'train', 'toycar', 'sunglasses', 'marker'],
        ['flashlight', 'marker', 'train', 'toycar', 'block', 'sunglasses'],
        ['toycar', 'sunglasses', 'flashlight', 'block', 'train', 'marker'],
        ['block', 'toycar', 'flashlight', 'marker', 'sunglasses', 'train'],
        ['toycar', 'flashlight', 'block', 'marker', 'train', 'sunglasses'],
        ['block', 'flashlight', 'train', 'sunglasses', 'toycar', 'marker'],
        ['sunglasses', 'train', 'marker', 'block', 'flashlight', 'toycar'],
        ['toycar', 'marker', 'sunglasses', 'flashlight', 'train', 'block'],
        ['sunglasses', 'marker', 'block', 'train', 'flashlight', 'toycar'],
        ['sunglasses', 'marker', 'train', 'toycar', 'block', 'flashlight'],
        ['marker', 'flashlight', 'block', 'sunglasses', 'toycar', 'train'],
        ['train', 'flashlight', 'toycar', 'block', 'sunglasses', 'marker'],
        ['train', 'flashlight', 'sunglasses', 'block', 'marker', 'toycar'],
        ['train', 'marker', 'block', 'sunglasses', 'toycar', 'flashlight'],
        ['train', 'marker', 'toycar', 'sunglasses', 'block', 'flashlight'],
        ['marker', 'flashlight', 'train', 'block', 'toycar', 'sunglasses'],
        ['toycar', 'train', 'block', 'marker', 'flashlight', 'sunglasses'],
        ['toycar', 'flashlight', 'train', 'marker', 'sunglasses', 'block'],
        ['block', 'sunglasses', 'flashlight', 'toycar', 'train', 'marker'],
        ['marker', 'toycar', 'block', 'train', 'flashlight', 'sunglasses'],
        ['flashlight', 'train', 'marker', 'sunglasses', 'toycar', 'block'],
        ['train', 'flashlight', 'marker', 'toycar', 'sunglasses', 'block'],
        ['marker', 'block', 'train', 'toycar', 'sunglasses', 'flashlight'],
        ['marker', 'block', 'train', 'flashlight', 'sunglasses', 'toycar'],
        ['block', 'train', 'toycar', 'flashlight', 'marker', 'sunglasses'],
        ['block', 'toycar', 'flashlight', 'sunglasses', 'train', 'marker'],
        ['toycar', 'train', 'sunglasses', 'marker', 'flashlight', 'block'],
        ['toycar', 'block', 'sunglasses', 'train', 'marker', 'flashlight'],
        ['block', 'marker', 'train', 'sunglasses', 'flashlight', 'toycar'],
        ['marker', 'sunglasses', 'train', 'flashlight', 'toycar', 'block'],
        ['flashlight', 'train', 'toycar', 'sunglasses', 'marker', 'block'],
        ['flashlight', 'toycar', 'block', 'train', 'sunglasses', 'marker'],
        ['marker', 'toycar', 'train', 'flashlight', 'block', 'sunglasses'],
        ['flashlight', 'sunglasses', 'toycar', 'train', 'marker', 'block'],
        ['block', 'train', 'sunglasses', 'flashlight', 'marker', 'toycar'],
        ['toycar', 'flashlight', 'train', 'sunglasses', 'marker', 'block'],
        ['flashlight', 'marker', 'block', 'toycar', 'train', 'sunglasses'],
        ['toycar', 'sunglasses', 'flashlight', 'marker', 'block', 'train'],
        ['sunglasses', 'marker', 'flashlight', 'block', 'toycar', 'train'],
        ['sunglasses', 'toycar', 'train', 'marker', 'block', 'flashlight'],
        ['marker', 'flashlight', 'sunglasses', 'toycar', 'train', 'block'],
        ['marker', 'train', 'sunglasses', 'flashlight', 'toycar', 'block'],
        ['sunglasses', 'train', 'toycar', 'flashlight', 'marker', 'block'],
        ['block', 'toycar', 'train', 'marker', 'sunglasses', 'flashlight'],
        ['flashlight', 'train', 'block', 'marker', 'toycar', 'sunglasses'],
        ['train', 'marker', 'block', 'flashlight', 'toycar', 'sunglasses'],
        ['sunglasses', 'toycar', 'block', 'marker', 'flashlight', 'train'],
        ['flashlight', 'sunglasses', 'train', 'marker', 'toycar', 'block'],
        ['train', 'toycar', 'sunglasses', 'block', 'flashlight', 'marker'],
        ['sunglasses', 'block', 'train', 'marker', 'toycar', 'flashlight'],
        ['flashlight', 'block', 'train', 'marker', 'toycar', 'sunglasses'],
        ['sunglasses', 'block', 'train', 'toycar', 'flashlight', 'marker'],
        ['sunglasses', 'train', 'marker', 'toycar', 'flashlight', 'block'],
        ['block', 'marker', 'sunglasses', 'toycar', 'flashlight', 'train'],
        ['marker', 'train', 'toycar', 'flashlight', 'sunglasses', 'block'],
        ['flashlight', 'toycar', 'sunglasses', 'block', 'train', 'marker'],
        ['sunglasses', 'flashlight', 'marker', 'toycar', 'train', 'block'],
        ['sunglasses', 'train', 'flashlight', 'marker', 'block', 'toycar'],
        ['toycar', 'sunglasses', 'block', 'train', 'marker', 'flashlight'],
        ['block', 'flashlight', 'sunglasses', 'marker', 'train', 'toycar'],
        ['toycar', 'marker', 'train', 'sunglasses', 'flashlight', 'block'],
        ['marker', 'block', 'flashlight', 'toycar', 'train', 'sunglasses'],
        ['sunglasses', 'toycar', 'train', 'flashlight', 'block', 'marker'],
        ['flashlight', 'block', 'marker', 'toycar', 'train', 'sunglasses'],
        ['train', 'sunglasses', 'toycar', 'block', 'flashlight', 'marker'],
        ['flashlight', 'marker', 'sunglasses', 'train', 'block', 'toycar'],
        ['sunglasses', 'block', 'marker', 'toycar', 'train', 'flashlight'],
        ['block', 'train', 'sunglasses', 'marker', 'toycar', 'flashlight'],
        ['block', 'sunglasses', 'flashlight', 'marker', 'toycar', 'train'],
        ['marker', 'toycar', 'block', 'flashlight', 'train', 'sunglasses'],
        ['block', 'train', 'marker', 'toycar', 'sunglasses', 'flashlight'],
        ['flashlight', 'sunglasses', 'toycar', 'block', 'marker', 'train'],
        ['marker', 'train', 'block', 'toycar', 'flashlight', 'sunglasses'],
        ['toycar', 'train', 'marker', 'flashlight', 'block', 'sunglasses'],
        ['sunglasses', 'block', 'flashlight', 'train', 'toycar', 'marker'],
        ['flashlight', 'sunglasses', 'train', 'block', 'toycar', 'marker'],
        ['toycar', 'block', 'marker', 'sunglasses', 'flashlight', 'train'],
        ['toycar', 'train', 'flashlight', 'block', 'marker', 'sunglasses'],
        ['sunglasses', 'marker', 'block', 'toycar', 'train', 'flashlight']
    ];

    return {
        useFallRotation: useFallRotation,
        conceptOrderRotation: conceptOrderRotation,
        objectRotations: [  gravityObjectRotation,
            inertiaObjectRotation,
            supportObjectRotation,
            controlObjectRotation]
    };
}


function assignVideos(startType, showStay, whichObjects) {

    var cb = counterbalancingLists();

    // Types of comparisons for each event type.
    // Format [event, outcome1, outcome2].
    var comparisonsGravity = [
        ['table', 'down', 'continue'],
        ['table', 'down', 'up'],
        ['table', 'continue', 'up'],
        ['ramp', 'down', 'up'],
        ['ramp', 'down', 'up'],
        ['toss', 'down', 'up']
    ];
    var comparisonsInertia = [
        ['stop', 'hand', 'nohand'],
        ['reverse', 'barrier', 'nobarrier']
    ];

    var comparisonsControl = [
        ['same', 'A', 'B'],
        ['salience', 'interesting', 'boring']
    ];

    // Start off with support comparisons all 'stay'; change appropriate ones
    // to 'fall' based on counterbalancing.
    var comparisonsSupport = [
        ['stay', 'slightly-on', 'mostly-on'],
        ['stay', 'next-to', 'mostly-on'],
        ['stay', 'near', 'mostly-on'],
        ['stay', 'next-to', 'slightly-on'],
        ['stay', 'near', 'slightly-on'],
        ['stay', 'near', 'next-to']
    ];

    // Choose which videos to show for support
    if (showStay < 0 || showStay >= cb.useFallRotation.length) {
        console.log('invalid value for showStay, using only stay videos');
    } else {
        var useFall = cb.useFallRotation[showStay];
        for (var iFall = 0; iFall < useFall.length; iFall++) {
            comparisonsSupport[useFall[iFall]][0] = 'fall';
        }
    }

    var videotypes = ['gravity', 'inertia', 'support', 'control'];
    var compTypes = [   comparisonsGravity,
        comparisonsInertia,
        comparisonsSupport,
        comparisonsControl ];
    // how many times does each comparison type listed need to be shown?
    var nReps = [1, 2, 1, 3];

    // Create ordered list of TYPES to show (e.g. gravity, inertia, ...)
    var typeOrder;
    if (startType < 0 || startType >= cb.conceptOrderRotation.length) {
        console.log('invalid value for startType, using order 0');
        typeOrder = cb.conceptOrderRotation[startType];
    } else {
        typeOrder = cb.conceptOrderRotation[startType];
    }

    // Create lists of objects-per-comparison for each type
    var objectPairingsByType = [[], [], [], []];
    if (whichObjects.length !== 4) {
        console.log('Unexpected whichObjects parameter length; using default object pairings');
        whichObjects = [0, 0, 0, 0];
    }
    for (iType=0; iType<4; iType++) {
        if (whichObjects[iType] < 0 || whichObjects[iType] >= cb.objectRotations[iType].length) {
            console.log('Invalid value for whichObjects type ' + iType + ', using default object pairings');
            objectPairingsByType[iType] = cb.objectRotations[iType][0];
        } else {
            objectPairingsByType[iType] = cb.objectRotations[iType][whichObjects[iType]];
        }
    }

    // Options for videos, organized by event
    var cameraAngles = {};
    cameraAngles['table'] = ['c1', 'c2'];
    cameraAngles['ramp'] = ['c1', 'c2'];
    cameraAngles['toss'] = ['c1', 'c2'];
    cameraAngles['stop'] = ['c1', 'c2'];
    cameraAngles['reverse'] = ['c1', 'c2'];
    cameraAngles['fall'] = ['c2'];
    cameraAngles['stay'] = ['c2'];
    cameraAngles['same'] = ['c1'];
    cameraAngles['salience'] = ['c1'];

    var backgrounds = {};
    backgrounds['table'] = ['1'];
    backgrounds['ramp'] = ['b1', 'b2'];
    backgrounds['toss'] = ['b1'];
    backgrounds['stop'] = ['b1'];
    backgrounds['reverse'] = ['b1'];
    backgrounds['fall'] = ['green'];
    backgrounds['stay'] = ['green'];
    backgrounds['same'] = ['b1'];
    backgrounds['salience'] = ['b1'];

    var flips = {};
    flips['table'] = ['NR'];
    flips['ramp'] = ['NN', 'RR', 'NR', 'RN'];
    flips['toss'] = ['NN', 'RR'];
    flips['stop'] = ['NR'];
    flips['reverse'] = ['NN', 'RR', 'NR', 'RN'];
    flips['fall'] = ['NN', 'RR'];
    flips['stay'] = ['NN', 'RR'];
    flips['same'] = ['NN', 'RN', 'RR'];
    flips['salience'] = ['NN', 'RN', 'RR'];

    var playlistsByType = {};
    for (var iType = 0; iType < videotypes.length; iType++) { // for each video type

        // get list of objects to use with canonically-ordered comparison types
        var objList = objectPairingsByType[iType];

        // make canonical comparison type list
        var eventTypeList = compTypes[iType];
        for (var iRep = 1; iRep < nReps[iType]; iRep++) {
            eventTypeList = eventTypeList.concat(compTypes[iType]);
        }

        // choose placement of more/less surprising outcomes (balanced)
        var onLeft = [  'moreProb', 'lessProb',
            'moreProb', 'lessProb',
            'moreProb', 'lessProb'];
        onLeft = onLeft.slice(0, eventTypeList.length);
        onLeft = shuffleArray(onLeft);

        // pair objects and comparison types
        var events = [];
        for (var iEvent = 0; iEvent < eventTypeList.length; iEvent++) {
            var outcomeL, outcomeR;
            if (onLeft[iEvent] === 'moreProb') {
                outcomeL = eventTypeList[iEvent][1];
                outcomeR = eventTypeList[iEvent][2];
            } else {
                outcomeL = eventTypeList[iEvent][2];
                outcomeR = eventTypeList[iEvent][1];
            }

            // choose camera angle, background, and flip randomly
            var iCamera = Math.floor(Math.random() *
                cameraAngles[eventTypeList[iEvent][0]].length);
            var iBackground = Math.floor(Math.random() *
                backgrounds[eventTypeList[iEvent][0]].length);
            var iFlip = Math.floor(Math.random() *
                flips[eventTypeList[iEvent][0]].length);

            events.push({
                compType: eventTypeList[iEvent][0],
                outcomeL: outcomeL,
                outcomeR: outcomeR,
                object: objList[iEvent],
                camera: cameraAngles[eventTypeList[iEvent][0]][iCamera],
                background: backgrounds[eventTypeList[iEvent][0]][iBackground],
                flip: flips[eventTypeList[iEvent][0]][iFlip]
            });
        }

        // for inertia, also add calibration events before shuffling
        if (videotypes[iType] === 'inertia') {
            events.push({
                compType: 'calibration',
                object: objList[4],
                flip: 'LR'
            });
            events.push({
                compType: 'calibration',
                object: objList[5],
                flip: 'RL'
            });
        }

        // choose order of events randomly w/i type
        events = shuffleArray(events);
        playlistsByType[videotypes[iType]] = events;
    }



    // Put list together
    var allEvents = [];
    var calEvents = [];
    var filenames = [];
    for (var nEvents = 0; nEvents < 6; nEvents++) {
        for (iType = 0; iType < typeOrder.length; iType++) {
            var e = playlistsByType[typeOrder[iType]][nEvents];
            var fname;
            var altName;
            if (e.compType === 'calibration') {
                fname = `sbs_calibration_${e.flip}`;
                filenames.push(fname);
                altName = `sbs_calibration_${e.flip}`;
                e.fname = fname;
                e.altName = altName;
                calEvents.push(e);
            } else {
                fname = `sbs_${e.compType}_${e.outcomeL}_${e.outcomeR}_${e.object}_${e.camera}_${e.background}_${e.flip}`;
                filenames.push(fname);
                altName = `sbs_${e.compType}_${e.outcomeR}_${e.outcomeL}_${e.object}_${e.camera}_${e.background}_${e.flip}`;
                e.fname = fname;
                e.altName = altName;
                allEvents.push(e);
            }
        }
    }
    // Place calibration events in positions 3 and 6
    allEvents.splice(2, 0, calEvents[0]);
    allEvents.splice(5, 0, calEvents[1]);

    // Add indices to final list, for selecting appropriate audio intro
    for (var eventNum = 0; eventNum < allEvents.length; eventNum++) {
        allEvents[eventNum].index = eventNum + 1;
    }

    return [allEvents, filenames];
}

function audioSourceObjs(path, shortname) {
    return  [
        {
            src: path + shortname + '.ogg',
            type: 'audio/ogg'
        },
        {
            src: path + shortname + '.mp3',
            type: 'audio/mp3'
        }
    ];
}

function videoSourceObjs(path, shortname, organizedByType) {
    if (!organizedByType) {
        return  [
            {
                'src': path + shortname + '.webm',
                'type': 'video/webm'
            },
            {
                'src': path + shortname + '.mp4',
                'type': 'video/mp4'
            }
        ];
    } else {
        return  [
            {
                'src': path + 'webm/' + shortname + '.webm',
                'type': 'video/webm'
            },
            {
                'src': path + 'mp4/' + shortname + '.mp4',
                'type': 'video/mp4'
            }
        ];
    }
}

function toFrames(frameId, eventVideos, BASE_DIR) {

    var nVideos = eventVideos.length;
    return eventVideos.map((e) => {
        if (e.index === nVideos) { // last frame
            return {
                kind: 'exp-lookit-video',
                id: `${frameId}`,
                audioSources: audioSourceObjs(
                    BASE_DIR + 'audio/',
                    'all_done'),
                attnSources: videoSourceObjs(
                    BASE_DIR + 'stimuli/attention/',
                    'attentiongrabber', true),
                announceLength: 0, // no minimum announcement length
                calibrationLength: 0, // no separate calibration phase
                doRecording: false,
                pauseAudio: audioSourceObjs(BASE_DIR + 'audio/', "pause"),
                unpauseAudio:  audioSourceObjs(BASE_DIR + 'audio/', "return_after_pause"),
                pauseText: "(You'll have a moment to turn around again.)"
            };
        }
        var allMusic = ['music_01', 'music_02', 'music_03', 'music_04', 'music_06', 'music_07', 'music_09', 'music_10'];
        var musicName = allMusic[Math.floor(Math.random() * allMusic.length)];

        return { // all non-last frames
            kind: 'exp-lookit-video',
            id: `${frameId}`,
            audioSources: audioSourceObjs(
                BASE_DIR + 'audio/',
                'video_' + ('00' + (e.index)).slice(-2)),
            attnSources: videoSourceObjs(
                BASE_DIR + 'stimuli/attention/',
                'attentiongrabber', true),
            announceLength: 0, // no minimum announcement length
            introSources: videoSourceObjs(
                BASE_DIR + 'stimuli/intro/',
                `cropped_${e.object}`, true),
            calibrationLength: 0, // no separate calibration phase
            musicSources: audioSourceObjs(
                BASE_DIR + 'audio/',
                musicName),
            sources: videoSourceObjs(
                BASE_DIR + 'stimuli/' + e.compType + '/',
                e.fname, true),
            altSources: videoSourceObjs(
                BASE_DIR + 'stimuli/' + e.compType + '/',
                e.altName, true),
            testLength: 24, // length of test trial in seconds
            doRecording: true,
            pauseAudio: audioSourceObjs(BASE_DIR + 'audio/', "pause"),
            unpauseAudio:  audioSourceObjs(BASE_DIR + 'audio/', "return_after_pause"),
            pauseText: "(You'll have a moment to turn around again.)"
        };
    });
}

var randomizer = function(frameId, frame, pastSessions, resolveFrame) {
    var MAX_VIDEOS = frame.MAX_VIDEOS || 24;

    var BASE_DIR = 'https://s3.amazonaws.com/lookitcontents/exp-physics-final/';

    pastSessions = pastSessions.filter(function (session) {
        return session.get('conditions');
    });
    let lastSession = getLastSession(pastSessions);
    var conditions = getConditions(lastSession, frameId);

    var {
        startType,
        showStay,
        whichObjects
    } = conditions;

    var [eventVideos, ] = assignVideos(startType, showStay, whichObjects);

    eventVideos = eventVideos.slice(0,MAX_VIDEOS);
    eventVideos.push({index: MAX_VIDEOS+1});

    // allEvents and filenames are a function of conditions (no need to store)
    var resolved = [];
    toFrames(frameId, eventVideos, BASE_DIR).forEach((frame) => {
        return resolved.push(...resolveFrame(null, frame)[0]);
    });
    return [resolved, conditions];
};

export default randomizer;

// Export helper functions to support unit testing
export { getConditions, getLastSession };
