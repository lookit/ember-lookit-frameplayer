import DS from 'ember-data';

export default DS.Model.extend({
    study: DS.belongsTo('study'),
    participant: DS.belongsTo('user'),
    profile: DS.belongsTo('profile'),
    results: DS.attr(), // Same as expData - can we use that instead?
    expData: DS.attr(),
    createdOn: DS.attr('date'),
    conditions: DS.attr(),
    sequence: DS.attr(),
    globalEventTimings: DS.attr({ defaultValue: () => [] }),
    studyId: DS.attr('string'), // Do we need this? How else to filter responses endpoint?
    profileId: DS.attr('string') // Do we need this? How else to filter responses endpoint?
});
