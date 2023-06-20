const path = require('path');
const supertest = require('supertest');
const assert = require('chai').expect;
const mock = require('mock-fs');
const fs = require('fs');
const mntDir = process.env.MNT_DIR || '/mnt/nfs/filestore'
let request;
describe('Unit tests', () => {
  const defaultLogFunction = console.log;
  let consoleOutput = '\n';
  before(() => {
    const app = require(path.join(__dirname, '..', 'index'));
    console.log = (msg) => {
      consoleOutput += msg + '\n';
    };
    mock({
      [mntDir]: mock.directory({
        mode: 0755,
        items: {}
      })
    });
    request = supertest(app);
  });
  after(() => {
    mock.restore();
    console.log = defaultLogFunction;
    console.log('\nconsole.log output:\n---------');
    console.log(consoleOutput);
    console.log('---------');
  });
  describe('GET /', () => {
    it('responds with 302 Found and redirects to mount directory', async () => {
      response = await request.get('/');
      assert(response.header.location).to.eql(mntDir);
      assert(response.status).to.eql(302);
    });
  });
  describe('GET nonexistant path', () => {
    it('responds with 302 Found and redirects to mount directory', async () => {
      response = await request.get('/nonexistant');
      assert(response.header.location).to.eql(mntDir);
      assert(response.status).to.eql(302);
    });
  });
  describe('GET mount path', () => {
    it('writes a file', async () => {
      response = await request.get(mntDir);
      fs.readdir(mntDir, (err, files) => {
        assert(files.length).to.eql(1)
      });
    });
  });
});