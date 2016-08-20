// Copyright 2016, Google, Inc.
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

var proxyquire = require('proxyquire').noCallThru();
var text = 'Hello world!';
var key = 'key';

function getSample () {
  var languagesMock = [
    'en',
    'ru'
  ];
  var resultMock = {
    language: 'en',
    confidence: 0.75,
    input: text
  };
  var translationMock = 'Привет мир!';
  var translateMock = {
    getLanguages: sinon.stub().callsArgWith(0, null, languagesMock),
    detect: sinon.stub().callsArgWith(1, null, resultMock),
    translate: sinon.stub().callsArgWith(2, null, translationMock)
  };
  var TranslateMock = sinon.stub().returns(translateMock);

  return {
    program: proxyquire('../translate', {
      '@google-cloud/translate': TranslateMock,
      yargs: proxyquire('yargs', {})
    }),
    mocks: {
      Translate: TranslateMock,
      translate: translateMock,
      languages: languagesMock,
      result: resultMock,
      translation: translationMock
    }
  };
}

describe('translate:translate', function () {
  describe('detectLanguage', function () {
    it('should detect language', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.detectLanguage(text, key, callback);

      assert(sample.mocks.translate.detect.calledOnce, 'create called once');
      assert.equal(sample.mocks.translate.detect.firstCall.args.length, 2, 'create received 2 arguments');
      assert.equal(sample.mocks.translate.detect.firstCall.args[0], text, 'create received correct argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.result, 'callback received result');
      assert(console.log.calledWith('Detected %s with confidence %d', 'English', sample.mocks.result.confidence));
    });

    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.translate.detect = sinon.stub().callsArgWith(1, error);

      sample.program.detectLanguage(text, key, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('listLanguages', function () {
    it('should list languages', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listLanguages(key, callback);

      assert(sample.mocks.translate.getLanguages.calledOnce, 'method called once');
      assert.equal(sample.mocks.translate.getLanguages.firstCall.args.length, 1, 'method received 1 argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.languages, 'callback received result');
      assert(console.log.calledWith('Found %d language(s)!', sample.mocks.languages.length));
    });

    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.translate.getLanguages = sinon.stub().callsArgWith(0, error);

      sample.program.listLanguages(key, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('translateText', function () {
    it('should translate text', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        text: text,
        to: 'ru',
        key: key
      };

      sample.program.translateText(options, callback);

      assert(sample.mocks.translate.translate.calledOnce, 'method called once');
      assert.equal(sample.mocks.translate.translate.firstCall.args.length, 3, 'method received 3 arguments');
      assert.deepEqual(sample.mocks.translate.translate.firstCall.args[0], text, 'method received correct first argument');
      assert.deepEqual(sample.mocks.translate.translate.firstCall.args[1], {
        to: 'ru',
        from: undefined
      }, 'method received correct second argument');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.strictEqual(callback.firstCall.args[1], sample.mocks.translation, 'callback received result');
      assert(console.log.calledWith('Translated text to %s', 'Russian'));
    });

    it('should handle error', function () {
      var error = 'error';
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        text: text,
        to: 'ru',
        key: key
      };
      sample.mocks.translate.translate = sinon.stub().callsArgWith(2, error);

      sample.program.translateText(options, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert(callback.firstCall.args[0], 'callback received error');
      assert.equal(callback.firstCall.args[0].message, error.message, 'error has correct message');
    });
  });

  describe('main', function () {
    it('should call detectLanguage', function () {
      var program = getSample().program;

      sinon.stub(program, 'detectLanguage');
      program.main(['detect', text, '-k', key]);
      assert(program.detectLanguage.calledOnce);
    });

    it('should call listLanguages', function () {
      var program = getSample().program;

      sinon.stub(program, 'listLanguages');
      program.main(['list', '-k', key]);
      assert(program.listLanguages.calledOnce);
    });

    it('should call translateText', function () {
      var program = getSample().program;

      sinon.stub(program, 'translateText');
      program.main(['translate', text, '-k', key, '-t', 'ru']);
      assert(program.translateText.calledOnce);
    });
  });
});
