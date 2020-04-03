import DS from 'ember-data';

export default DS.Model.extend({
    conditions: DS.attr(),
    globalEventTimings: DS.attr({ defaultValue: () => [] }),
    expData: DS.attr({ defaultValue: () => {} }),
    sequence: DS.attr({ defaultValue: () => [] }),
    completed: DS.attr('boolean', {defaultValue: false}),
    completedConsentFrame: DS.attr('boolean', {defaultValue: false}),
    child: DS.belongsTo('child'),
    study: DS.belongsTo('study'),
    demographicSnapshot: DS.belongsTo('demographic'),
    createdOn: DS.attr('date'),
    isPreview: DS.attr('boolean', {defaultValue: false})
});
