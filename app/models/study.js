import DS from 'ember-data';
import HasManyQuery from 'ember-data-has-many-query';

export default DS.Model.extend(HasManyQuery.ModelMixin, {
    name: DS.attr('string'),
    shortDescription: DS.attr('string'),
    longDescription: DS.attr('string'),
    criteria: DS.attr('string'),
    duration: DS.attr('string'),
    contactInfo: DS.attr('string'),
    image: DS.attr('string'),
    structure: DS.attr(''),
    generator: DS.attr('string'),
    useGenerator: DS.attr('boolean'),
    exitURL: DS.attr('string'),
    state: DS.attr('string'),
    public: DS.attr('boolean'),

    responses: DS.hasMany('response')
});
