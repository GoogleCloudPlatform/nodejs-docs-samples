// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require(`express`);
const path = require(`path`);
const proxyquire = require(`proxyquire`).noPreserveCache();
const request = require(`supertest`);

const SAMPLE_PATH = path.join(__dirname, `../app.js`);

function getSample () {
  const testApp = express();
  sinon.stub(testApp, `listen`).callsArg(1);
  const expressMock = sinon.stub().returns(testApp);
  const resultsMock = JSON.stringify({
    timestamp: `1234`,
    userIp: `abcd`
  }) + `\n`;
  const fsMock = {
    appendFile: sinon.stub().callsArg(2),
    readFile: sinon.stub().callsArgWith(2, null, resultsMock)
  };

  const app = proxyquire(SAMPLE_PATH, {
    fs: fsMock,
    express: expressMock
  });
  return {
    app: app,
    mocks: {
      express: expressMock,
      results: resultsMock,
      fs: fsMock
    }
  };
}

describe(`appengine/disk/app.js`, () => {
  let sample;

  beforeEach(() => {
    sample = getSample();

    assert(sample.mocks.express.calledOnce);
    assert(sample.app.listen.calledOnce);
    assert.equal(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
  });

  it(`should record a visit`, (done) => {
    const expectedResult = `Last 10 visits:\nTime: 1234, AddrHash: abcd`;

    request(sample.app)
      .get(`/`)
      .expect(200)
      .expect((response) => {
        assert.equal(response.text, expectedResult);
      })
      .end(done);
  });

  it(`should handle insert error`, (done) => {
    const expectedResult = `insert_error`;

    sample.mocks.fs.appendFile.callsArgWith(2, expectedResult);

    request(sample.app)
      .get(`/`)
      .expect(500)
      .expect((response) => {
        assert.equal(response.text, expectedResult + `\n`);
      })
      .end(done);
  });

  it(`should handle read error`, (done) => {
    const expectedResult = `read_error`;

    sample.mocks.fs.readFile.callsArgWith(2, expectedResult);

    request(sample.app)
      .get(`/`)
      .expect(500)
      .expect((response) => {
        assert.equal(response.text, `${expectedResult}\n`);
      })
      .end(done);
  });
});
