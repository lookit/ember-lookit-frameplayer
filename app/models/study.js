import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    dateModified: DS.attr('date'),
    shortDescription: DS.attr('string'),
    longDescription: DS.attr('string'),
    criteria: DS.attr('string'),
    duration: DS.attr('string'),
    contactInfo: DS.attr('string'),
    image: DS.attr('string'),
    structure: DS.attr(''),
    displayFullScreen: DS.attr('boolean'),
    exitURL: DS.attr('string'),
    state: DS.attr('string'),
    public: DS.attr('boolean'),

    organization: DS.belongsTo('organization'),
    creator: DS.belongsTo('user'),
    responses: DS.hasMany('response')
});
