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

const proxyquire = require(`proxyquire`).noPreserveCache();
const vision = proxyquire(`@google-cloud/vision`, {})();
const path = require(`path`);

describe(`vision:quickstart`, () => {
  let visionMock, VisionMock;

  it(`should detect labels`, (done) => {
    const filePath = path.join(__dirname, `../resources/wakeupcat.jpg`);
    const expectedFileName = `./resources/wakeupcat.jpg`;

    visionMock = {
      detectLabels: (_fileName, _callback) => {
        assert.equal(_fileName, expectedFileName);
        assert.equal(typeof _callback, 'function');

        vision.detectLabels(filePath, (err, labels, apiResponse) => {
          _callback(err, labels, apiResponse);
          assert.ifError(err);
          assert.equal(Array.isArray(labels), true);
          assert.notEqual(apiResponse, undefined);
          assert.equal(console.log.called, true);
          assert.deepEqual(console.log.firstCall.args, [`Labels:`]);
          labels.forEach((label, i) => {
            assert.deepEqual(console.log.getCall(i + 1).args, [label]);
          });
          done();
        });
      }
    };
    VisionMock = sinon.stub().returns(visionMock);

    proxyquire(`../quickstart`, {
      '@google-cloud/vision': VisionMock
    });
  });
});
