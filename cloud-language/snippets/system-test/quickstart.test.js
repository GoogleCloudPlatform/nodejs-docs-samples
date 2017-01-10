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
const language = proxyquire(`@google-cloud/language`, {})();

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.cb(`should detect sentiment`, (t) => {
  const expectedText = `Hello, world!`;
  const languageMock = {
    detectSentiment: (_text) => {
      t.is(_text, expectedText);

      return language.detectSentiment(_text)
        .then(([sentiment]) => {
          t.is(typeof sentiment, `number`);

          setTimeout(() => {
            try {
              t.is(console.log.callCount, 2);
              t.deepEqual(console.log.getCall(0).args, [`Text: ${expectedText}`]);
              t.deepEqual(console.log.getCall(1).args, [`Sentiment: ${sentiment}`]);
              t.end();
            } catch (err) {
              t.end(err);
            }
          }, 200);

          return [sentiment];
        });
    }
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/language': sinon.stub().returns(languageMock)
  });
});
