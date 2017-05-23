import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    shortDescription: DS.attr('string'),
    longDescription: DS.attr('string'),
    criteria: DS.attr('string'),
    duration: DS.attr('string'),
    contactInfo: DS.attr('string'),
    image: DS.attr(),
    // organization: DS.attr(),
    blocks: DS.attr(),
    state: DS.attr('string'),
    public: DS.attr('boolean'),
    displayFullScreen: DS.attr('boolean'),
    structure: DS.attr(),
    exitURL: DS.attr('string')
});
