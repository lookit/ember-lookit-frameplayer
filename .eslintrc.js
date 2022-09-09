// See https://eslint.org/docs/user-guide/configuring#specifying-parser-options

module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 8,
        sourceType: 'module',
        ecmaFeatures: {
            'impliedStrict': true
        }
    },
    extends: 'eslint:recommended',
    env: {
        'browser': true,
        'es6': true
    },
    globals: { // true to allow overwriting
        'moment': false,
        'jsPDF': false,
        'Ajv': false,
        //'PipeSDK': false
    },
    rules: { // 'warn', 'error', or 'off'
        'no-console': 'off', // allow console.log
        'indent': ['warn', 4]
    }
};
