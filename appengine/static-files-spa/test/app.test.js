const supertest = require('supertest');
const path = require('path');
const app = require(path.join(__dirname, '../', 'app.js'));

describe('gae_flex_node_static_files', () => {
  it('should be listening', async () => {
    await supertest(app).get('/').expect(200);
  });

  it('any url should return root page', async () => {
    await supertest(app).get('/not_existing_page').expect(200);
  });
});
