/**
 * Copyright 2017, Google, Inc.
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

const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const {Translate} = proxyquire('@google-cloud/translate', {});
const translate = new Translate();

before(tools.checkCredentials);
before(tools.stubConsole);
after(tools.restoreConsole);

it('should translate a string', () => {
  const string = 'Hello, world!';
  const expectedTranslation = 'Привет, мир!';
  const targetLanguage = 'ru';
  const translateMock = {
    translate: (_string, _targetLanguage) => {
      assert.strictEqual(_string, string);
      assert.strictEqual(_targetLanguage, targetLanguage);

      return translate
        .translate(_string, _targetLanguage)
        .then(async ([translation]) => {
          assert.strictEqual(translation, expectedTranslation);
          await new Promise(r => setTimeout(r, 200));
          assert.strictEqual(console.log.callCount, 2);
          assert.deepStrictEqual(console.log.getCall(0).args, [
            `Text: ${string}`,
          ]);
          assert.deepStrictEqual(console.log.getCall(1).args, [
            `Translation: ${expectedTranslation}`,
          ]);

          return [translation];
        });
    },
  };

  proxyquire('../quickstart', {
    '@google-cloud/translate': {
      Translate: sinon.stub().returns(translateMock),
    },
  });
});
