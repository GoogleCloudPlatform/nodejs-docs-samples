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

var ISO6391 = require('iso-639-1');
var program = require('../translate');

var text = 'Hello world!';
var toLang = 'ru';

describe('translate:translate', function () {
  if (!process.env.TRANSLATE_API_KEY) {
    process.stdout.write('Skipping Translate API tests...\n');
    return;
  }

  describe('detectLanguage', function () {
    it('should detect language', function (done) {
      program.detectLanguage(text, function (err, result, apiResponse) {
        assert.equal(err, null);
        assert.notEqual(result, undefined);
        assert.equal(result.language, 'en', 'should have detected english');
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Detected language(s):', result]);
        assert.notEqual(apiResponse, undefined);
        done();
      });
    });
  });

  describe('listLanguages', function () {
    it('should list languages', function (done) {
      program.listLanguages(function (err, languages, apiResponse) {
        assert.equal(err, null);
        assert.equal(Array.isArray(languages), true);
        assert.equal(languages.length > 0, true);
        var matchingLanguages = languages.filter(function (language) {
          return language.code === 'af' && language.name === 'Afrikaans';
        });
        assert.equal(matchingLanguages.length, 1, 'found language with name in English');
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found %d language(s)!', languages.length]);
        assert.notEqual(apiResponse, undefined);
        done();
      });
    });
  });

  describe('listLanguagesWithTarget', function () {
    it('should list languages with a target', function (done) {
      program.listLanguagesWithTarget('es', function (err, languages, apiResponse) {
        assert.equal(err, null);
        assert.equal(Array.isArray(languages), true);
        assert.equal(languages.length > 0, true);
        var matchingLanguages = languages.filter(function (language) {
          return language.code === 'af' && language.name === 'afrikáans';
        });
        assert.equal(matchingLanguages.length, 1, 'found language with name in Spanish');
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Found %d language(s)!', languages.length]);
        assert.notEqual(apiResponse, undefined);
        done();
      });
    });
  });

  describe('translateText', function () {
    it('should translate text', function (done) {
      var expected = 'Привет мир!';

      program.translateText(text, toLang, undefined, function (err, translation, apiResponse) {
        assert.equal(err, null);
        assert.equal(translation, expected);
        assert.equal(console.log.calledOnce, true);
        assert.deepEqual(console.log.firstCall.args, ['Translated to %s:', ISO6391.getName(toLang)]);
        assert.notEqual(apiResponse, undefined);
        done();
      });
    });
  });
});
