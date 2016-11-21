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
const language = proxyquire(`@google-cloud/language`, {})();

describe(`language:quickstart`, () => {
  it(`should detect sentiment`, (done) => {
    const expectedText = `Hello, world!`;
    const languageMock = {
      detectSentiment: (_text) => {
        assert.equal(_text, expectedText);

        return language.detectSentiment(_text)
          .then((results) => {
            const sentiment = results[0];
            assert.equal(typeof sentiment, `number`);

            setTimeout(() => {
              assert.equal(console.log.callCount, 2);
              assert.deepEqual(console.log.getCall(0).args, [`Text: ${expectedText}`]);
              assert.deepEqual(console.log.getCall(1).args, [`Sentiment: ${sentiment}`]);
              done();
            }, 200);

            return results;
          });
      }
    };

    proxyquire(`../quickstart`, {
      '@google-cloud/language': sinon.stub().returns(languageMock)
    });
  });
});
