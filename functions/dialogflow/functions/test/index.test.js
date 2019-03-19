const supertest = require('supertest');
const request = supertest(process.env.BASE_URL);

describe('Validate output response code', function() {
  it('should give 400 if no argument is provided.', function(done) {
    request
      .get('/getOAuthToken')
      .send()
      .expect(
        400,
        '{"error":{"status":"INVALID_ARGUMENT","message":"Bad Request"}}',
        done
      );
  });
});
