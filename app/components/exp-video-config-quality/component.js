import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video configuration frame showing webcam view at right and instructions for checking video quality for preferential looking setup at left, with pictures. Content is hard-coded for preferential looking requirements and images; this frame can serve as a template for other applications (e.g., verbal responses, where we might care less about lighting but want to generally be able to see the child's face) or can be generalized to show an arbitrary set of instructions/images.

```json
"frames": {
    "video-quality": {
        "kind": "exp-video-config-quality"
    }
}
```

@class ExpVideoConfigQuality
@extends ExpFrameBase
@extends VideoRecord

*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,

    type: 'exp-video-config-quality',
    meta: {
        name: 'Video Recorder Configuration for preferential looking',
        description: 'Video configuration frame showing webcam view at right and instructions for checking video quality for preferential looking setup at left, with pictures.',
        parameters: {
            type: 'object',
            properties: {
            },
            required: []
        },
        data: {
            type: 'object',
            properties: {}
        }
    }
});
