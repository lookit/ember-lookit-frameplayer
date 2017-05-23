import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),
    shortDescription: DS.attr(),
    longDescription: DS.attr(),
    criteria: DS.attr(),
    duration: DS.attr(),
    contactInfo: DS.attr(),
    image: DS.attr(),
    // organization: DS.attr(),
    blocks: DS.attr(),
    state: DS.attr(),
    public: DS.attr(),
    displayFullScreen: DS.attr(),
    structure: DS.attr(),
    exitURL: DS.attr()
});
