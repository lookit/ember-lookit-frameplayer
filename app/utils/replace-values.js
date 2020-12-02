import Ember from 'ember';

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

// Combine two objects which contain arrays by appending all elements of the
// new array to the original one, or creating a new array if the original did not have this key.
// Modifies targetArrays.
// Example:
//
// targetArrays = {"image": [], "audio": ['a', 'b']}
// newArrays = {"audio": ['c'], "video": ['d', 'e']}
// mergeObjectOfArrays(targetArrays, newArrays)
//
// now targetArrays is {"image": [], "audio": ['a', 'b', 'c'], "video": ['d', 'e']}
function mergeObjectOfArrays(targetArrays, newArrays) {
    Object.keys(newArrays).forEach((item) => {
        if (targetArrays[item]) {
            targetArrays[item].push(...newArrays[item]);
        } else {
            targetArrays[item] = newArrays[item];
        }
    });
    return targetArrays;
}

function Substituter() {
    this.storedProperties = {};

    this.replaceValues = function(obj, rep) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] === 'object') { // recursively handle objects
                    obj[property] = this.replaceValues(obj[property], rep);
                } else if (Array.isArray(obj[property])) { // and lists
                    for (var iElement = 0; iElement < obj[property].length; iElement++) {
                        obj[property][iElement] = this.replaceValues(obj[property][iElement], rep);
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
                                if (!this.storedProperties.hasOwnProperty(propName)) {
                                    this.storedProperties[propName] = {'shuffledArray': shuffleArray(theList), 'index': 0};
                                }
                                // Fetch current element from shuffled array
                                obj[property] = this.storedProperties[propName].shuffledArray[this.storedProperties[propName].index];
                                // Move to next for next UNIQ element using this property
                                this.storedProperties[propName].index = this.storedProperties[propName].index + 1;
                                // Loop around to start if needed
                                if (this.storedProperties[propName].index == this.storedProperties[propName].shuffledArray.length) {
                                    this.storedProperties[propName].index = 0;
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
    };
}

export default Substituter;

export { mergeObjectOfArrays, Substituter };