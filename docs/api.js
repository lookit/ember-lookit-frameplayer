YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Exp-exit-survey",
        "Exp-frame-base",
        "Exp-frame-select",
        "Exp-lookit-dialogue-page",
        "Exp-lookit-exit-survey",
        "Exp-lookit-geometry-alternation",
        "Exp-lookit-geometry-alternation-open",
        "Exp-lookit-instructions",
        "Exp-lookit-mood-questionnaire",
        "Exp-lookit-observation",
        "Exp-lookit-preferential-looking",
        "Exp-lookit-preview-explanation",
        "Exp-lookit-story-page",
        "Exp-lookit-survey",
        "Exp-lookit-text",
        "Exp-lookit-video",
        "Exp-lookit-video-assent",
        "Exp-lookit-video-consent",
        "Exp-player",
        "Exp-video-config",
        "Exp-video-config-quality",
        "Exp-video-consent",
        "Exp-video-preview",
        "Expand-assets",
        "Full-screen",
        "Media-reload",
        "Permute",
        "Random-parameter-set",
        "Select",
        "Session-record",
        "Video-record",
        "video-recorder"
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
            "description": "Reusable components for UI rendering and interactivity"
        },
        {
            "displayName": "exp-player",
            "name": "exp-player",
            "description": "Reusable parts of experiments. Includes frame definitions, randomizers, and utilities."
        },
        {
            "displayName": "frames",
            "name": "frames",
            "description": "Reusable frames that can be used as part of user-defined experiments. This is the main reference for researchers\n  looking to build their own experiment definitions on the experimenter platform."
        },
        {
            "displayName": "mixins",
            "name": "mixins",
            "description": "Mixins that can be used to add functionality to specific frames"
        },
        {
            "displayName": "randomizers",
            "name": "randomizers",
            "description": "Reusable randomizers that can be used as part of user-defined experiments.\nRandomizers allow researchers to specify how to select which frames or\nsequences of frames to use as part of a particular session of a given\nexperiment, for instance in order to counterbalance stimuli used across\nsubjects, assign subjects randomly to different experimental conditions, or\nimplement a longitudinal design where the frames used in this study depend on\nthe frames used in the participant's last session."
        },
        {
            "displayName": "services",
            "name": "services",
            "description": "Services used to provide centralized functionality"
        }
    ],
    "elements": []
} };
});