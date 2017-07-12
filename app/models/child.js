import DS from 'ember-data';

export default DS.Model.extend({
    givenName: DS.attr('string'),
    birthday: DS.attr('date'),
    gender: DS.attr('string'),
    ageAtBirth: DS.attr('string'),
    additionalInformation: DS.attr('string'),
    deleted: DS.attr('boolean', {default: false}),
    user: DS.belongsTo('user')
});
