import Ember from 'ember';

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
}

export default Substituter;
