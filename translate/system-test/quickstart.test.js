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
const translate = proxyquire(`@google-cloud/translate`, {})({
  key: process.env.TRANSLATE_API_KEY
});
const string = `Hello, world!`;
const expectedTranslation = `Привет мир!`;
const targetLanguage = `ru`;

describe(`translate:quickstart`, () => {
  let translateMock, TranslateMock;

  it(`should translate a string`, (done) => {
    translateMock = {
      translate: (_string, _targetLanguage, _callback) => {
        assert.equal(_string, string);
        assert.equal(_targetLanguage, targetLanguage);
        assert.equal(typeof _callback, 'function');

        translate.translate(_string, _targetLanguage, (err, translation, apiResponse) => {
          _callback(err, translation, apiResponse);
          assert.ifError(err);
          assert.equal(translation, expectedTranslation);
          assert.notEqual(apiResponse, undefined);
          assert.equal(console.log.calledTwice, true);
          assert.deepEqual(console.log.firstCall.args, [`Text: ${string}`]);
          assert.deepEqual(console.log.secondCall.args, [`Translation: ${expectedTranslation}`]);
          done();
        });
      }
    };
    TranslateMock = sinon.stub().returns(translateMock);

    proxyquire(`../quickstart`, {
      '@google-cloud/translate': TranslateMock
    });
  });
});
