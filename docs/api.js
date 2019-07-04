YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ExpExitSurvey",
        "ExpFrameBase",
        "ExpFrameSelect",
        "ExpLookitDialoguePage",
        "ExpLookitExitSurvey",
        "ExpLookitGeometryAlternation",
        "ExpLookitInstructions",
        "ExpLookitMoodQuestionnaire",
        "ExpLookitObservation",
        "ExpLookitPreferentialLooking",
        "ExpLookitPreviewExplanation",
        "ExpLookitStoryPage",
        "ExpLookitSurvey",
        "ExpLookitText",
        "ExpLookitVideo",
        "ExpLookitVideoAssent",
        "ExpLookitVideoConsent",
        "ExpPlayer",
        "ExpVideoConfig",
        "ExpVideoConfigQuality",
        "ExpVideoConsent",
        "ExpVideoPreview",
        "ExpandAssets",
        "FullScreen",
        "MediaReload",
        "RandomParameterSet",
        "Select",
        "VideoRecordMixin",
        "VideoRecorderObject",
        "permute",
        "videoRecorder"
    ],
    "modules": [
        "components",
        "exp-player",
        "frames",
        "mixins",
        "randomizers",
        "services"
    ],
    "allModules": [
        {
            "displayName": "components",
            "name": "components",
            "description": "Experiment player: a component that renders a series of frames that define an experiment\n\nSample usage:\n```handlebars\n{{exp-player\n  experiment=experiment\n  session=session\n  pastSessions=pastSessions\n  saveHandler=(action 'saveSession')\n  frameIndex=0\n  fullScreenElementId='expContainer'}}\n```"
        },
        {
            "displayName": "exp-player",
            "name": "exp-player"
        },
        {
            "displayName": "frames",
            "name": "frames",
            "description": "This is the exit survey used by \"Your baby the physicist\". Use the updated frame {{#crossLink \"ExpLookitExitSurvey\"}}{{/crossLink}} instead."
        },
        {
            "displayName": "mixins",
            "name": "mixins",
            "description": "Allow users to provide audio/video and image source values as either relative paths\nwithin a base directory or as full paths.\n\nWhen adding this mixin to a frame, you will need to define a property of the frame\n`assetsToExpand`, which indicates which parameters might be source objects that need\nexpansion. `assetsToExpand` should be an object with keys `image`, `video`, and `audio`,\nand each value should be an Array of parameter names that provide sources for resources\nof the corresponding type. E.g.,\n```\n   {\n       'image': ['leftObjectPic', 'rightObjectPic'],\n       'audio': ['introAudio', 'testAudio'],\n       'video': ['objectDemoVideo']\n   }\n```\n\nThis is defined directly within your frame, e.g.:\n```\n   export default ExpFrameBaseComponent.extend(ExpandAssets, {\n       ...\n       type: 'exp-my-cool-frame',\n       assetsToExpand:     {\n           'image': ['leftObjectPic', 'rightObjectPic'],\n           'audio': ['introAudio', 'testAudio'],\n           'video': ['objectDemoVideo']\n           },\n       ...,\n       meta: {...},\n       actions: {...}\n   });\n```\n\n\n\nThe *user* of your frame can then optionally provide `baseDir`, `audioTypes`, and\n`videoTypes` parameters to indicate how to expand relative paths.\n\nHow expansion works:\n- **Images**: Suppose the list `assetsToExpand['image']` contains `centerStimulus`. If\n  `centerStimulus` is provided as a full URL (with `://` in it), nothing will happen to\n  it. But if `centerStimulus` is a string that is not a full URL, it will be transformed\n  during the `didReceiveAttrs` hook to `baseDir + 'img/' + centerStimulus`.\n\n- **Audio**: Suppose the list `assetsToExpand['audio']` contains `utterance1`. If\n  `utterance1` is a nonempty string (rather than an object/Array), e.g., `goodmorning`,\n  and `audioTypes` has been set to `['typeA', 'typeB']`,\n  then `utterance1` will be expanded out to\n```\n        [\n            {\n                src: 'baseDir' + 'typeA/goodmorning.typeA',\n                type: 'audio/typeA'\n            },\n            {\n                src: 'baseDir' + 'typeB/goodmorning.typeB',\n                type: 'audio/typeB'\n            }\n        ]\n```\n\n- **Video**: Same as audio, but using the types from `videoTypes`.\n\n**Important**: During the `didReceiveAttrs` hook, your frame will acquire new properties `[parameterName]_parsed`\nfor each of the parameters named in `assetsToExpand`. These properties will hold the\nexpanded values. E.g., in the example above, you would now have a `centerStimulus_parsed`\nproperty. This is what you should use for showing/playing images/audio/video in your\nframe template.\n\n**Advanced use**: the property names in `assetsToExpand` can be either full parameter names\nas in the examples above, or can be of the form `parameterName/subProperty`. If using\nthe `parameterName/subProperty` syntax, instead of processing the parameter `parameterName`,\nwe will expect that that parameter is either an object with property `subProperty`\n(which will be expanded) or an Array of objects with property `subProperty` (which will\nbe expanded). The original value of the `parameterName` parameter may in this case be\nmutated as assets are expanded. However, your frame will still also acquire a new\nproperty `[parameterName]_parsed` which you should use for accessing the processed\nvalues. This avoids potential problems with the template being rendered using the original\nvalues and not updated."
        },
        {
            "displayName": "randomizers",
            "name": "randomizers",
            "description": "Randomizer to allow random ordering of a list of frames. Intended to be\nuseful for e.g. randomly permuting the order of particular stimuli used during\na set of trials (although frames need not be of the same kind to permute).\n\nTo use, define a frame with \"kind\": \"choice\" and \"sampler\": \"permute\",\nas shown below, in addition to the parameters described under 'properties'.\n\n```json\n\"frames\": {\n   \"test-trials\": {\n       \"sampler\": \"permute\",\n       \"kind\": \"choice\",\n       \"commonFrameProperties\": {\n           \"showPreviousButton\": false\n       },\n       \"frameOptions\": [\n           {\n               \"blocks\": [\n                   {\n                       \"emph\": true,\n                       \"text\": \"Let's think about hippos!\",\n                       \"title\": \"hippos!\"\n                   },\n                   {\n                       \"text\": \"Some more about hippos...\"\n                   }\n               ],\n               \"kind\": \"exp-lookit-text\"\n           },\n           {\n               \"blocks\": [\n                   {\n                       \"emph\": false,\n                       \"text\": \"Let's think about dolphins!\",\n                       \"title\": \"dolphins!\"\n                   }\n               ],\n               \"kind\": \"exp-lookit-text\"\n           }\n       ]\n   }\n}\n\n```"
        },
        {
            "displayName": "services",
            "name": "services",
            "description": "An instance of a video recorder tied to or used by one specific page. A given experiment may use more than one\n  video recorder depending on the number of video capture frames."
        }
    ],
    "elements": []
} };
});