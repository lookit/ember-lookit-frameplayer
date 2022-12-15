import { module, test} from 'qunit';
import { addSearchParams } from '../../../utils/add-search-params';

module('Unit | Utility | add search params');

test('Test add search params function', function(assert) {
    assert.expect(3);
    assert.equal(addSearchParams('https://lookit.mit.edu', 'repsonse-id', 'hash-child-id'), 'https://lookit.mit.edu/?child=hash-child-id&response=repsonse-id');
    assert.equal(addSearchParams('not-a-url', 'repsonse-id', 'hash-child-id'), '/');
    assert.equal(addSearchParams(undefined, 'repsonse-id', 'hash-child-id'), '/');
});

