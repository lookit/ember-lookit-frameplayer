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
  this.get('/users/:id', function() {
     return {
          "data": {
            "type": "user",
            "id": "abcde",
            "relationships": {
                "profiles": {
                    "data": [
                        {
                          "profileId": "fghij",
                          "additionalInformation": "",
                          "ageAtBirth": "40 or more weeks",
                          "gender": "female",
                          "deleted": false,
                          "birthday": "2015-05-01T04:00:00.000Z",
                          "firstName": "Test Child"
                        }

                    ]
                }
            },
            "attributes": {
              "additional-comments": null,
              "demographicsGender": "female",
              "spouse-education-level": "graduate or professional degree",
              "profiles": [
                {
                  "profileId": "fghij",
                  "additionalInformation": "",
                  "ageAtBirth": "40 or more weeks",
                  "gender": "female",
                  "deleted": false,
                  "birthday": "2015-05-01T04:00:00.000Z",
                  "firstName": "Test Child"
                }
              ],
              "state": "TX",
              "annual-income": "over 200000",
              "number-of-guardians-explanation": null,
              "name": null,
              "number-of-books": 1000000000,
              "education-level": "graduate or professional degree",
              "age": "70 or over",
              "number-of-guardians": "2",
              "password": "$2b$12$SbNsmUQzpd4.PCp2x7ywq.l11TQU3WADvpD0kEGbJZwNPEsy4xub.",
              "languages-spoken-at-home": null,
              "email": "pattison.dawn.r@gmail.com",
              "child-birthdays": [

              ],
              "race-identification": [
                "White"
              ],
              "number-of-children": null,
              "density": null,
              "country": "US"
            },
            "meta": {
              "permissions": "CRUD",
              "created-on": "2017-05-17T14:44:11.254007",
              "created-by": "jam-experimenter:accounts-pattisdr",
              "modified-on": "2017-05-17T15:00:19.406697",
              "modified-by": "jam-experimenter:accounts-pattisdr"
            }
          }
      };
  });
  this.get('/studies/:id', function() {
      return {
          'data': {
              id: '12345',
              type: 'study',
              attributes: {
                  'name': 'Title of my study',
                  'short-description': 'This is a description of my study',
                  'criteria': '2 years',
                  'duration': '20 minutes',
                  'contact-info': 'pattison.dawn@cos.io',
                  'public': false,
                  'state': 'active',
                  'display-full-screen': false,
                  'structure': {
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
                    ]
                  },
                  "exitUrl": "https:\/\/staging.osf.io\/"
              }
          }
      };
  });
}
