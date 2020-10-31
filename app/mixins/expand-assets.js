import Ember from 'ember';

/**
 * @module exp-player
 * @submodule mixins
 */

/**
 *
 * Reference for DEVELOPERS of new frames only!
 *
 * Mixin to allow users to provide audio/video and image source values as either relative paths
 * within a base directory or as full paths.
 *
 * If using along with other mixins, this should be listed LAST to enable those mixins to add to the set
 * of assets that need to be expanded if needed.
 *
 * When adding this mixin to a frame, you will need to define a property of the frame
 * `assetsToExpand`, which indicates which parameters might be source objects that need
 * expansion. `assetsToExpand` should be an object with keys `image`, `video`, and `audio`,
 * and each value should be an Array of parameter names that provide sources for resources
 * of the corresponding type. E.g.,
 ```
    {
        'image': ['leftObjectPic', 'rightObjectPic'],
        'audio': ['introAudio', 'testAudio'],
        'video': ['objectDemoVideo']
    }
 ```
 *
 * This is defined directly within your frame, e.g.:
```
    export default ExpFrameBaseComponent.extend(ExpandAssets, {
        ...
        type: 'exp-my-cool-frame',
        assetsToExpand:     {
            'image': ['leftObjectPic', 'rightObjectPic'],
            'audio': ['introAudio', 'testAudio'],
            'video': ['objectDemoVideo']
            },
        ...,
        meta: {...},
        actions: {...}
    });
```

 *
 *
 * The *user* of your frame can then optionally provide `baseDir`, `audioTypes`, and
 * `videoTypes` parameters to indicate how to expand relative paths.
 *
 * How expansion works:
 * - **Images**: Suppose the list `assetsToExpand['image']` contains `centerStimulus`. If
 *   `centerStimulus` is provided as a full URL (with `://` in it), nothing will happen to
 *   it. But if `centerStimulus` is a string that is not a full URL, it will be transformed
 *   during the `didReceiveAttrs` hook to `baseDir + 'img/' + centerStimulus`.
 *
 * - **Audio**: Suppose the list `assetsToExpand['audio']` contains `utterance1`. If
 *   `utterance1` is a nonempty string (rather than an object/Array), e.g., `goodmorning`,
 *   and `audioTypes` has been set to `['typeA', 'typeB']`,
 *   then `utterance1` will be expanded out to
 ```
         [
             {
                 src: 'baseDir' + 'typeA/goodmorning.typeA',
                 type: 'audio/typeA'
             },
             {
                 src: 'baseDir' + 'typeB/goodmorning.typeB',
                 type: 'audio/typeB'
             }
         ]
 ```
 *
 * - **Video**: Same as audio, but using the types from `videoTypes`.
 *
 * **Important**: During the `didReceiveAttrs` hook, your frame will acquire new properties `[parameterName]_parsed`
 * for each of the parameters named in `assetsToExpand`. These properties will hold the
 * expanded values. E.g., in the example above, you would now have a `centerStimulus_parsed`
 * property. This is what you should use for showing/playing images/audio/video in your
 * frame template.
 *
 * **Advanced use**: the property names in `assetsToExpand` can be either full parameter names
 * as in the examples above, or can be of the form `parameterName/subProperty`. If using
 * the `parameterName/subProperty` syntax, instead of processing the parameter `parameterName`,
 * we will expect that that parameter is either an object with property `subProperty`
 * (which will be expanded) or an Array of objects with property `subProperty` (which will
 * be expanded). The original value of the `parameterName` parameter may in this case be
 * mutated as assets are expanded. However, your frame will still also acquire a new
 * property `[parameterName]_parsed` which you should use for accessing the processed
 * values. This avoids potential problems with the template being rendered using the original
 * values and not updated.
 *
 * @class Expand-assets
 */

var expandAssetsMixin = Ember.Mixin.create({
    /**
     * Object describing which properties may need expansion
     * @property {String} assetsToExpand
     * @private
     */
    assetsToExpand: {},

    frameSchemaProperties: {
        /**
         * Base directory for where to find stimuli. Any image src
         * values that are not full paths will be expanded by prefixing
         * with `baseDir` + `img/`. Any audio/video src values provided as
         * strings rather than objects with `src` and `type` will be
         * expanded out to `baseDir/avtype/[stub].avtype`, where the potential
         * avtypes are given by `audioTypes` and `videoTypes`.
         *
         * baseDir should include a trailing slash
         * (e.g., `http://stimuli.org/myexperiment/`); if a value is provided that
         * does not end in a slash, one will be added.
         *
         * @property {String} baseDir
         * @default ''
         */
        baseDir: {
            type: 'string',
            default: '',
            description: 'Base directory for all stimuli'
        },
        /**
         * List of audio types to expect for any audio specified just
         * with a string rather than with a list of src/type objects.
         * If audioTypes is `['typeA', 'typeB']` and an audio source
         * is given as `intro`, the audio source will be
         * expanded out to
         *
         *
         *     [
         *         {
         *             src: 'baseDir' + 'typeA/intro.typeA',
         *             type: 'audio/typeA'
         *         },
         *         {
         *             src: 'baseDir' + 'typeB/intro.typeB',
         *             type: 'audio/typeB'
         *         }
         *     ]
         *
         *
         * @property {String[]} audioTypes
         * @default ['mp3', 'ogg']
         */
        audioTypes: {
            type: 'array',
            default: ['mp3', 'ogg'],
            description: 'List of audio types to expect for any audio sources specified as strings rather than lists of src/type pairs'
        },
        /**
         * List of video types to expect for any audio specified just
         * with a string rather than with a list of src/type objects.
         * If videoTypes is `['typeA', 'typeB']` and a video source
         * is given as `intro`, the video source will be
         * expanded out to
         *
         *
         *     [
         *         {
         *             src: 'baseDir' + 'typeA/intro.typeA',
         *             type: 'video/typeA'
         *         },
         *         {
         *             src: 'baseDir' + 'typeB/intro.typeB',
         *             type: 'video/typeB'
         *         }
         *     ]
         *
         *
         * @property {String[]} videoTypes
         * @default ['mp4', 'webm']
         */
        videoTypes: {
            type: 'array',
            default: ['mp4', 'webm'],
            description: 'List of audio types to expect for any video sources specified as strings rather than lists of src/type pairs'
        }
    },

    checkFileExists(url) {
        // see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        //
        // Getting back a meaningful response about whether the file even exists requires
        // CORS settings on the server to allow this origin, which is *not* required for
        // simply loading the image/video/audio in the browser, which is all we really
        // need to do. This function will warn if CORS blocks the request or if the file
        // is not available, but this will cause a lot of (unnecessary) noise in many cases.

        // Could alternately try to load assets into browser to see if they exist, but
        // in cases where there are a bunch of potential assets listed, we don't necessarily
        // want to load them all upfront.
        fetch(url, { method: 'HEAD' }).then((response) => {
            if (!response.ok) {
                console.warn('File not available: ', url);
                console.log(response);
            }
        })
            .catch((error) => {
                console.warn('File not available: ', url, ' - error: ', error);
            });
    },

    // Utility to expand stubs into either full URLs (for images) or
    // array of {src: 'url', type: 'MIMEtype'} objects (for audio/video).
    expandAsset(asset, type) {
        var fullAsset = asset;
        var _this = this;

        var typesDict = {
            'audio': this.get('audioTypes'),
            'video': this.get('videoTypes')
        };

        switch (type) {
        case 'image':
            if (typeof asset === 'string' && !(asset.includes('://'))) {
                // Image: replace stub with full URL if needed
                fullAsset = this.baseDir + 'img/' + asset;
            } else if (Array.isArray(asset)) {
                for (var i = 0; i < asset.length; i++) {
                    var currentVal = asset[i];
                    if (typeof currentVal === 'string' && !(currentVal.includes('://'))) {
                        asset[i] = this.baseDir + 'img/' + currentVal;
                    }
                }
            }
            return fullAsset;
        case 'audio':
        case 'video':
            var types = typesDict[type];
            // Replace any string sources with the appropriate expanded source objects
            if (typeof asset === 'string' && asset) {
                fullAsset = [];
                for (var iType = 0; iType < types.length; iType++) {
                    let url = _this.baseDir + types[iType] + '/' + asset + '.' + types[iType];
                    fullAsset.push({
                        src: url,
                        type: type + '/' + types[iType]
                    });
                }
            }
            return fullAsset;
        default:
            throw "Unrecognized type of asset to expand. Options are 'image', 'audio', and 'video'.";
        }
    },

    expandAssets() {
        // Add a trailing slash to baseDir if needed
        var baseDir = this.get('baseDir');
        if (baseDir && baseDir.slice(-1) != '/') {
            baseDir = baseDir + '/';
            this.set('baseDir', baseDir);
        }

        var _this = this;
        var assetTypes = ['audio', 'video', 'image'];
        var sources;

        assetTypes.forEach((type) => {
            if (_this.get('assetsToExpand', {}).hasOwnProperty(type)) {
                var srcParameterNames = _this.get('assetsToExpand', {})[type];
                srcParameterNames.forEach((paraName) => {
                    var paraPieces = paraName.split('/');
                    if (paraPieces.length == 1) { // If we have the full parameter name, just expand that param
                        sources = _this.get(paraName);
                        if (sources) {
                            _this.set(paraName + '_parsed', _this.expandAsset(sources, type));
                        }
                    } else if (paraPieces.length == 2) { // If we have something of the form parameterName/propName
                        var baseName = paraPieces[0];
                        var propName = paraPieces[1]; //paraPieces.slice(1,).join('/');
                        sources = _this.get(baseName, {});
                        if (sources) {
                            if (Array.isArray(sources)) {  //expand this[parameterName][i][propName] for all i
                                sources.forEach((elem) => {
                                    if (elem.hasOwnProperty(propName)) {
                                        Ember.set(elem, propName, _this.expandAsset(elem[propName], type));
                                    }
                                });
                                _this.set(baseName + '_parsed', sources);
                            } else { //expand this[parameterName][propName]
                                if (sources.hasOwnProperty(propName)) {
                                    Ember.set(sources, propName, _this.expandAsset(sources[propName], type));
                                }
                                _this.set(baseName + '_parsed', sources);
                            }
                        }
                    } else { // Have something like 'a/b/c' with two or more slashes, not handled yet
                        throw 'Nesting of parameter names to expand beyond two levels not supported (max one slash).';
                    }

                });
            }
        });
    },

    didReceiveAttrs() {
        this._super(...arguments);
        this.expandAssets();
    }

});

// JSON Schema values to use for media assets when using this mixin
var audioTypes = ['mp3', 'ogg', 'wav', 'wave', 'x-wav', 'x-pn-wav', 'webm', 'mpeg', 'flac', 'x-flac'].map(type => 'audio/' + type);
var videoTypes = ['webm', 'mp4', 'ogg'].map(type => 'video/' + type);
var schemaForSrcTypePairs = function(types) {
    return {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                'src': {
                    type: 'string',
                    format: 'uri'
                },
                'type': {
                    type: 'string',
                    enum: types
                }
            }
        }
    };
};

var audioAssetOptions = [
    {
        type: 'string'
    },
    schemaForSrcTypePairs(audioTypes)
];

var videoAssetOptions = [
    {
        type: 'string'
    },
    schemaForSrcTypePairs(videoTypes)
];

var imageAssetOptions = [
    {
        type: 'string'
    },
    {
        type: 'string',
        format: 'uri'
    }
];

export default expandAssetsMixin;

export { expandAssetsMixin, audioAssetOptions, videoAssetOptions, imageAssetOptions };
