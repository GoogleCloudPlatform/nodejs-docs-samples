// Copyright 2015-2016, Google, Inc.
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

var proxyquire = require('proxyquire').noPreserveCache();
var translate = proxyquire('@google-cloud/translate', {})({
  key: process.env.TRANSLATE_API_KEY
});
var string = 'Hello, world!';
var targetLanguage = 'ru';

describe('translate:quickstart', function () {
  var translateMock, TranslateMock;

  it('should translate a string', function (done) {
    translateMock = {
      translate: function (_string, _targetLanguage) {
        assert.equal(_string, string);
        assert.equal(_targetLanguage, targetLanguage);

        translate.translate(_string, _targetLanguage, function (err, translation, apiResponse) {
          assert.ifError(err);
          assert.equal(translation, 'Привет мир!');
          assert.notEqual(apiResponse, undefined);
          done();
        });
      }
    };
    TranslateMock = sinon.stub().returns(translateMock);

    proxyquire('../quickstart', {
      '@google-cloud/translate': TranslateMock
    });
  });
});
