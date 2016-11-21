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
const translate = proxyquire(`@google-cloud/translate`, {})();

describe(`translate:quickstart`, () => {
  it(`should translate a string`, (done) => {
    const string = `Hello, world!`;
    const expectedTranslation = `Привет мир!`;
    const targetLanguage = `ru`;
    const translateMock = {
      translate: (_string, _targetLanguage) => {
        assert.equal(_string, string);
        assert.equal(_targetLanguage, targetLanguage);

        return translate.translate(_string, _targetLanguage)
          .then((results) => {
            const translation = results[0];
            assert.equal(translation, expectedTranslation);

            setTimeout(() => {
              assert.equal(console.log.callCount, 2);
              assert.deepEqual(console.log.getCall(0).args, [`Text: ${string}`]);
              assert.deepEqual(console.log.getCall(1).args, [`Translation: ${expectedTranslation}`]);
              done();
            }, 200);

            return results;
          });
      }
    };

    proxyquire(`../quickstart`, {
      '@google-cloud/translate': sinon.stub().returns(translateMock)
    });
  });
});
