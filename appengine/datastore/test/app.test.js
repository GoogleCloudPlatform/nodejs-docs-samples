const supertest = require('supertest');
const path = require('path');
const app = require(path.join(__dirname, '../', 'app.js'));

// Testing GAE Flex Datastore
describe('gae_flex_datastore_app', () => {
  it('should be listening', async () => {
    await supertest(app).get('/').expect(200);
  });
});
