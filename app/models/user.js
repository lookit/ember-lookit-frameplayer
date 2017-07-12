import DS from 'ember-data';

export default DS.Model.extend({
    givenName: DS.attr('string'),
    middleName: DS.attr('string'),
    familyName: DS.attr('string'),
    identicon: DS.attr('string'),
    isActive: DS.attr('boolean'),
    isStaff: DS.attr('boolean'),

    demographics: DS.hasMany('demographic'),
    organization: DS.belongsTo('organization'),
    children: DS.hasMany('child')
});
