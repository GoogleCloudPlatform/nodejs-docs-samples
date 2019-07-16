const assert = require('assert');
const index = require('../index.js');
const supertest = require('supertest');
const request = supertest(process.env.BASE_URL);

describe('Firebase OAuth Token', () => {
  it('should give 400 if no argument is provided.', done => {
    request
      .get('/getOAuthToken')
      .send()
      .expect(
        400,
        '{"error":{"status":"INVALID_ARGUMENT","message":"Bad Request"}}',
        done
      );
  });
  it('should hit retrieve credentials API', done => {
    const context = (uid = 'test-uid', email_verified = true) => ({
      auth: {
        uid,
        token: {
          firebase: {
            email_verified,
          },
        },
      },
    });
    const result = index.retrieveCredentials(context);
    result
      .then(doc => {
        return doc;
      })
      .catch(err => {
        console.log('Error in retrieve credentials', err);
        return 'Error retrieving token';
      });
    done();
  });
  it('Should throw on no auth', () => {
    assert.throws(() => index.getOAuthToken({}), Error);
  });
  it('Should return token', () => {
    const context = (uid = 'test-uid', email_verified = true) => ({
      auth: {
        uid,
        token: {
          firebase: {
            email_verified,
          },
        },
      },
    });
    request
      .get('/getOAuthToken')
      .send(context)
      .expect(200);
  });
});
