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

var program = require('../translate');
var apiKey = process.env.TRANSLATE_API_KEY;
var text = 'Hello world!';

describe('translate:translate', function () {
  if (!process.env.TRANSLATE_API_KEY) {
    process.stdout.write('Skipping Translate API tests...\n');
    return;
  }
  describe('detectLanguage', function () {
    it('should detect language', function (done) {
      program.detectLanguage(text, apiKey, function (err, result) {
        assert.ifError(err);
        assert(result, 'should have received a result');
        assert.equal(result.language, 'en', 'should have detected english');
        assert(console.log.calledWith('Detected %s with confidence %d', 'English', result.confidence));
        done();
      });
    });
  });

  describe('listLanguages', function () {
    it('should list languages', function (done) {
      program.listLanguages(apiKey, function (err, languages) {
        assert.ifError(err);
        assert(Array.isArray(languages));
        assert(languages.length > 0);
        assert(console.log.calledWith('Found %d language(s)!', languages.length));
        done();
      });
    });
  });

  describe('translateText', function () {
    it('should translate text', function (done) {
      var options = {
        text: text,
        apiKey: apiKey,
        to: 'ru'
      };
      var expected = 'Привет мир!';

      program.translateText(options, function (err, translation) {
        assert.ifError(err);
        assert.equal(translation, expected);
        assert(console.log.calledWith('Translated text to %s', 'Russian'));
        done();
      });
    });
  });
});
