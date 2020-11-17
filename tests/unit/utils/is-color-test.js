import { colorSpecToRgbaArray, isColor } from '../../../utils/is-color';
import { module, test} from 'qunit';


module('Unit | Utility | is color');

test('Valid CSS color syntax recognized', function(assert) {
    assert.ok(isColor('black'), 'Black is a color');
    assert.notOk(isColor('blark'), 'Blark is not a color');

    assert.ok(isColor('#cc00ff'), '#cc00ff is a color');
    assert.notOk(isColor('cc00ff'), 'cc00ff is not a color');
});

test('CSS color specs correctly turned into RGBA arrays', function(assert) {
    let black = new Uint8ClampedArray([0, 0, 0, 255]);
    assert.deepEqual(colorSpecToRgbaArray('black'), black);
    assert.deepEqual(colorSpecToRgbaArray('#000'), black);

    let limegreen = new Uint8ClampedArray([0, 255, 0, 255]);
    assert.deepEqual(colorSpecToRgbaArray('lime'), limegreen);
    assert.deepEqual(colorSpecToRgbaArray('#0f0'), limegreen);
});