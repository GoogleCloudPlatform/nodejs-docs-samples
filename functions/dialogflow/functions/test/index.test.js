const supertest = require('supertest');
const request1 = supertest('metadata.google.internal');
const request2 = supertest('iamcredentials.googleapis.com');

describe('Validate header field', function() {
  it('should fail if header field is missing.', function(done) {
    request1
      .get('/computeMetadata/v1/instance/service-accounts/default/token')
      .set('headers', {'Metadata-Flavor': 'InvalidHeader'})
      .send()
      .expect(400, 'Invalid header.', done);
  });
  it('should fail if header field is empty.', function(done) {
    request1
      .get('/computeMetadata/v1/instance/service-accounts/default/token')
      .set('headers', {'Metadata-Flavor': ''})
      .send()
      .expect(400, 'Invalid header.', done);
  });
});

describe('Validate output response code', function() {
  it('should give 200 if header field is valid.', function(done) {
    request1
      .get('/computeMetadata/v1/instance/service-accounts/default/token')
      .set('headers', {'Metadata-Flavor': 'Google'})
      .send()
      .expect(200, 'Success response.', done);
  });
});

describe('Validate header field', function() {
  it('should fail if header field is missing.', function(done) {
    request2
      .post(
        '/v1/projects/-/serviceAccounts/SERVICE-ACCOUNT-NAME@YOUR_PROJECT_ID.iam.gserviceaccount.com:generateAccessToken'
      )
      .set('headers', {Authorization: 'InvalidHeader'})
      .send()
      .expect(400, 'Invalid header.', done);
  });
  it('should fail if header field is empty.', function(done) {
    request2
      .post(
        '/v1/projects/-/serviceAccounts/SERVICE-ACCOUNT-NAME@YOUR_PROJECT_ID.iam.gserviceaccount.com:generateAccessToken'
      )
      .set('headers', {Authorization: ''})
      .send()
      .expect(400, 'Invalid header.', done);
  });
});
