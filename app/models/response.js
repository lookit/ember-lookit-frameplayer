import DS from 'ember-data';

export default DS.Model.extend({
    conditions: DS.attr(),
    globalEventTimings: DS.attr({ defaultValue: () => [] }),
    expData: DS.attr(),
    sequence: DS.attr(),
    completed: DS.attr('boolean'),
    child: DS.belongsTo('child'),
    study: DS.belongsTo('study'),
    demographicSnapshot: DS.belongsTo('demographic'),
    createdOn: DS.attr('date')
});
