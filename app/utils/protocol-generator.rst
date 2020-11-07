.. _generators:

Protocol generators
===================================

Although your study protocol JSON can be configured to handle a wide range of common condition assignment, counterbalancing, and conditional logic schemes, in some cases it may still be more natural to programmatically generate the protocol. For instance, you might want to use a protocol generator in cases of:

* Complex counterbalancing schemes: for instance, ensuring you use each image from each set exactly once for training and once for test in a preferential looking task, without repeating any pairings

* Complex stimulus/protocol generation: for instance, you want to generate a random Sudoku board and create a sequence of frames guiding the child through it

* Complex longitudinal assignment: for instance, you have three tasks to be completed between 6 and 12 months and three tasks to be completed between 18 and 24 months, and want to assign children to the appropriate task based on their age and what they've already completed

What ``generateProtocol`` should return
----------------------------------------

Your protocol generator should return a single object with fields "frames" and "sequence" - exactly like the protocol specification JSON. In fact, JSON is valid Javascript: you can copy and paste your protocol specification right into the generator function to get started!


What information it has access to
----------------------------------------

The ``generateProtocol`` function receives two arguments, ``child`` and ``pastSessions``.

The ``child`` and the elements of the array ``pastSessions`` are Ember objects and do not behave exactly like regular Javascript objects. Here

``child`` is an Ember object representing the child currently participating in this study. You can access the following fields using ``child.get(<fieldName>)``, e.g. ``child.get('givenName')``:

  * givenName (string)
  * birthday (Date)
  * gender (string, 'm' / 'f' / 'o')
  * ageAtBirth (string, e.g. '25 weeks'. One of '40 or more weeks', '39 weeks' through '24 weeks', 'Under 24 weeks', or 'Not sure or prefer not to answer')
  * additionalInformation (string) freeform "anything else we should know" field on child registration
  * languageList (string) space-separated list of languages child is exposed to (2-letter codes)
  * conditionList (string) space-separated list of conditions/characteristics of child from registration form, as used in criteria expression - e.g. "autism_spectrum_disorder deaf multiple_birth"

``pastSessions`` is an array of Ember objects representing past sessions for this child and this study, in reverse time order: pastSessions[0] is THIS session, pastSessions[1] the previous sessions, and so on. Each session has the following fields, corresponding to information available for download on Lookit, which can be accessed as ``pastSessions[i].get(<fieldName>)``:

   * createdOn (Date)
   * conditions
   * expData
   * sequence
   * completed
   * globalEventTimings
   * completedConsentFrame (note - this list will include even "responses") where the user did not complete the consent form!
   * demographicSnapshot
   * isPreview

Empty template
-------------------

Here is the default value for the protocol generator - an empty template with comments explaining what the arguments are.

.. code:: javascript

    function generateProtocol(child, pastSessions) {
        /*
         * Generate the protocol for this study.
         *
         * @param {Object} child
         *    The child currently participating in this study. Includes fields:
         *      givenName (string)
         *      birthday (Date)
         *      gender (string, 'm' / 'f' / 'o')
         *      ageAtBirth (string, e.g. '25 weeks'. One of '40 or more weeks',
         *          '39 weeks' through '24 weeks', 'Under 24 weeks', or
         *          'Not sure or prefer not to answer')
         *      additionalInformation (string)
         *      languageList (string) space-separated list of languages child is
         *          exposed to (2-letter codes)
         *      conditionList (string) space-separated list of conditions/characteristics
         *          of child from registration form, as used in criteria expression
         *          - e.g. "autism_spectrum_disorder deaf multiple_birth"
         *
         *      Use child.get to access these fields: e.g., child.get('givenName') returns
         *      the child's given name.
         *
         * @param {!Array<Object>} pastSessions
         *     List of past sessions for this child and this study, in reverse time order:
         *     pastSessions[0] is THIS session, pastSessions[1] the previous session,
         *     back to pastSessions[pastSessions.length - 1] which has the very first
         *     session.
         *
         *     Each session has the following fields, corresponding to values available
         *     in Lookit:
         *
         *     createdOn (Date)
         *     conditions
         *     expData
         *     sequence
         *     completed
         *     globalEventTimings
         *     completedConsentFrame (note - this list will include even "responses")
         *          where the user did not complete the consent form!
         *     demographicSnapshot
         *     isPreview
         *
         * @return {Object} Protocol specification for Lookit study; object with 'frames'
         *    and 'sequence' keys.
         */

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: {},
            sequence: []
        };
    }


Examples
-----------

Returning different protocols based on age
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is a simple "study" where the protocol returned is different depending on the child's age:

.. code:: javascript

    function generateProtocol(child, pastSessions) {

        let one_day = 1000 * 60 * 60 * 24; // ms in one day
        let child_age_in_days = -1;
        try {
            child_age_in_days = (new Date() - child.get('birthday')) / one_day;
        } catch (error) {
            // Display what the error was for debugging, but continue with fake
            // age in case we can't calculate age for some reason
            console.error(error);
        }
        child_age_in_days = child_age_in_days || -1; // If undefined/null, set to default

        // Define frames that will be used for both the baby and toddler versions of the study
        let frames = {
            "video-config": {
                "kind": "exp-video-config",
                "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to email the XYZ lab at xyz@abc.edu and we'd be glad to help out!"
            },
            "video-consent": {
                "kind": "exp-lookit-video-consent",
                "PIName": "Jane Smith",
                "datause": "We are primarily interested in your child's emotional reactions to the images and sounds. A research assistant will watch your video to measure the precise amount of delight in your child's face as he or she sees each cat picture.",
                "payment": "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience.",
                "purpose": "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails.",
                "PIContact": "Jane Smith at 123 456 7890",
                "procedures": "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating.",
                "institution": "Science University"
            },
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "text": "Here is where you would enter debriefing information for the family. This is a chance to explain the purpose of your study and how the family helped. At this point it's more obvious to the participant that skimming the info is fine if they're not super-interested, so you can elaborate in ways you might have avoided ahead of time in the interest of keeping instructions short. You may want to mention the various conditions kids were assigned to if you didn't before, and try to head off any concerns parents might have about how their child 'did' on the study, especially if there are 'correct' answers that will have been obvious to a parent. <br><br> It is great if you can link people to a layperson-accessible article on a related topic - e.g., media coverage of one of your previous studies in this research program, a talk on Youtube, a parenting resource. <br><br> If you are compensating participants, restate what the compensation is (and any conditions, and let them know when to expect their payment! E.g.: To thank you for your participation, we'll be emailing you a $4 Amazon gift card - this should arrive in your inbox within the next week after we confirm your consent video and check that your child is in the age range for this study. (If you don't hear from us by then, feel free to reach out!) If you participate again with another child in the age range, you'll receive one gift card per child.",
                    "title": "Thank you!"
                }
            }
        }

        // Add a "test frame" that's different depending on the child's age.
        // You could actually be defining whole separate protocols here (e.g. for
        // a longitudinal study with a bunch of timepoints), using different stimuli
        // in the same frames, just customizing instructions, etc.

        // If the age is -1 because there was some error, they'll get the baby version.
        if (child_age_in_days <= 365) {
            frames["test-frame"] = {
                "kind": "exp-lookit-instructions",
                "blocks": [
                    {
                        "title": "[Example text for BABY version of study]",
                        "listblocks": [
                            {
                                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                            },
                            {
                                "text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                            }
                        ]
                    }
                ],
                "showWebcam": false,
                "nextButtonText": "Finish up"
            };
        } else {
            frames["test-frame"] = {
                "kind": "exp-lookit-instructions",
                "blocks": [
                    {
                        "title": "[Example text for TODDLER version of study]",
                        "listblocks": [
                            {
                                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                            },
                            {
                                "text": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                            }
                        ]
                    }
                ],
                "showWebcam": false,
                "nextButtonText": "Finish up"
            }
        }

        // Sequence of frames is the same in both cases, the 'test-frame' will just
        // be differently defined base on age.
        let frame_sequence = ['video-config', 'video-consent', 'test-frame', 'exit-survey']

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: frames,
            sequence: frame_sequence
        };
    }


Alternating question types each session
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is an example of using information in ``pastSessions`` to determine the protocol for this session. In this case, we just look at what the child did last, and switch to the opposite trial type for this time. (Note that this could also be done using the ``conditionForAdditionalSessions`` parameter of the ``random-parameter-set`` randomizer; however, more complex longitudinal designs may benefit from programmatic specification.)

.. code:: javascript

    function generateProtocol(child, pastSessions) {

        // Assign condition randomly as fallback/initial value. This will be true/false
        // with equal probability.
        let is_happy_condition = Math.random() > 0.5;

        try {
            // First, find the most recent session where the participant got to the point
            // of the "test trial"
            var mostRecentSession = pastSessions.find(
                sess => Object.keys(sess.get('expData', {})).some(frId => frId.endsWith('-match-emotion')));
            // If there is such a session, find out what condition they were in that time
            // and flip it
            if (mostRecentSession) {
                let expData = mostRecentSession.get('expData', {});
                let frameKey = Object.keys(expData).find(frId => frId.endsWith('-match-emotion'));
                // Flip condition from last time: do happy condition this time if last
                // time 'happy' was NOT in the *-match-emotion frame ID
                is_happy_condition = !(frameKey.includes('happy'));
            }
        } catch (error) {
            // Just in case - wrap the above in a try block so we fall back to
            // random assignment if something is weird about the pastSessions data
            console.error(error);
        }


        // Define all possible frames that might be used
        let frames = {
            "intro": {
                "blocks": [{
                        "text": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
                        "title": "[Introduction frame]"
                    },
                    {
                        "text": "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
                    },
                    {
                        "text": "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
                    }
                ],
                "showPreviousButton": false,
                "kind": "exp-lookit-text"
            },
            "happy-match-emotion": {
                "kind": "exp-lookit-images-audio",
                "audio": "matchremy",
                "images": [{
                        "id": "cue",
                        "src": "happy_remy.jpg",
                        "position": "center",
                        "nonChoiceOption": true
                    },
                    {
                        "id": "option1",
                        "src": "happy_zenna.jpg",
                        "position": "left",
                        "displayDelayMs": 2000
                    },
                    {
                        "id": "option2",
                        "src": "annoyed_zenna.jpg",
                        "position": "right",
                        "displayDelayMs": 2000
                    }
                ],
                "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
                "autoProceed": false,
                "doRecording": false,
                "choiceRequired": true,
                "parentTextBlock": {
                    "text": "Some explanatory text for parents",
                    "title": "For parents"
                },
                "canMakeChoiceBeforeAudioFinished": true
            },
            "sad-match-emotion": {
                "kind": "exp-lookit-images-audio",
                "audio": "matchzenna",
                "images": [{
                        "id": "cue",
                        "src": "sad_zenna.jpg",
                        "position": "center",
                        "nonChoiceOption": true
                    },
                    {
                        "id": "option1",
                        "src": "surprised_remy.jpg",
                        "position": "left",
                        "feedbackAudio": "negativefeedback",
                        "displayDelayMs": 3500
                    },
                    {
                        "id": "option2",
                        "src": "sad_remy.jpg",
                        "correct": true,
                        "position": "right",
                        "displayDelayMs": 3500
                    }
                ],
                "baseDir": "https://www.mit.edu/~kimscott/placeholderstimuli/",
                "autoProceed": false,
                "doRecording": false,
                "choiceRequired": true,
                "parentTextBlock": {
                    "text": "Some explanatory text for parents",
                    "title": "For parents"
                },
                "canMakeChoiceBeforeAudioFinished": true
            },
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "text": "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. <br> <br> Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. <br> <br> Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
                    "title": "Thank you!"
                }
            }
        }

        // Construct the sequence based on the condition.
        let frame_sequence = [
            'intro',
            is_happy_condition ? "happy-match-emotion" : "sad-match-emotion",
            'exit-survey'
        ]

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: frames,
            sequence: frame_sequence
        };
    }


Randomizing but preventing re-use of stimuli across trials
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is an example of a counterbalancing structure that benefits from being able to programmatically describe the study protocol.

On each test trial, the infant sees two images, one on the right and one on the left, from two different categories. Audio matching one of the two categories is played. There are three categories: "adorable," "delicious," and "exciting." The infant should see each possible pairing of categories twice, once with audio matching each category. This makes six trials (adorable-delicious, adorable-exciting, delicious-exciting x 2 audio choices each). There are four images for each category. Each should be used exactly once during the study. The left/right placement of the images should be determined randomly.

.. code:: javascript

    function generateProtocol(child, pastSessions) {

        // -------- Helper functions ----------------------------------------------

        // See http://stackoverflow.com/a/12646864
        // Returns a new array with elements of the array in random order.
        function shuffle(array) {
            var shuffled = Ember.$.extend(true, [], array); // deep copy array
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = temp;
            }
            return shuffled;
        }

        // Returns a random element of an array, and removes that element from the array
        function pop_random(array) {
            var randIndex = Math.floor(Math.random() * array.length);
            if (array.length) {
                return array.pop(randIndex);
            }
            return null
        }

        // -------- End helper functions -------------------------------------------

        // Define common (non-test-trial) frames
        let frames = {
            "video-config": {
                "kind": "exp-video-config",
                "troubleshootingIntro": "If you're having any trouble getting your webcam set up, please feel free to email the XYZ lab at xyz@abc.edu and we'd be glad to help out!"
            },
            "video-consent": {
                "kind": "exp-lookit-video-consent",
                "PIName": "Jane Smith",
                "datause": "We are primarily interested in your child's emotional reactions to the images and sounds. A research assistant will watch your video to measure the precise amount of delight in your child's face as he or she sees each cat picture.",
                "payment": "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience.",
                "purpose": "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails.",
                "PIContact": "Jane Smith at 123 456 7890",
                "procedures": "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating.",
                "institution": "Science University"
            },
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "text": "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. <br> <br> Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. <br> <br> Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
                    "title": "Thank you!"
                }
            }
        }

        // Start off the frame sequence with config/consent frames; we'll add test
        // trials as we construct them
        let frame_sequence = ['video-config', 'video-consent']

        // start at a random point in this list and cycle through across trials.
        // each element is a list: category1, category2, audio.
        // category1 and category2 match up to keys in available_images; audio
        // should be filenames in baseDir/mp3
        let all_category_pairings = [
            [
                "adorable",
                "delicious",
                "Adorable"
            ],
            [
                "adorable",
                "delicious",
                "Delicious"
            ],
            [
                "delicious",
                "exciting",
                "Delicious"
            ],
            [
                "delicious",
                "exciting",
                "Exciting"
            ],
            [
                "adorable",
                "exciting",
                "Adorable"
            ],
            [
                "adorable",
                "exciting",
                "Exciting"
            ]
        ]

        // Every image is just used once total, either as a target or as a distractor.
        // We'll remove the images from these lists as they get used.
        let available_images = {
            "adorable": [
                "Adorable_1.png",
                "Adorable_2.png",
                "Adorable_3.png",
                "Adorable_4.png"
            ],
            "delicious": [
                "Delicious_1.png",
                "Delicious_2.png",
                "Delicious_3.png",
                "Delicious_4.png"
            ],
            "exciting": [
                "Exciting_1.png",
                "Exciting_2.png",
                "Exciting_3.png",
                "Exciting_4.png"
            ]
        }

        // Make a deep copy of the original available images, in case we run out
        // (e.g. after adding additional trials) and need to "refill" a category.
        let all_images = Ember.$.extend(true, {}, available_images)

        // Choose a random starting point and order for the category pairings
        let ordered_category_pairings = shuffle(all_category_pairings)

        for (iTrial = 0; iTrial < 6; iTrial++) {

            let category_pairing = ordered_category_pairings[iTrial]
            let category_id_1 = category_pairing[0]
            let category_id_2 = category_pairing[1]
            let audio = category_pairing[2]

            // "Refill" available images if empty
            if (!available_images[category_id_1].length) {
                available_images[category_id_1] = all_images[category_id_1]
            }
            if (!available_images[category_id_2].length) {
                available_images[category_id_2] = all_images[category_id_2]
            }

            let image1 = pop_random(available_images[category_id_1])
            let image2 = pop_random(available_images[category_id_2])

            let left_right_pairing = shuffle(["left", "right"])

            thisTrial = {
                "kind": "exp-lookit-images-audio",
                "audio": audio,
                "images": [{
                        "id": "option1-test",
                        "src": image1,
                        "position": left_right_pairing[0]
                    },
                    {
                        "id": "option2-test",
                        "src": image2,
                        "position": left_right_pairing[1]
                    }
                ],
                "baseDir": "https://raw.githubusercontent.com/schang198/lookit-stimuli-template/master/",
                "pageColor": "gray",
                "audioTypes": [
                    "mp3"
                ],
                "autoProceed": true
            }

            // Store this frame in frames and in the sequence
            frameId = 'test-trial-' + (iTrial + 1)
            frames[frameId] = thisTrial;
            frame_sequence.push(frameId);
        }

        // Finish up the frame sequence with the exit survey
        frame_sequence = frame_sequence.concat(['exit-survey'])

        // Return a study protocol with "frames" and "sequence" fields just like when
        // defining the protocol in JSON only
        return {
            frames: frames,
            sequence: frame_sequence
        };
    }


Customizing text based on the child's gender
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is a snippet showing how you might generate text to use in a study to match the child's gender:

.. code:: javascript

    let gender = child.get('gender');
    let _KID = 'kid';
    let _THEY = 'they';
    let _THEIR = 'their';
    let _THEIRS = 'theirs';
    let _THEM = 'them';

    if (gender == 'f') {
        _KID = 'girl';
        _THEY = 'she';
        _THEIR = 'her';
        _THEIRS = 'hers';
        _THEM = 'her';
    } else if (gender == 'm') {
        _KID = 'boy';
        _THEY = 'he';
        _THEIR = 'his';
        _THEIRS = 'his';
        _THEM = 'him';
    }

    let storyText = `Once upon a time there was a ${_KID} named
        Jamie. Jamie liked going to the lake with ${_THEIR} family.
        One day, ${_THEY} decided to try to swim all the way across.`


Accessing child's languages
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is a snippet showing how you might access information in the child's ``languageList``:

.. code:: javascript

    // child.get('languageList') returns a string like 'en' or 'en my';
    // transform to a list of two-letter codes like ['en'] or ['en', 'my']
    let languageList = child.get('languageList').split(' ');
    if (!languageList.length) {
        // Empty list of languages - no language data stored, possibly because
        // family registered before this was included in the child form.
        // Depending on study might include language survey in this case.
    } else if (languageList.includes('es')) {
        // Child hears at least Spanish
    } else {
        // Child has language data but is not exposed to Spanish
    }

Accessing child's conditions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is a snippet showing how you might access information in the child's ``conditionList``:

.. code:: javascript

    let conditionList = child.get('conditionList').split(' ');
    if (conditionList.includes('autism_spectrum_disorder')) {
        // child identified as having ASD
    } else {
        // otherwise...
    }
