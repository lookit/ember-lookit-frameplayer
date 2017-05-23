import Ember from 'ember';

// TODO replace temporary session service
// THIS IS A FAKE SESSION
export default Ember.Service.extend({
  isAuthenticated: true,
  data: Ember.Object.create({
      authenticated: {
          id: 'abcde'
      },
      profile: Ember.Object.create({
          profileId: "fghij",
          firstName: "Test Child",
          birthday: "2015-05-01T04:00:00.000Z",
          gender: "female",
          ageAtBirth: "40 or more weeks",
          deleted: false,
          additionalInformation: ""
      })
  })
});
