const app = require('../server');

const request = require('supertest');

describe('start app', () => {
  describe('GET /', () => {
    it('should get 200', (done) => {
      request(app).get('/').expect(200, done);
    });
  });
});
