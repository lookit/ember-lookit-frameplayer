import DS from 'ember-data';

export default DS.Model.extend({
    username: DS.attr('string'),
    givenName: DS.attr('string'),
    middleName: DS.attr('string'),
    familyName: DS.attr('string'),
    // organization: DS.attr(),
    isActive: DS.attr('boolean'),
    isStaff: DS.attr('boolean'),
    createdAt: DS.attr('date'),
    numberOfChildren: DS.attr('string'),
    childBirthdays: DS.attr(),
    languagesSpokenAtHome: DS.attr('string'),
    numberOfGuardians: DS.attr('string'),
    numberOfGuardiansExplanation: DS.attr('string'),
    raceIdentification: DS.attr('string'),
    age: DS.attr('string'),
    gender: DS.attr('string'),
    educationLevel: DS.attr('string'),
    spouseEducationLevel: DS.attr('string'),
    annualIncome: DS.attr('string'),
    numberOfBooks: DS.attr('number'),
    additionalComments: DS.attr('string'),
    country: DS.attr('string'),
    state: DS.attr('string'),
    density: DS.attr('string'),
    extra: DS.attr('string')
});
