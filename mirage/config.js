export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/

  */
  this.namespace = '/api';
  this.patch('/responses/67890', function() {
      return {
          "data": {
            "id": "67890",
            "type": "response",
            "attributes": {
              "feedback": "",
              "conditions": {

              },
              "global-event-timings": [

              ],
              "exp-data": {
                "0-0-mood-survey": {
                  "active": "1",
                  "lastEat": "18:00",
                  "ontopofstuff": "1",
                  "napWakeUp": "14:00",
                  "rested": "1",
                  "nextNap": "14:00",
                  "usualNapSchedule": "yes",
                  "parentHappy": "1",
                  "doingBefore": "sdf",
                  "healthy": "1",
                  "childHappy": "1",
                  "energetic": "1",
                  "eventTimings": [
                    {
                      "timestamp": "2017-05-17T17:22:57.535Z",
                      "eventType": "nextFrame"
                    }
                  ]
                },
                "1-1-exit-survey": {
                  "useOfMedia": "private",
                  "idealSessionsCompleted": 2,
                  "birthDate": "2017-05-09T04:00:00.000Z",
                  "databraryShare": "no",
                  "idealDaysSessionsCompleted": 7,
                  "feedback": "",
                  "withdrawal": false,
                  "eventTimings": [

                  ]
                }
              },
              "sequence": [
                "0-0-mood-survey",
                "1-1-exit-survey"
              ],
              "extra": {

              },
              "completed": false
            },
            "relationships": {
              "study": {
                "links": {
                  "self": "\/responses\/67890\/relationships\/study",
                  "related": "\/responses\/67890\/study"
                }
              },
              "user": {
                "links": {
                  "self": "\/responses\/67890\/relationships\/user",
                  "related": "\/responses\/67890\/user"
                }
              },
              "profile": {
                "links": {
                  "self": "\/responses\/67890\/relationships\/profile",
                  "related": "\/responses\/67890\/profile"
                }
              }
            },
            "links": {
              "self": "\/response\/67890"
            }
          }
      };
  });
  this.post('/responses', function() {
      return {
        "data": {
            "id": "67890",
            "type": "response",
            "attributes": {
                "exp-data": {},
                "sequence": [],
                "feedback": "",
                "global-event-timings": [],
                "completed": false
            },
            "relationships": {
                "study": {
                  "links": {
                    "self": "/responses/67890/relationships/study",
                    "related": "/responses/67890/study"
                  }
                },
                "user": {
                  "links": {
                    "self": "/responses/67890/relationships/user",
                    "related": "/responses/67890/user"
                  }
                },
                "profile": {
                    "links": {
                        "self": "/responses/67890/relationships/profile",
                        "related": "/responses/67890/profile"
                    }
                }
            },
            "links": {
                "self": "/response/67890"
            }
        }
    };
  });
  this.get('/profiles/:profile-id', function() {
      return {
            "data": {
                "id": "fghij",
                "type": "profile",
                "attributes": {
                    "additional-information": "",
                    "age-at-birth": "40 or more weeks",
                    "gender": "female",
                    "deleted": false,
                    "birthday": "2017-01-01",
                    "first-name": "Latte"
                },
                "relationships": {
                    "user": {
                        "links": {
                            "self": "/profiles/fghij/relationships/user",
                            "related": "/profiles/fghij/user"
                        }
                    }
                },
                "links": {
                    "self": "/profiles/fghij"
                }
            }
        }
  });
  this.get('/responses', function() {
  // this.get('/responses?filter[profileId]=fghij&filter[studyId]=12345', function() {
      return {
      "data": [{
        "id": "00000",
        "type": "response",
        "attributes": {
          "study-id": "12345",
          "profile-id": "fghij",
          "feedback": "",
          "conditions": {

          },
          "global-event-timings": [

          ],
          "exp-data": {
            "0-0-mood-survey": {
              "active": "1",
              "lastEat": "18:00",
              "ontopofstuff": "1",
              "napWakeUp": "14:00",
              "rested": "0",
              "nextNap": "14:00",
              "usualNapSchedule": "yes",
              "parentHappy": "1",
              "doingBefore": "Eating ice cream",
              "healthy": "3",
              "childHappy": "5",
              "energetic": "1",
              "eventTimings": [
                {
                  "timestamp": "2017-05-17T17:22:57.535Z",
                  "eventType": "nextFrame"
                }
              ]
            },
            "1-1-exit-survey": {
              "useOfMedia": "private",
              "idealSessionsCompleted": 2,
              "birthDate": "2017-05-09T04:00:00.000Z",
              "databraryShare": "no",
              "idealDaysSessionsCompleted": 7,
              "feedback": "",
              "withdrawal": false,
              "eventTimings": [

              ]
            }
          },
          "sequence": [
            "0-0-mood-survey",
            "1-1-exit-survey"
          ],
          "extra": {

          },
          "completed": false
        },
        "relationships": {
          "study": {
            "links": {
              "self": "\/responses\/67890\/relationships\/study",
              "related": "\/responses\/67890\/study"
            }
          },
          "user": {
            "links": {
              "self": "\/responses\/67890\/relationships\/user",
              "related": "\/responses\/67890\/user"
            }
          },
          "profile": {
            "links": {
              "self": "\/responses\/67890\/relationships\/profile",
              "related": "\/responses\/67890\/profile"
            }
          }
        },
        "links": {
          "self": "\/response\/67890"
        }
      }]
    }

  });
  this.get('/users/:id', function() {
     return {
        "data": {
            "id": "abcde",
            "type": "user",
            "attributes": {
                "given-name": "Dawn",
                "middle-name": "Nutella and toast",
                "family-name": "Pattison",
                "is-active": true,
                "is-staff": true,
                "number-of-children": "1",
                "child-birthdays": [
                    "2017-01-01"
                ],
                "languages-spoken-at-home": "English",
                "number-of-guardians": "2",
                "numer-of-guardians-explanation": "",
                "race-identification": "other",
                "age": "45-59",
                "gender": "f",
                "education-level": "bach",
                "spouse-education-level": "prof",
                "annual-income": "5000",
                "number-of-books": 100000,
                "additional-comments": "My child can see through walls.",
                "country": "US",
                "state": "TN",
                "density": "suburban",
                "extra": {}
            },
            "relationships": {
                "organization": {
                  "links": {
                    "self": "/users/abcde/relationships/organization",
                    "related": "/users/abcde/organization"
                  }
                },
                "demographic-data": {
                  "links": {
                    "self": "/users/abcde/relationships/demographic-data",
                    "related": "/users/abcde/demographic-data"
                  }
                },
                "profiles": {
                    "links": {
                        "self": "/users/abcde/relationships/profiles",
                        "related": "profiles"
                    }
                }
            },
            "links": {
                "self": "/users/abcde"
            }
        }
    };
  });
  this.get('/studies/:id', function() {
      return {
        "data": {
            "id": "12345",
            "type": "study",
            "attributes": {
                "contact-info": "pattison.dawn@cos.io",
                "criteria": "Child must be at least four years old",
                "display-full-screen": true,
                "duration": "The study will take roughly 20 minutes",
                "exit-url": "https://osf.io/",
                "image": {},
                "long-description": "In each study frame, the child will be asked to guess in which box a toy will appear",
                "name": "Can Children Predict the Future?",
                "public": true,
                "short-description": "The purpose of this experiment is to see if children exhibit signs of ESP",
                "state": "active",
                "structure": {
                "frames": {
                    "exit-survey": {
                        "idealSessionsCompleted": 2,
                        "exitMessage": "Every session helps us learn about your child's growing brain. We look forward to seeing your family again! You can complete your next \"Physics\" session as soon as tomorrow.",
                        "idealDaysSessionsCompleted": 7,
                        "kind": "exp-exit-survey",
                        "title": "Post-study Survey",
                        "exitThankYou": "Thanks so much! We appreciate every family's help. No matter how your child responded, we can learn something from his or her behavior--for instance, if he or she got bored and decided to stop, we know we need to punish them!",
                        "id": "exit-survey"
                    },
                    "mood-survey": {
                        "id": "mood-survey",
                        "kind": "exp-mood-questionnaire"
                    }
                },
                "sequence": [
                    "mood-survey",
                    "exit-survey"
                ]}
            },
            "relationships": {
                "organization": {
                  "links": {
                    "self": "/studies/12345/relationships/organization",
                    "related": "/studies/12345/organization"
                  }
                },
                "responses": {
                  "links": {
                    "self": "/studies/12345/relationships/responses",
                    "related": "/studies/12345/responses"
                  }
                }
            },
            "links": {
                "self": "/studies/12345"
            }
        }
    };
  });
}

// this.get('/studies/:id', function() {
//    return {
//        "data": {
//            "type": "study",
//            "relationships": {
//              "history": {
//                "links": {
//                  "related": "http:\/\/staging-metadata.osf.io\/v1\/id\/documents\/experimenter.experiments.59284f033de08a0040031bcd\/history",
//                  "self": "http:\/\/staging-metadata.osf.io\/v1\/id\/documents\/experimenter.experiments.59284f033de08a0040031bcd\/history"
//                }
//              }
//            },
//            "id": "12345",
//            "attributes": {
//              "exitUrl": "https:\/\/staging-lookit.osf.io\/",
//              "eligibilityString": "For children between 9 months and 2 years old",
//              "duration": "Fifteen minutes",
//              "purpose": "Where your baby chooses to look can tell us about his or her expectations of how the physical world works. Although your baby isn't ready to study physics, he or she is already learning the basics: Should things fall up or down or not at all? Should they keep going once they start moving? We're trying to understand how these sorts of beliefs relate to each other, whether babies pass through discrete \"stages\" of understanding, and how much individual babies' moods and \"looking personalities\" affect their responses. ",
//              "endDate": null,
//              "eligibilityMinAge": "8 months",
//              "displayFullscreen": false,
//              "description": "Your baby watches pairs of short video clips of physical events. In each pair, something pretty normal for our world happens on one side: e.g., a ball rolls off a table and falls to the round. On the other side, something different  happens: e.g., the ball rolls off a table and falls UP!",
//              "structure": {
//                "frames": {
//                  "video-consent": {
//                    "prompt": "\"I have read and understand the consent document. I am this child's parent or legal guardian and we both agree to participate in this study.\"",
//                    "id": "video-consent",
//                    "blocks": [
//                      {
//                        "title": "About the study",
//                        "text": "Observing your child's behavior during this experimental session will help us to understand how infants and children use evidence to learn and make predictions about the world."
//                      },
//                      {
//                        "title": "Participation",
//                        "text": "Your and your child's participation in this session are completely voluntary. If you and your child choose to participate, you may stop the session at any point with no penalty. Please pause or stop the session if your child becomes very fussy or does not want to participate. If this is a study with multiple sessions, there are no penalties for not completing all sessions."
//                      },
//                      {
//                        "title": "Webcam recording",
//                        "text": "During the session, you and your child will be recorded via your computer's webcam and microphone while watching a video or completing an activity. Video recordings and other data you enter are sent securely to our lab. At the end of the session, or when you end it early, you will be prompted to choose a privacy level for your webcam recordings. "
//                      },
//                      {
//                        "title": "Use of data",
//                        "text": "Recordings and survey responses will be stored on a password-protected server and accessed only by the Lookit researchers working on this study and any other groups you allow when selecting a privacy level. A researcher may transcribe responses or record information such as where you or your child is looking. Data will not be used to identify you or your child. The results of the research may be presented at scientific meetings or published in scientific journals, but no video clips will be shared unless you allow this when selecting a privacy level.\n\nRaw data may also be published when it can not identify children; for instance, we may publish children\u2019s looking times to the left versus right of the screen, or parent comments with children\u2019s names removed. We may also study your child\u2019s responses in connection with his or her previous responses to this or other studies, siblings\u2019 responses, or demographic survey responses. We never publish children\u2019s birthdates or names, and we never publish your demographic data in conjunction with your child\u2019s video."
//                      },
//                      {
//                        "title": "Contact information",
//                        "text": "If you or your child have any questions or concerns about this research, you may contact Professor Laura Schulz: lschulz@mit.edu or (617) 324-4859."
//                      }
//                    ],
//                    "kind": "exp-video-consent"
//                  },
//                  "video-quality": {
//                    "id": "video-quality",
//                    "kind": "exp-video-config-quality"
//                  },
//                  "exit-survey": {
//                    "idealSessionsCompleted": 15,
//                    "title2": "Thank you! You're all done.",
//                    "exitMessage": "",
//                    "idealDaysSessionsCompleted": 60,
//                    "kind": "exp-exit-survey",
//                    "title1": "Almost done!",
//                    "exitThankYou": "Thank you so much for your help! We appreciate and learn from every video we receive in the lab (even if what we learn is that your kiddo thinks this study is boring and we need to up our game.)",
//                    "id": "exit-survey"
//                  },
//                  "video-config": {
//                    "instructions": "Make sure your camera is working and you can see yourself below! Important: you'll need to check 'Remember' when you allow access, so that it'll still work on the next screen.",
//                    "id": "video-config",
//                    "kind": "exp-video-config"
//                  },
//                  "pre-video-message": {
//                    "id": "pre-video-message",
//                    "kind": "exp-physics-pre-video"
//                  },
//                  "video-preview": {
//                    "kind": "exp-video-preview",
//                    "prompt": "My child can NOT see the screen. Start the preview!",
//                    "videos": [
//                      {
//                        "caption": "Before each pair of event videos, a woman introduces the object that will appear. Here's an example.",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/example_intro.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/example_intro.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "Here are the other object introduction videos that might be shown (page 1 of 2). ",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/0_introsA.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/0_introsA.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "Here are the other object introduction videos that might be shown (page 2 of 2). ",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/0_introsB.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/0_introsB.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "Next, well show two events, one on the left and one on the right. They'll loop for about 20 seconds. Here's an example event pair:",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/example_pairing.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/example_pairing.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "To make the event pairs your baby will see today, events may be flipped horizontally and shown on either of the two backgrounds below. For some events we also have two slightly-different camera angles (for instance, looking straight at the table and looking from the right.) This helps us keep the videos 'fresh' and avoid confounds.",
//                        "imgSrc": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/backgrounds.jpg",
//                        "sources": [
//                          {
//
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "There are many event videos that may be used in these pairs; your child will see only some of these during this session. These videos show objects being placed on ramps and sliding either up or down. (Events page 1 of 5.)",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/1_ramp.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/1_ramp.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "These videos show objects being tossed up and caught, either rightside up or upside-down. (Events page 2 of 5.)",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/2_toss.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/2_toss.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "These videos show objects staying put after being placed on, partially on, next to, or near a surface. (Events page 3 of 5.)",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/6_stay.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/6_stay.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "These 'salience control' videos help us measure your baby's 'looking style': how much more does he or she look at the events with more motion? (Events page 4 of 5.)",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/7_control_salience.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/7_control_salience.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "These control videos also help measure your baby's 'looking style': how much does he or she look back and forth between very similar events? (Events page 5 of 5.)",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/7_control_same.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/examples\/7_control_same.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      },
//                      {
//                        "caption": "Finally, this spinning ball is shown in between videos (during audio instructions to you) to keep your child's attention. This ball will also also be shown on alternating sides in place of occasional event videos as a calibration video, so that we can tell how well we're doing at recording which way your child is looking.",
//                        "sources": [
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/stimuli\/attention\/webm\/attentiongrabber.webm",
//                            "type": "video\/webm"
//                          },
//                          {
//                            "src": "https:\/\/s3.amazonaws.com\/lookitcontents\/exp-physics-final\/stimuli\/attention\/mp4\/attentiongrabber.mp4",
//                            "type": "video\/mp4"
//                          }
//                        ]
//                      }
//                    ],
//                    "record": false,
//                    "id": "video-preview",
//                    "text": "Here are the videos your child will see in this study. You can watch them ahead of time--please just don't show your child! Please note that we are still in the process of editing some of these videos, so the 'regular' and 'strange' versions may not be perfectly matched yet!"
//                  },
//                  "pref-phys-videos": {
//                    "sampler": "prefphys",
//                    "kind": "choice"
//                  },
//                  "video-preview-exp": {
//                    "id": "video-preview-exp",
//                    "kind": "exp-physics-preview-explanation"
//                  },
//                  "mood-survey": {
//                    "id": "mood-survey",
//                    "kind": "exp-mood-questionnaire"
//                  },
//                  "instructions": {
//                    "id": "instructions",
//                    "kind": "exp-physics-intro"
//                  }
//                },
//                "sequence": [
//                  "video-config",
//                  "video-consent",
//                  "instructions",
//                  "video-preview-exp",
//                  "video-preview",
//                  "mood-survey",
//                  "video-quality",
//                  "pre-video-message",
//                  "pref-phys-videos",
//                  "exit-survey"
//                ]
//              },
//              "beginDate": "2017-05-26T15:52:03.016Z",
//              "thumbnailId": "59284f033de08a003d031b68",
//              "permissions": "ADMIN",
//              "state": "Active",
//              "eligibilityMaxAge": "3 years",
//              "title": "Dawn - Physics Testing"
//            },
//            "meta": {
//              "permissions": "READ",
//              "created-on": "2017-05-26T15:51:31.620728",
//              "created-by": "user-osf-4hgq3",
//              "modified-on": "2017-05-26T19:51:45.581711",
//              "modified-by": "user-osf-4hgq3"
//            }
//          }
//    };
// });
// }
