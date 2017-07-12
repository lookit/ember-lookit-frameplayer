import Ember from 'ember';

// TODO replace temporary session service
// THIS IS A FAKE SESSION
export default Ember.Service.extend({
  isAuthenticated: true,
  data: Ember.Object.create({
      authenticated: {
          id: 'abcde'
      },
      child: Ember.Object.create({
          childId: "0f8221bc-0de7-4ed2-b9e6-803860d9b962",
          firstName: "Test Child",
          birthday: "2015-05-01T04:00:00.000Z",
          gender: "female",
          ageAtBirth: "40 or more weeks",
          deleted: false,
          additionalInformation: ""
      })
  })
});
