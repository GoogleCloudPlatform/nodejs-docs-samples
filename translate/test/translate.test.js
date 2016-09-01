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

var ISO6391 = require('iso-639-1');
var proxyquire = require('proxyquire').noCallThru();

var text = 'Hello world!';
var apiKey = 'key';
var target = 'es';
var toLang = 'ru';

function getSample () {
  var apiResponseMock = {};
  var languagesMock = [
    'en',
    toLang
  ];
  var resultMock = {
    language: 'en',
    confidence: 0.75,
    input: text
  };
  var translationMock = 'Привет мир!';
  var translateMock = {
    getLanguages: sinon.stub().yields(null, languagesMock, apiResponseMock),
    detect: sinon.stub().yields(null, resultMock, apiResponseMock),
    translate: sinon.stub().yields(null, translationMock, apiResponseMock)
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
      translation: translationMock,
      apiResponse: apiResponseMock
    }
  };
}

describe('translate:translate', function () {
  describe('detectLanguage', function () {
    it('should detect language', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.detectLanguage(text, callback);

      assert.equal(sample.mocks.translate.detect.calledOnce, true);
      assert.deepEqual(sample.mocks.translate.detect.firstCall.args.slice(0, -1), [text]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.result, sample.mocks.apiResponse]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Detected language(s):', sample.mocks.result]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.translate.detect.yields(error);

      sample.program.detectLanguage(text, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('listLanguages', function () {
    it('should list languages', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listLanguages(callback);

      assert.equal(sample.mocks.translate.getLanguages.calledOnce, true);
      assert.deepEqual(sample.mocks.translate.getLanguages.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.languages, sample.mocks.apiResponse]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d language(s)!', sample.mocks.languages.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.translate.getLanguages.yields(error);

      sample.program.listLanguages(callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('listLanguagesWithTarget', function () {
    it('should list languages', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listLanguagesWithTarget(target, callback);

      assert.equal(sample.mocks.translate.getLanguages.calledOnce, true);
      assert.deepEqual(sample.mocks.translate.getLanguages.firstCall.args.slice(0, -1), [target]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.languages, sample.mocks.apiResponse]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d language(s)!', sample.mocks.languages.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.translate.getLanguages.yields(error);

      sample.program.listLanguagesWithTarget(target, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('translateText', function () {
    it('should translate text', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.translateText(text, toLang, undefined, callback);

      assert.equal(sample.mocks.translate.translate.calledOnce, true);
      assert.deepEqual(sample.mocks.translate.translate.firstCall.args.slice(0, -1), [text, { to: toLang, from: undefined }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.translation, sample.mocks.apiResponse]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Translated to %s:', ISO6391.getName(toLang)]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.translate.translate.yields(error);

      sample.program.translateText(text, toLang, undefined, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('main', function () {
    it('should call detectLanguage', function () {
      var program = getSample().program;

      sinon.stub(program, 'detectLanguage');
      program.main(['detect', text]);
      assert.equal(program.detectLanguage.calledOnce, true);
      assert.deepEqual(program.detectLanguage.firstCall.args.slice(0, -1), [[text]]);
    });

    describe('detectLanguage with inline API key', function () {
      var originalApiKey;

      before(function () {
        originalApiKey = process.env.TRANSLATE_API_KEY;
        delete process.env.TRANSLATE_API_KEY;
      });

      after(function () {
        process.env.TRANSLATE_API_KEY = originalApiKey;
      });

      it('should set env var from option', function () {
        var program = getSample().program;

        sinon.stub(program, 'detectLanguage');
        assert.equal(process.env.TRANSLATE_API_KEY, undefined);
        program.main(['detect', text, '-k', apiKey]);
        assert.equal(process.env.TRANSLATE_API_KEY, apiKey);
        assert.equal(program.detectLanguage.calledOnce, true);
        assert.deepEqual(program.detectLanguage.firstCall.args.slice(0, -1), [[text]]);
      });
    });

    it('should call listLanguages', function () {
      var program = getSample().program;

      sinon.stub(program, 'listLanguages');
      program.main(['list']);
      assert.equal(program.listLanguages.calledOnce, true);
      assert.deepEqual(program.listLanguages.firstCall.args.slice(0, -1), []);
    });

    it('should call listLanguagesWithTarget', function () {
      var program = getSample().program;

      sinon.stub(program, 'listLanguagesWithTarget');
      program.main(['list', target]);
      assert.equal(program.listLanguagesWithTarget.calledOnce, true);
      assert.deepEqual(program.listLanguagesWithTarget.firstCall.args.slice(0, -1), [target]);
    });

    describe('listLanguagesWithTarget with inline API key', function () {
      var originalApiKey;

      before(function () {
        originalApiKey = process.env.TRANSLATE_API_KEY;
        delete process.env.TRANSLATE_API_KEY;
      });

      after(function () {
        process.env.TRANSLATE_API_KEY = originalApiKey;
      });

      it('should set env var from option', function () {
        var program = getSample().program;

        sinon.stub(program, 'listLanguagesWithTarget');
        assert.equal(process.env.TRANSLATE_API_KEY, undefined);
        program.main(['list', target, '-k', apiKey]);
        assert.equal(process.env.TRANSLATE_API_KEY, apiKey);
        assert.equal(program.listLanguagesWithTarget.calledOnce, true);
        assert.deepEqual(program.listLanguagesWithTarget.firstCall.args.slice(0, -1), [target]);
      });
    });

    it('should call translateText', function () {
      var program = getSample().program;

      sinon.stub(program, 'translateText');
      program.main(['translate', toLang, text]);
      assert.equal(program.translateText.calledOnce, true);
      assert.deepEqual(program.translateText.firstCall.args.slice(0, -1), [[text], toLang, undefined]);
    });

    describe('translateText with inline API key', function () {
      var originalApiKey;

      before(function () {
        originalApiKey = process.env.TRANSLATE_API_KEY;
        delete process.env.TRANSLATE_API_KEY;
      });

      after(function () {
        process.env.TRANSLATE_API_KEY = originalApiKey;
      });

      it('should set env var from option', function () {
        var program = getSample().program;

        sinon.stub(program, 'translateText');
        assert.equal(process.env.TRANSLATE_API_KEY, undefined);
        program.main(['translate', toLang, text, '-k', apiKey]);
        assert.equal(process.env.TRANSLATE_API_KEY, apiKey);
        assert.equal(program.translateText.calledOnce, true);
        assert.deepEqual(program.translateText.firstCall.args.slice(0, -1), [[text], toLang, undefined]);
      });
    });
  });
});
