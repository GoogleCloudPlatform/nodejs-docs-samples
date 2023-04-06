const path = require('path');
const app = require(path.join(__dirname, '../', 'server.js'));
const supertest = require('supertest');

describe('gae_flex_metadata', () => {
  it('should be listening', async () => {
    await supertest(app).get('/').expect(200);
  });
});
