const supertest = require('supertest');
const proxyquire = require('proxyquire');
const path = require('path');
const cwd = path.join(__dirname, '../');

const requestObj = supertest(proxyquire(path.join(cwd, 'app'), {process}));

describe('server listening', () => {
  it('should be listening', async () => {
    await requestObj.get('/').expect(200);
  });
});
