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
const translate = proxyquire(`@google-cloud/translate`, {})();

test.before(stubConsole);
test.after.always(restoreConsole);

test.cb(`should translate a string`, (t) => {
  const string = `Hello, world!`;
  const expectedTranslation = `Привет мир!`;
  const targetLanguage = `ru`;
  const translateMock = {
    translate: (_string, _targetLanguage) => {
      t.is(_string, string);
      t.is(_targetLanguage, targetLanguage);

      return translate.translate(_string, _targetLanguage)
        .then(([translation]) => {
          t.is(translation, expectedTranslation);

          setTimeout(() => {
            try {
              t.is(console.log.callCount, 2);
              t.deepEqual(console.log.getCall(0).args, [`Text: ${string}`]);
              t.deepEqual(console.log.getCall(1).args, [`Translation: ${expectedTranslation}`]);
              t.end();
            } catch (err) {
              t.end(err);
            }
          }, 200);

          return [translation];
        });
    }
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/translate': sinon.stub().returns(translateMock)
  });
});
