const app = require('../app');
const request = require('supertest');

describe('gae_flex_quickstart', () => {
  describe('GET /', () => {
    it('should get 200', done => {
      request(app).get('/').expect(200, done);
    });

    it('should get Hello World', done => {
      request(app).get('/').expect('Hello, world!', done);
    });
  });
});
