module.exports = {
    eq: function(item1, item2, block) {
        if (item1 == item2) {
            return block.fn(this);
        } else {
            return block.inverse(this);
        }
    },
    noteq: function(item1, item2, block) {
        if (item1 == item2) {
            return block.inverse(this);
        } else {
            return block.fn(this);
        }
    }
};
