const app = require('../app');

const request = require('supertest');

describe('gae_flex_mailjet_send_message gae_flex_mailjet_config', () => {
  describe('GET /', () => {
    it('should get 200', (done) => {
      request(app).get('/').expect(200, done);
    });
  });
});
