import Ember from 'ember';

function expFormat(text) {
    if (Array.isArray(text)) {
        text = text.join('\n\n');
    }
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    text = text.replace(/\t/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');

    return new Ember.String.htmlSafe(text);
}

export default Ember.Helper.helper(expFormat);

export { expFormat }
