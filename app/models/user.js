import DS from 'ember-data';

export default DS.Model.extend({
    givenName: DS.attr('string'),
    familyName: DS.attr('string'),
    nickname: DS.attr('string'),
    identicon: DS.attr('string'),
    isActive: DS.attr('boolean'),
    isStaff: DS.attr('boolean'),

    demographics: DS.hasMany('demographic'),
    children: DS.hasMany('child'),

    emailNextSession: DS.attr('boolean'),
    emailNewStudies: DS.attr('boolean'),
    emailStudyUpdates: DS.attr('boolean'),
    emailResponseQuestions: DS.attr('boolean')
});
