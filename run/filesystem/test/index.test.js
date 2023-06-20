const path = require('path');
const supertest = require('supertest');
const assert = require('chai').expect;

let request;
describe('Unit tests', () => {
  const defaultLogFunction = console.log;
  let consoleOutput = '\n';
  before(() => {
    const app = require(path.join(__dirname, '..', 'index'));
    console.log = (msg) => {
      consoleOutput += msg + '\n';
    };
    request = supertest(app);
  });
  after(() => {
    console.log = defaultLogFunction;
    console.log('\nconsole.log output:\n---------');
    console.log(consoleOutput);
    console.log('---------');
  });
  describe('GET /', () => {
    it('responds with 302 Found and redirects to mount directory', async () => {
      response = await request.get('/');
      assert(response.header.location).to.eql('/mnt/nfs/filestore');
      assert(response.status).to.eql(302);
    });
  });
  describe('GET nonexistant path', () => {
    it('responds with 302 Found and redirects to mount directory', async () => {
      response = await request.get('/nonexistant');
      assert(response.header.location).to.eql('/mnt/nfs/filestore');
      assert(response.status).to.eql(302);
    });
  });
});