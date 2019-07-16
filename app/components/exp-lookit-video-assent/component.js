import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../exp-frame-base/component';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';
import ExpandAssets from '../../mixins/expand-assets';
import { computed } from '@ember/object';

let {
    $
} = Em;

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video assent frame for Lookit studies for older children to agree to participation,
separately from parental consent.

A series of assent form "pages" is displayed, each one displaying an image,
optional audio/video, optional webcam view, and/or text. Once the family has viewed all pages,
the child can answer a question about whether to participate. If they choose yes, they proceed; if
they choose no, they are sent to the exit URL.

If audio or video is provided for a page, the participant must finish it to proceed to the
next page (or to answer the participation question, if this is the last page). They only
need to complete the audio/video for a given page once, in case they navigate using the
previous/next buttons.

This frame can optionally be shown only when the child is at least N years old, in case
some participants will need to give assent and others will rely only on parent consent.

Specifying media locations:
For `imgSrc` parameters within `pages`, you can either specify complete URLs or partial URLs
relative to a base directory `baseDir` for the frame. Images are expected to be in an
`img` directory within the `baseDir`. For instance, in the example below,
the first page's image is at `https://s3.amazonaws.com/lookitcontents/cats/img/jane_smith.jpg`.

For any parameters that expect a list of audio/video sources, you can EITHER provide
a list of src/type pairs with full paths like this:
```json
    [
        {
            'src': 'http://.../video1.mp4',
            'type': 'video/mp4'
        },
        {
            'src': 'http://.../video1.webm',
            'type': 'video/webm'
        }
    ]
```
OR you can provide a single string 'stub', which will be expanded
based on the parameter baseDir and the media types expected - either audioTypes or
videoTypes as appropriate. For example, if you provide the audio source `intro`
and baseDir is https://mystimuli.org/mystudy/, with audioTypes ['mp3', 'ogg'], then this
will be expanded to:
```json
                 [
                        {
                            src: 'https://mystimuli.org/mystudy/mp3/intro.mp3',
                            type: 'audio/mp3'
                        },
                        {
                            src: 'https://mystimuli.org/mystudy/ogg/intro.ogg',
                            type: 'audio/ogg'
                        }
                ]
```
This allows you to simplify your JSON document a bit and also easily switch to a
new version of your stimuli without changing every URL. You can mix source objects with
full URLs and those using stubs within the same directory. However, any stimuli
specified using stubs MUST be organized as expected under baseDir/MEDIATYPE/filename.MEDIATYPE.

```json
"frames": {
    "video-assent": {
        "kind": "exp-lookit-video-assent",
            "pages": [
                {
                    "imgSrc": "jane_smith.png",
                    "altText": "Jane Smith",
                    "textBlocks": [
                        {
                            "text": "My name is Jane Smith. I am a scientist who studies why children love cats."
                        }
                    ],
                    "audio": "narration_1"
                },
                {
                    "imgSrc": "cats_game.png",
                    "altText": "picture of sample game",
                    "textBlocks": [
                        {
                            "text": "In this study, you will play a game about cats."
                        }
                    ]
                },
                {
                    "showWebcam": true,
                    "textBlocks": [
                        {
                            "text": "During the study, your webcam will record a video of you. We will watch this video later to see how much you love cats."
                        }
                    ]
                }
            ],
            "baseDir": "https://s3.amazonaws.com/lookitcontents/cats/",
            "videoTypes": [
                "webm",
                "mp4"
            ],
            "participationQuestion": "Do you want to participate in this study?",
            "minimumYearsToAssent": 7
        }
    }
}
```

@class ExpLookitVideoAssent
@extends ExpFrameBase

@uses VideoRecord
*/

export default ExpFrameBaseComponent.extend(VideoRecord, MediaReload, ExpandAssets, {
    layout,
    frameType: 'CONSENT',
    disableRecord: Em.computed('recorder.recording', 'recorder.hasCamAccess', function () {
        return !this.get('recorder.hasCamAccess') || this.get('recorder.recording');
    }),
    startedRecording: false,

    pageIndex: 0,
    readAllPages: false,

    noNext: computed('pageIndex', 'hasCompletedThisPageAudio', function() {
        return (this.get('pageIndex') >= this.get('pages.length') - 1) || (!this.get('hasCompletedThisPageAudio'));
    }),

    noPrev: computed('pageIndex', function() {
        return this.get('pageIndex') <= 0;
    }),

    currentPage: computed('pageIndex', function() {
        return this.get('pages_parsed')[this.get('pageIndex')];
    }),

    pageHasAudio: computed('pageIndex', function() {
        return !!this.get('pages_parsed')[this.get('pageIndex')].audio;
    }),

    hasCompletedEachPageAudio: [false], // start off with just covering page 0, populate in didInsert

    hasCompletedThisPageAudio: false, // Track state of current page for blocking 'continue' action

    childResponse: false,
    stoppedRecording: false,

    assetsToExpand: {
        'audio': ['pages/audio'],
        'video': ['pages/video'],
        'image': ['pages/imgSrc']
    },

    // Utility to play audio object and avoid failing to actually trigger play for
    // dumb browser reasons / race conditions
    playAudio(audioObj) {
        //audioObj.pause();
        audioObj.currentTime = 0;
        audioObj.play().then(() => {
            }).catch(() => {
                audioObj.play();
            }
        );
    },

    actions: {

        nextVideo() {
            this.set('pageIndex', this.get('pageIndex') + 1);
            if ((this.get('pageIndex') == this.get('pages').length - 1) && !this.get('pageHasAudio')) {
                this.set('readAllPages', true);
            }
            if (this.get('pageHasAudio')) {
                this.playAudio($('audio#assent-audio')[0]);
            }
            this.set('hasCompletedThisPageAudio', this.get('hasCompletedEachPageAudio')[this.get('pageIndex')]);
        },

        previousVideo() {
            this.set('pageIndex', this.get('pageIndex') - 1);
            if (this.get('pageHasAudio')) {
                this.playAudio($('audio#assent-audio')[0]);
            }
            this.set('hasCompletedThisPageAudio', this.get('hasCompletedEachPageAudio')[this.get('pageIndex')]);
        },

        selectYes() {
            this.set('childResponse', 'Yes');
        },

        selectNo() {
            this.set('childResponse', 'No');
        },

        record() {
            this.startRecorder().then(() => {
                this.set('startedRecording', true);
                // Require at least 3 s recording
                setTimeout(function() {
                    $('#submitbutton').prop('disabled', false);
                }, 3000);
            });
        },

        submit() {
            this.session.set('completedConsentFrame', true);
            if (this.get('childResponse') == 'Yes') {
                this.send('next');
            } else {
                this.send('exit');
            }
        },

        audioCompleted() {
            this.get('hasCompletedEachPageAudio')[this.get('pageIndex')] = true;
            this.set('hasCompletedThisPageAudio', true);

            if (this.get('pageIndex') == this.get('pages').length - 1) {
                this.set('readAllPages', true);
            }
        },

        startAudio() {
            this.playAudio($('audio#assent-audio')[0]);
        },


        download() {
            // Get the text of the consent form to process. Split into lines, and remove
            // repeat empty lines. Start each new line with an indent.

            console.log(this);

            var origText = $('#consent-form-full-text').text().split(/\r?\n/);
            var trimmedText = [];
            var emptyLineWasLast = false;
            $.each(origText, function(idx, val) {
                if (val.trim() || !emptyLineWasLast) {
                    trimmedText.push('     ' + val.trim());
                    if (emptyLineWasLast) {
                        trimmedText.push('');
                    }
                }
                if (val.trim()) {
                    emptyLineWasLast = false;
                } else {
                    emptyLineWasLast = true;
                }
            });

            // Prep PDF - need to set font before splitting lines
            // jscs:disable requireCapitalizedConstructors
            var consentPDF = new jsPDF();
            // jscs:enable requireCapitalizedConstructors
            consentPDF.setFont('times');
            consentPDF.setFontSize(12);
            var timeString = moment().format('MMMM Do YYYY, h:mm:ss a'); // for header

            // Wrap lines so they'll fit nicely on the page
            var splitText = consentPDF.splitTextToSize(trimmedText, 150);

            // Split into pages
            var linesPerPage = 55;
            var nPages = Math.ceil(splitText.length / linesPerPage);
            for (var iPage = 0; iPage < nPages; iPage++) {
                // Header on each page
                consentPDF.setFontSize(10);
                consentPDF.text('Child assent form: ' + this.get('experiment').get('name'), 10, 10);
                consentPDF.text(timeString + ' (page ' + (iPage + 1) + ' of ' + nPages + ')', 10, 15);
                // Actual text for the page
                consentPDF.setFontSize(12);
                consentPDF.text(splitText.slice(linesPerPage * iPage, linesPerPage * (iPage + 1)), 25, 25);

                // Go to the next page
                if (iPage < (nPages - 1)) {
                    consentPDF.addPage();
                }
            }
            consentPDF.save('Lookit_study_child_assent_' + moment().format('YYYY_MM_DD') + '.pdf');

            /**
             * When participant downloads consent form
             *
             * @event downloadConsentForm
             */
            this.send('setTimeEvent', 'downloadConsentForm');
        }
    },

    meta: {
        name: 'Video assent form',
        description: 'A video assent form.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * A list of pages of assent form text/pictures/video for the participant to read through
                 *
                 * @property {Array} pages
                 *   @param {String} altText Alt-text used for the image displayed, if any
                 *   @param {Object[]} video (Optional) String indicating video path relative to baseDir (see baseDir), OR Array of {src: 'url', type: 'MIMEtype'} objects. Video will be displayed (with controls shown) and participant must complete to proceed.
                 *   @param {Object[]} audio (Optional) String indicating audio path relative to baseDir (see baseDir), OR Array of {src: 'url', type: 'MIMEtype'} objects. Audio will be played (with controls shown) and participant must complete to proceed.
                 *   @param {String} imgSrc (Optional) URL of image to display; can be full path or relative to baseDir
                 *   @param {Object[]} textBlocks list of text blocks to show on this page, processed by exp-text-block. Can use HTML.
                 *   @param {Boolean} showWebcam Whether to display the participant webcam on this page
                 */
                pages: {
                    type: 'array',
                    description: 'A list of videos to preview',
                    items: {
                        type: 'object',
                        properties: {
                            imgSrc: {
                                type: 'string',
                                default: ''
                            },
                            altText: {
                                type: 'string',
                                default: 'image'
                            },
                            video: {
                                type: 'array',
                                default: [],
                                items: {
                                    type: 'object',
                                    properties: {
                                        src: {
                                            type: 'string'
                                        },
                                        type: {
                                            type: 'string'
                                        }
                                    },
                                    required: ['src', 'type']
                                }
                            },
                            audio: {
                                type: 'array',
                                default: [],
                                items: {
                                    type: 'object',
                                    properties: {
                                        src: {
                                            type: 'string'
                                        },
                                        type: {
                                            type: 'string'
                                        }
                                    },
                                    required: ['src', 'type']
                                }
                            },
                            textBlocks: {
                                type: 'array',
                                default: []
                            },
                            showWebcam: {
                                type: 'Boolean',
                                default: false
                            }
                        },
                        required: []
                    },
                    default: []
                },
                /**
                 * Text on the button to proceed to the next example video/image
                 *
                 * @property {String} nextStimulusText
                 */
                nextStimulusText: {
                    type: 'string',
                    description: 'Text on the button to proceed to the next example video/image',
                    default: 'Next'
                },
                /**
                 * Text on the button to proceed to the previous example video/image
                 *
                 * @property {String} previousStimulusText
                 */
                previousStimulusText: {
                    type: 'string',
                    description: 'Text on the button to proceed to the previous example video/image',
                    default: 'Previous'
                },
                /**
                 * Text of the question to ask about whether to participate. Answer options are Yes/No; No means study will stop, Yes means it will proceed.
                 *
                 * @property {String} participationQuestion
                 */
                participationQuestion: {
                    type: 'string',
                    description: 'Text on the button to proceed to the previous example video/image',
                    default: 'Do you want to participate in this study?'
                },
                /**
                 * How many years old the child has to be for this page to be shown. If child
                 * is younger, the page is skipped. Leave at 0 to always show. This is an
                 * age in 'calendar years' - it will line up with the child's birthday,
                 * regardless of leap years etc.
                 *
                 * @property {String} minimumYearsToAssent
                 */
                minimumYearsToAssent: {
                    type: 'number',
                    description: 'How many years old the child has to be for this page to be shown',
                    default: 0
                }
            },
            required: []
        },

        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} assentFormText the exact text shown in the assent document during this frame
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @param {List} videoList a list of webcam video IDs in case there are >1
             * @param {String} childResponse The child's response to the assent question - Yes or No
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                },
                videoList: {
                    type: 'list'
                },
                assentFormText: {
                    type: 'string'
                },
                childResponse: {
                    type: 'string'
                }
            },
            required: []
        }
    },

    didInsertElement() {
        this._super(...arguments);
        this.set('assentFormText', $('#consent-form-full-text').text());

        var hasCompletedEachPageAudio = []
        for (var iPage = 0; iPage < this.get('pages_parsed').length; iPage++) {
            hasCompletedEachPageAudio[iPage] = !this.get('pages_parsed')[iPage].audio; // count as completed if no audio
        }
        this.set('hasCompletedEachPageAudio', hasCompletedEachPageAudio);

        if (this.get('pages_parsed')[0].audio) { // start audio
            this.playAudio($('audio#assent-audio')[0]);
        }

        if (this.get('session').get('child')) { // always show in preview mode
            var dob = this.get('session').get('child').get('birthday');

            // var ageInDays = ((new Date()) - dob)/(1000*60*60*24);
            // Calculate age in full years (i.e., will line up with how many years old the
            // child is considered, will not vary based on whether some of those years have been
            // leap years)
            var today = new Date();
            var beforeBirthday = 0;
            if (today.getMonth() < dob.getMonth() || ((today.getMonth() == dob.getMonth()) && today.getDate() < dob.getDate())) {
                beforeBirthday = 1;
            }
            var ageInYears = today.getFullYear() - dob.getFullYear() - beforeBirthday;

            if (this.get('minimumYearsToAssent') && ageInYears < this.get('minimumYearsToAssent')) {
                /**
                 * Skip the assent form because the participant is too young to give assent
                 *
                 * @event skipAssentDueToParticipantAge
                 */
                this.send('setTimeEvent', 'skipAssentDueToParticipantAge');
                this.send('next');
            }
        }
    }

});
