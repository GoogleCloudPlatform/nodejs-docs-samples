const path = require('path');
const supertest = require('supertest');
const app = require(path.join(__dirname, '../', 'app.js'));

describe('gae_flex_node_static_files', () => {
  it('should be listening', async () => {
    await supertest(app).get('/').expect(200);
  });
});
