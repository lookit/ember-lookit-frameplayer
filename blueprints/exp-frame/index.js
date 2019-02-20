module.exports = {
    name: 'exp-frame',
    normalizeEntityName: function(entityName) {
        entityName = this._super.normalizeEntityName(entityName);

        if (entityName.indexOf('exp-') !== 0) {
            throw new Error('Module name must be prefixed with \'exp-\'');
        }
        return entityName;
    }
};
