import { module, test, skip } from 'qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import {render, click, waitFor, settled, fillIn, findAll} from '@ember/test-helpers';

// See https://dockyard.com/blog/2018/01/11/modern-ember-testing for transition to newer
// style of integration (template) testing

// To make it easier to make use of the parent component's actions, which are used when moving between frames,
// we primarily test frame components within the context of the exp-player component.

const RENDER_DELAY_MS = 500;
let short_delay = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, RENDER_DELAY_MS);
});

module('exp-player', function(hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function() {
        let study = {
            id: '12345',
            name: 'My Study',
            structure:{
                frames: {},
                sequence: []
            }
        };
        this.set('study', study);
        let pastResponses = Ember.A([1,2,3]);
        let save = function() {
            return new Promise( (resolve, reject) => {
                resolve();
            });
        };
        let response = Ember.Object.create({
            id: 'abcde',
            conditions: [],
            expData: {},
            sequence: [],
            completed: false,
            study: study,
            save: save,
            pastSessions: pastResponses
        });
        // Note: the values study, response, pastResponses are loaded from the object this, not from the context here
        // - so need to explicitly set them

        this.set('response', response);
        this.set('pastResponses', pastResponses);
    });

    test('exp-player renders an exp-lookit-mood-questionnaire frame', async function(assert) {
        let study = {
            id: '12345',
            name: 'My Study',
            structure:{
                frames: {
                   "mood-survey": {
                       "introText": "How are you two doing?",
                       "id": "mood-survey",
                       "kind": "exp-lookit-mood-questionnaire"
                   }
                },
                sequence: ['mood-survey']
            }
        };
        this.set('study', study);

        await render(hbs`{{exp-player
            experiment=study
            session=response
            pastSessions=pastResponses
            frameIndex=0
            fullScreenElementId='expContainer'
        }}`);

        assert.equal(this.$('h4')[0].innerText, 'Mood Questionnaire');

    });

    test('exp-player renders a functioning exp-lookit-survey frame', async function(assert) {
        let study = {
            id: '12345',
            name: 'My Study',
            structure:{
                frames: {
                    "survey": {
                        "kind": "exp-lookit-survey",
                        "formSchema": {
                            "schema": {
                                "type": "object",
                                "title": "Tell us about your pet!",
                                "properties": {
                                    "age": {
                                        "type": "integer",
                                        "title": "Age",
                                        "maximum": 200,
                                        "minimum": 0,
                                        "required": true
                                    },
                                    "name": {
                                        "type": "string",
                                        "title": "Name",
                                        "required": true
                                    },
                                    "species": {
                                        "enum": [
                                            "dog",
                                            "cat",
                                            "fish",
                                            "bird",
                                            "raccoon"
                                        ],
                                        "type": "string",
                                        "title": "What type of animal?",
                                        "default": ""
                                    }
                                }
                            },
                            "options": {
                                "fields": {
                                    "age": {
                                        "numericEntry": true
                                    },
                                    "name": {
                                        "placeholder": "a name..."
                                    },
                                    "species": {
                                        "type": "radio",
                                        "message": "Seriously, what species??",
                                        "validator": "required-field",
                                        "removeDefaultNone": true,
                                        "sort": false
                                    }
                                }
                            }
                        },
                        "nextButtonText": "Moving on",
                        "showPreviousButton": true
                    },
                    "text": {
                        "kind": "exp-lookit-text",
                        "blocks": [
                            {
                                "text": "Final page"
                            }
                        ]
                    }
                },
                sequence: ['survey', 'text']
            }
        };
        this.set('study', study);

        await render(hbs`{{exp-player
            experiment=study
            session=response
            pastSessions=pastResponses
            frameIndex=0
            fullScreenElementId='experiment-player'
        }}`);

        // After awaiting render, only the title and next/previous buttons are actually rendered - need more time for
        // questions to actually render.
        await waitFor('.alpaca-field-text');
        assert.equal(this.element.querySelector('legend').textContent.trim(), 'Tell us about your pet!', 'Title of survey rendered');
        assert.equal(this.element.querySelector('button#nextbutton').textContent.trim(), 'Moving on', 'Custom next button text rendered');
        assert.equal(this.element.querySelector('button.pull-left').textContent.trim(), 'Previous', 'Previous button displayed');

        // Quickly check that question titles and options are rendered appropriately, no validation text shown, and
        // no 'none' option shown.
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'Tellusaboutyourpet!AgeNameWhattypeofanimal?dogcatfishbirdraccoonPreviousMovingon', 'Correct text rendered on survey page');

        // Check that removeDefaultNone option is respected
        study.structure.frames.survey.formSchema.options.fields.species.removeDefaultNone = false;
        await render(hbs`{{exp-player
            experiment=study
            session=response
            pastSessions=pastResponses
            frameIndex=0
            fullScreenElementId='experiment-player'
        }}`);
        await waitFor('.alpaca-field-text');
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'Tellusaboutyourpet!AgeNameWhattypeofanimal?NonedogcatfishbirdraccoonPreviousMovingon', 'None option displayed unless explicitly removed');

        // Input values for 2/3 required questions and try to move on; check that we see validation message
        await fillIn('.alpaca-field-text input', 'Fido');
        await fillIn('.alpaca-field-integer input', '12');

        // Without short delay - not just settled(), not anything that's apparently not rendered yet - clicking Next
        // doesn't trigger the validation message to be displayed. I don't know why but this is not something users
        // will run into, so just adding the delay for now.
        await short_delay();
        await click('#nextbutton');
        await short_delay();
        assert.ok(this.element.textContent.includes('Seriously, what species??'), 'Validation message displayed when needed');

        // Now input value for final question and check validation disappears
        await click('.radio.alpaca-control input[value="dog"]');
        await settled();
        assert.notOk(this.element.textContent.includes('Seriously, what species??'), 'Validation message not displayed when not needed');

        // Check that we move on
        await click('#nextbutton');
        await waitFor('.exp-text');
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'FinalpagePreviousNext', 'Following frame is displayed after proceeding');

        // Check what data is saved
        let expData = this.response.expData;
        assert.ok(expData.hasOwnProperty('0-survey'), 'expData has expected key for the survey frame');
        let frameData = expData['0-survey'];
        assert.deepEqual(frameData.formData, {
                "age": 12,
                "name": "Fido",
                "species": "dog"
            }, 'Expected form data saved');
        assert.equal(frameData.formSchema.schema.title, 'Tell us about your pet!', 'Expected form schema title saved');
        assert.deepEqual(Object.keys(frameData.formSchema.schema.properties), ['age', 'name', 'species'], 'Expected form schema schema property keys saved');
        assert.deepEqual(Object.keys(frameData.formSchema.options.fields), ['age', 'name', 'species'], 'Expected form schema option fields keys saved');

        assert.equal(frameData.eventTimings.length, 1, 'One event saved');
        assert.equal(frameData.eventTimings[0].eventType, "exp-lookit-survey:nextFrame", 'Event saved is of type nextFrame');

        assert.equal(frameData.frameType, "DEFAULT", "Type of frame saved is DEFAULT");
        assert.ok(frameData.hasOwnProperty('frameDuration'), 'Frame duration saved');

        await settled();

// TODO: navigate forward/backward from a survey frame and check that answers are preserved


        });

    test('exp-player renders a functioning exp-lookit-consent-survey frame', async function(assert) {
        let study = {
            id: '12345',
            name: 'My Study',
            structure:{
                frames: {
                    "survey-consent": {
                        "kind": "exp-lookit-survey-consent",
                        "title": "Informed Consent Form for Caregivers of Minors (Under 18) \n TITLE OF STUDY",
                        "formValidationText": "Form is not complete",
                        "checkboxValidationText": "Please check this item",
                        "multipleChoiceValidationText": "Please answer this question",
                        "items": [
                            {
                                "kind": "text-block",
                                "text": "There are four sections in this form. Each section contains a number of statements. In order to participate in this study, questions must be answered with ‘yes’ unless otherwise specified. Please contact the lead researcher (CONTACT INFO) if you have any questions regarding this form."
                            },
                            {
                                "kind": "text-block",
                                "title": "General"
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I confirm I have read and understood the Information Sheet for the above-named study. The information has been fully explained to me and I have been able to contact the researchers with enquiries.",
                                "label": "read_sheet"

                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I understand that participation in this study is entirely voluntary, and if I decide that I do not want my child to take part, they can stop taking part in this study at any time without giving a reason.",
                                "label": "volun+*^ta&ry"
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I understand that I will be receiving a small remuneration of €XXX for participation in this study."
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I know how to contact the research team if I need to.",
                                "label": 4
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I agree to take part in this research study with my child having been fully informed of the risks, benefits and alternatives which are set out in full in the information leaflet which I have been provided with.",
                                "label": "read_sheet"
                            },
                            {
                                "kind": "text-block",
                                "title": "Data processing"
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I give my permission for my data to be used in line with the aims of the research study, as outlined in the information sheet."
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I understand that results from analysis of my child’s personal information will not be given to me."
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I understand that, under the Freedom of Information Act (2014) and GDPR, I can have access to any identifiable information the study team stores about me, if requested."
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I understand that I can withdraw my permission to take part in this study at any time up until the data are anonymised and combined for analysis [Date to be determined], without giving a reason. I understand that in this case, the researchers will delete all information related to me and I will be removed from the study."
                            },
                            {
                                "kind": "checkbox-item",
                                "text": "I understand that confidentiality may be breached in circumstances in which: <ol><li>The research team has a strong belief or evidence exists that there is a serious risk of harm or danger to either the participant or another individual.  </li><li>Disclosure is required as part of a legal process or Garda investigation.</li></ol>"
                            },
                            {
                                "kind": "multiple-choice",
                                "question": "PUBLIC DATABASE: I give permission for my personal data, in the form of webcam recordings to be shared with the scientific community and the general public via a fully open database on the internet. <b>Agreeing to publicly sharing your data is NOT required for participation in this study.</b>",
                                "answers": [
                                    "Yes",
                                    "No"
                                ],
                                "label": "public_database"
                            }
                        ]
                    },
                    "text": {
                        "kind": "exp-lookit-text",
                        "blocks": [
                            {
                                "text": "Final page"
                            }
                        ]
                    }
                },
                sequence: ['survey-consent', 'text']
            }
        };
        this.set('study', study);

        await render(hbs`{{exp-player
            experiment=study
            session=response
            pastSessions=pastResponses
            frameIndex=0
            fullScreenElementId='experiment-player'
        }}`);

        // After awaiting render, only the title and next/previous buttons are actually rendered - need more time for
        // questions to actually render.
        await waitFor('p.title');
        assert.equal(this.element.querySelector('p.title').textContent.trim(), 'Informed Consent Form for Caregivers of Minors (Under 18)  TITLE OF STUDY', 'Title of consent survey rendered');
        assert.equal(this.element.querySelector('button#nextbutton').textContent.trim(), 'Submit', 'Custom next button text rendered');
        assert.equal(this.element.querySelector('button.pull-left').textContent.trim(), 'Previous', 'Previous button displayed');

        // Quickly check that all text and questions are displayed correctly
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'InformedConsentFormforCaregiversofMinors(Under18)' +
            'TITLEOFSTUDYTherearefoursectionsinthisform.Eachsectioncontainsanumberofstatements.Inordertoparticipatein' +
            'thisstudy,questionsmustbeansweredwith‘yes’unlessotherwisespecified.Pleasecontacttheleadresearcher(CONTAC' +
            'TINFO)ifyouhaveanyquestionsregardingthisform.GeneralIconfirmIhavereadandunderstoodtheInformationSheetfor' +
            'theabove-namedstudy.TheinformationhasbeenfullyexplainedtomeandIhavebeenabletocontacttheresearcherswithen' +
            'quiries.Iunderstandthatparticipationinthisstudyisentirelyvoluntary,andifIdecidethatIdonotwantmychildtota' +
            'kepart,theycanstoptakingpartinthisstudyatanytimewithoutgivingareason.IunderstandthatIwillbereceivingasma' +
            'llremunerationof€XXXforparticipationinthisstudy.IknowhowtocontacttheresearchteamifIneedto.Iagreetotakepa' +
            'rtinthisresearchstudywithmychildhavingbeenfullyinformedoftherisks,benefitsandalternativeswhicharesetouti' +
            'nfullintheinformationleafletwhichIhavebeenprovidedwith.DataprocessingIgivemypermissionformydatatobeusedi' +
            'nlinewiththeaimsoftheresearchstudy,asoutlinedintheinformationsheet.Iunderstandthatresultsfromanalysisofm' +
            'ychild’spersonalinformationwillnotbegiventome.Iunderstandthat,undertheFreedomofInformationAct(2014)andGD' +
            'PR,Icanhaveaccesstoanyidentifiableinformationthestudyteamstoresaboutme,ifrequested.IunderstandthatIcanwi' +
            'thdrawmypermissiontotakepartinthisstudyatanytimeupuntilthedataareanonymisedandcombinedforanalysis[Dateto' +
            'bedetermined],withoutgivingareason.Iunderstandthatinthiscase,theresearcherswilldeleteallinformationrelat' +
            'edtomeandIwillberemovedfromthestudy.Iunderstandthatconfidentialitymaybebreachedincircumstancesinwhich:Th' +
            'eresearchteamhasastrongbelieforevidenceexiststhatthereisaseriousriskofharmordangertoeithertheparticipant' +
            'oranotherindividual.DisclosureisrequiredaspartofalegalprocessorGardainvestigation.PUBLICDATABASE:Igivepe' +
            'rmissionformypersonaldata,intheformofwebcamrecordingstobesharedwiththescientificcommunityandthegeneralpu' +
            'blicviaafullyopendatabaseontheinternet.AgreeingtopubliclysharingyourdataisNOTrequiredforparticipationint' +
            'hisstudy.YesNoPreviousSubmit', 'Correct text rendered on survey page');

        // Input values for most but not all checkboxes & no MC question
        let checkboxes = findAll('.checkbox-container input');
        let nOmittedAnswers = 2;
        for (let i = nOmittedAnswers; i<checkboxes.length; i++) {
            await click(checkboxes[i]);
        }

        // Without short delay - not just settled(), not anything that's apparently not rendered yet - clicking Next
        // doesn't trigger the validation message to be displayed. I don't know why but this is not something users
        // will run into, so just adding the delay for now.
        await click('#nextbutton');
        await settled();
        let formText = this.get('study').structure.frames['survey-consent'].formValidationText;
        let checkboxText = this.get('study').structure.frames['survey-consent'].checkboxValidationText;
        let mcText = this.get('study').structure.frames['survey-consent'].multipleChoiceValidationText;
        assert.ok(this.element.textContent.includes(formText), 'Validation message displayed when not all questions filled out');
        assert.equal((this.element.textContent.match(new RegExp(checkboxText, 'g'))).length, nOmittedAnswers, 'Checkbox validation text displayed for checkbox questions not filled out');
        assert.equal((this.element.textContent.match(new RegExp(mcText, 'g'))).length, 1, 'Multiple-choice validation text displayed upon submission without MC question filled out');

        // Input a value for each of the checkbox questions and MC question, and check validation text disappears from each without hitting submit
        await click(checkboxes[nOmittedAnswers-1]);
        assert.equal((this.element.textContent.match(new RegExp(checkboxText, 'g'))).length, nOmittedAnswers-1, '1 checkbox validation text removed immediately upon filling out');
        for (let i = 0; i<nOmittedAnswers-1; i++) {
            await click(checkboxes[i]);
        }
        assert.notOk(this.element.textContent.includes(checkboxText), 'Last checkbox validation text removed immediately upon filling out');
        assert.ok(this.element.textContent.includes(mcText), 'Multiple-choice validation text not removed when checkbox questions completed');

        // Check we can't proceed with single checkbox missing
        await click(checkboxes[0]); // click again to unselect
        await click('#nextbutton');
        await settled();
        assert.ok(this.element.textContent.includes(formText), 'Validation message displayed when not all questions filled out');

        // Check we can't proceed with single mc question missing
        await click(checkboxes[0]); // now selected
        await click('#nextbutton');
        await settled();
        assert.ok(this.element.textContent.includes(formText), 'Validation message displayed when not all questions filled out');

        // Now complete form and check we can move on and save appropriate data
        await fillIn(`input[name=answer_public_database]`, 'Yes');
        assert.notOk(this.element.textContent.includes(mcText), 'Multiple-choice validation text not displayed once MC question filled out');
        await click('#nextbutton');
        await waitFor('.exp-text');
        assert.equal(this.element.textContent.replace(/\s+/g, ''), 'FinalpagePreviousNext', 'Following frame is displayed after proceeding');

        // Check what data is saved
        let expData = this.response.expData;
        assert.ok(expData.hasOwnProperty('0-survey-consent'), 'expData has expected key for the survey frame');
        let frameData = expData['0-survey-consent'];
        assert.equal(frameData.frameType, 'CONSENT', 'Frame data stores type consent');

        // The labels in the protocol include duplicates (read_sheet), a numeric index corresponding to an item without
        // an explicit label, and a label with invalid characters that should be removed (volun+*^ta&ry).
        let expectedData = [
            ['answer_10', true],
            ['answer_11', true],
            ['answer_12', true],
            ['answer_4', true],
            ['answer_4_1', true],
            ['answer_8', true],
            ['answer_9', true],
            ['answer_public_database', 'Yes'],
            ['answer_read_sheet', true],
            ['answer_read_sheet_1', true],
            ['answer_voluntary', true]
        ];
        expectedData.forEach(item => {
           assert.equal(frameData[item[0]], item[1], `Frame data stores expected property ${item[0]}, appropriately removing special characters and handling duplicates if necessary`);
        });

        assert.equal(frameData.eventTimings.length, 1, 'One event saved');
        assert.equal(frameData.eventTimings[0].eventType, "exp-lookit-survey-consent:nextFrame", 'Event saved is of type nextFrame');

        assert.ok(frameData.hasOwnProperty('frameDuration'), 'Frame duration saved');

        await settled();

    });



});


