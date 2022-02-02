const supertest = require('supertest');
const app = require(path.join(__dirname, '../', 'server.js'));
const path = require('path');

it('should be listening', async () => {
  await supertest(app).get('/').expect(200);
});
