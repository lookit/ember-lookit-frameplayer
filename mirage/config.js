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
  this.get('/users/abcde/profiles', function() {
      return {
            "data": [{
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
            }]
        };
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
