// See https://stackoverflow.com/a/56266358
const isColor = (strColor) => {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
};

export default isColor;