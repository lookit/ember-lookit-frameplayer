// See https://stackoverflow.com/a/56266358.
// Return value: whether this is a valid CSS color specifier (#000000, green, etc.)
const isColor = (strColor) => {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
};

// Simplified form of https://bl.ocks.org/njvack/02ad8efcb0d552b0230d
const colorSpecToRgbaArray = function(color) {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    /*
     * Turns any valid canvas fillStyle into a 4-element Uint8ClampedArray with bytes
     * for R, G, B, and A. Invalid styles will return [0, 0, 0, 0]. Examples:
     * color_convert.to_rgb_array('red')  # [255, 0, 0, 255]
     * color_convert.to_rgb_array('#ff0000')  # [255, 0, 0, 255]
     * color_convert.to_rgb_array('garbagey')  # [0, 0, 0, 0]
     */
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    // We're reusing the canvas, so fill it with something predictable
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data;
};

// Return either 'black' or 'white' depending on whether background color (RGB(A) array) is dark or light)
const textColorForBackground = function(colorSpecRGBA) {
    return (colorSpecRGBA[0] + colorSpecRGBA[1] + colorSpecRGBA[2] > 128 * 3) ? 'black' : 'white';
};

export default isColor;

export { colorSpecToRgbaArray, isColor, textColorForBackground };