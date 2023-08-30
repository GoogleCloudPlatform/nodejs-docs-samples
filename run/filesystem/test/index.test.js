// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const path = require('path');
const supertest = require('supertest');
const assert = require('chai').expect;
const mock = require('mock-fs');
const mntDir = process.env.MNT_DIR || '/mnt/nfs/filestore';
let request;
const testFileContents = 'Test file contents.';
describe('Unit tests', () => {
  const defaultLogFunction = console.log;
  let consoleOutput = '\n';
  before(() => {
    const app = require(path.join(__dirname, '..', 'index'));
    console.log = msg => {
      consoleOutput += msg + '\n';
    };
    mock({
      [mntDir]: mock.directory({
        items: {
          'test-file.txt': `${testFileContents}`,
        },
      }),
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
    it('responds with 302 Found and redirects to mount point', async () => {
      const response = await request.get('/');
      assert(response.status).to.eql(302);
    });
  });
  describe('GET mount path', () => {
    it('responds with 301 Found', async () => {
      const response = await request.get(mntDir);
      assert(response.status).to.eql(301);
    });
  });
  describe('GET nonexistent path', () => {
    it('responds with 302 Found and redirects to mount path', async () => {
      const response = await request.get('/nonexistant');
      assert(response.header.location).to.eql(mntDir);
      assert(response.status).to.eql(302);
    });
  });
  describe('GET file path', () => {
    it('responds with file contents and 200 found', async () => {
      const getMntPathPage = await request.get(`${mntDir}/`);
      const fileNameRegExp = new RegExp(
        /test-\D{3}-\D{3}-\d{2}-\d{4}-\d{2}:\d{2}:\d{2}.txt/
      );
      const generatedFileName = getMntPathPage.text.match(fileNameRegExp);
      const response = await request.get(`${mntDir}/${generatedFileName}`);
      assert(response.text).to.contain('This test file was created on');
      assert(response.status).to.eql(200);
    });
  });
});
