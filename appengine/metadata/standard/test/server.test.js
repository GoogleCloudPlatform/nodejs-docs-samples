import supertest from 'supertest';
import app from '../server.js';

it('should be listening', async () => {
  await supertest(app).get('/').expect(200);
});
