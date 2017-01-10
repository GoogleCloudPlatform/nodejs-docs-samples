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

require(`../../system-test/_setup`);

const proxyquire = require(`proxyquire`).noPreserveCache();
const vision = proxyquire(`@google-cloud/vision`, {})();
const path = require(`path`);

test.before(stubConsole);
test.after.always(restoreConsole);

test.cb(`should detect labels`, (t) => {
  const filePath = path.join(__dirname, `../resources/wakeupcat.jpg`);
  const expectedFileName = `./resources/wakeupcat.jpg`;
  const visionMock = {
    detectLabels: (_fileName) => {
      t.is(_fileName, expectedFileName);

      return vision.detectLabels(filePath)
        .then(([labels]) => {
          t.true(Array.isArray(labels));

          setTimeout(() => {
            try {
              t.is(console.log.callCount, 6);
              t.deepEqual(console.log.getCall(0).args, [`Labels:`]);
              labels.forEach((label, i) => {
                t.deepEqual(console.log.getCall(i + 1).args, [label]);
              });
              t.end();
            } catch (err) {
              t.end(err);
            }
          }, 200);

          return [labels];
        });
    }
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/vision': sinon.stub().returns(visionMock)
  });
});
