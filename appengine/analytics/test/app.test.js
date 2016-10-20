/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  const resultsMock = {
    statusCode: 200,
    foo: `bar`
  };

  const requestMock = {
    post: sinon.stub().yields(null, resultsMock)
  };

  const app = proxyquire(SAMPLE_PATH, {
    request: requestMock,
    express: expressMock
  });

  return {
    app: app,
    mocks: {
      express: expressMock,
      results: resultsMock,
      request: requestMock
    }
  };
}

describe(`appengine/analytics/app.js`, () => {
  let sample;

  beforeEach(() => {
    sample = getSample();

    assert(sample.mocks.express.calledOnce);
    assert(sample.app.listen.calledOnce);
    assert.equal(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
  });

  it(`should record a visit`, (done) => {
    const expectedResult = `Event tracked.`;

    request(sample.app)
      .get(`/`)
      .expect(200)
      .expect((response) => {
        assert.equal(response.text, expectedResult);
      })
      .end(done);
  });

  it(`should handle request error`, (done) => {
    const expectedResult = `request_error`;

    sample.mocks.request.post.onFirstCall().callsArgWith(2, expectedResult);

    request(sample.app)
      .get(`/`)
      .expect(500)
      .expect((response) => {
        assert.equal(response.text, expectedResult + `\n`);
      })
      .end(done);
  });

  it(`should handle track error`, (done) => {
    sample.mocks.request.post.onFirstCall().callsArgWith(2, null, {
      statusCode: 400
    });

    request(sample.app)
      .get('/')
      .expect(500)
      .expect((response) => {
        assert.notEqual(response.text.indexOf('Error: Tracking failed'), -1);
      })
      .end(done);
  });
});
