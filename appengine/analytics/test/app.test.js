const supertest = require('supertest');
const path = require('path');
const app = require(path.join(__dirname, '../', 'app.js'));

describe('gae_flex_analytics_track_event', () => {
  it('should be listening', async () => {
    await supertest(app).get('/').expect(200);
  });
});
