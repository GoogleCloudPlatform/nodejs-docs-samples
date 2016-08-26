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
var text = 'President Obama is speaking at the White House.';
var bucketName = 'foo';
var fileName = 'file.txt';
var language = 'en';
var type = 'text';

function getSample () {
  var sentimentMock = {
    polarity: -10,
    magnitude: 2
  };
  var entitiesMock = {
    foo: []
  };
  var syntaxMock = {};
  var fileMock = {};
  var documentMock = {
    detectSentiment: sinon.stub().yields(null, sentimentMock),
    detectEntities: sinon.stub().yields(null, entitiesMock),
    annotate: sinon.stub().yields(null, undefined, syntaxMock)
  };
  var languageMock = {
    document: sinon.stub().returns(documentMock)
  };
  var bucketMock = {
    file: sinon.stub().returns(fileMock)
  };
  var storageMock = {
    bucket: sinon.stub().returns(bucketMock)
  };
  var LanguageMock = sinon.stub().returns(languageMock);
  var StorageMock = sinon.stub().returns(storageMock);

  return {
    program: proxyquire('../analyze', {
      '@google-cloud/language': LanguageMock,
      '@google-cloud/storage': StorageMock
    }),
    mocks: {
      Language: LanguageMock,
      language: languageMock,
      Storage: StorageMock,
      storage: storageMock,
      document: documentMock,
      sentiment: sentimentMock,
      file: fileMock,
      bucket: bucketMock,
      entities: entitiesMock,
      syntax: syntaxMock
    }
  };
}

describe('language:analyze', function () {
  describe('analyzeSentiment', function () {
    it('should analyze sentiment in text', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.analyzeSentiment(text, {
        type: type,
        language: language
      }, callback);

      assert.equal(sample.mocks.language.document.calledOnce, true);
      assert.deepEqual(sample.mocks.language.document.firstCall.args, [{
        content: text,
        type: type,
        language: language
      }]);
      assert.equal(sample.mocks.document.detectSentiment.calledOnce, true);
      assert.deepEqual(sample.mocks.document.detectSentiment.firstCall.args.slice(0, -1), [{ verbose: true }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.sentiment]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %s sentiment', sample.mocks.sentiment.polarity >= 0 ? 'positive' : 'negative']);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.document.detectSentiment.yields(error);

      sample.program.analyzeSentiment(text, {
        type: type,
        language: language
      }, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('analyzeSentimentFromFile', function () {
    it('should analyze sentiment in text', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.analyzeSentimentFromFile(bucketName, fileName, {
        type: type,
        language: language
      }, callback);

      assert.equal(sample.mocks.language.document.calledOnce, true);
      assert.deepEqual(sample.mocks.language.document.firstCall.args, [{
        content: sample.mocks.file,
        type: type,
        language: language
      }]);
      assert.equal(sample.mocks.document.detectSentiment.calledOnce, true);
      assert.deepEqual(sample.mocks.document.detectSentiment.firstCall.args.slice(0, -1), [{ verbose: true }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.sentiment]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %s sentiment', sample.mocks.sentiment.polarity >= 0 ? 'positive' : 'negative']);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.document.detectSentiment.yields(error);

      sample.program.analyzeSentimentFromFile(bucketName, fileName, {
        type: type,
        language: language
      }, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('analyzeEntities', function () {
    it('should analyze entities in text', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.analyzeEntities(text, {
        type: type,
        language: language
      }, callback);

      assert.equal(sample.mocks.language.document.calledOnce, true);
      assert.deepEqual(sample.mocks.language.document.firstCall.args, [{
        content: text,
        type: type,
        language: language
      }]);
      assert.equal(sample.mocks.document.detectEntities.calledOnce, true);
      assert.deepEqual(sample.mocks.document.detectEntities.firstCall.args.slice(0, -1), [{ verbose: true }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.entities]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d entity type(s)!', Object.keys(sample.mocks.entities).length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.document.detectEntities.yields(error);

      sample.program.analyzeEntities(text, {
        type: type,
        language: language
      }, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('analyzeEntitiesFromFile', function () {
    it('should analyze sentiment in text', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.analyzeEntitiesFromFile(bucketName, fileName, {
        type: type,
        language: language
      }, callback);

      assert.equal(sample.mocks.language.document.calledOnce, true);
      assert.deepEqual(sample.mocks.language.document.firstCall.args, [{
        content: sample.mocks.file,
        type: type,
        language: language
      }]);
      assert.equal(sample.mocks.document.detectEntities.calledOnce, true);
      assert.deepEqual(sample.mocks.document.detectEntities.firstCall.args.slice(0, -1), [{ verbose: true }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.entities]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d entity type(s)!', Object.keys(sample.mocks.entities).length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.document.detectEntities.yields(error);

      sample.program.analyzeEntitiesFromFile(bucketName, fileName, {
        type: type,
        language: language
      }, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('analyzeSyntax', function () {
    it('should analyze syntax in text', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.analyzeSyntax(text, {
        type: type,
        language: language
      }, callback);

      assert.equal(sample.mocks.language.document.calledOnce, true);
      assert.deepEqual(sample.mocks.language.document.firstCall.args, [{
        content: text,
        type: type,
        language: language
      }]);
      assert.equal(sample.mocks.document.annotate.calledOnce, true);
      assert.deepEqual(sample.mocks.document.annotate.firstCall.args.slice(0, -1), [{ syntax: true }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.syntax]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Done analyzing syntax']);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.document.annotate.yields(error);

      sample.program.analyzeSyntax(text, {
        type: type,
        language: language
      }, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('analyzeSyntaxFromFile', function () {
    it('should analyze syntax in text', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.analyzeSyntaxFromFile(bucketName, fileName, {
        type: type,
        language: language
      }, callback);

      assert.equal(sample.mocks.language.document.calledOnce, true);
      assert.deepEqual(sample.mocks.language.document.firstCall.args, [{
        content: sample.mocks.file,
        type: type,
        language: language
      }]);
      assert.equal(sample.mocks.document.annotate.calledOnce, true);
      assert.deepEqual(sample.mocks.document.annotate.firstCall.args.slice(0, -1), [{ syntax: true }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.syntax]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Done analyzing syntax']);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.document.annotate.yields(error);

      sample.program.analyzeSyntaxFromFile(bucketName, fileName, {
        type: type,
        language: language
      }, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('main', function () {
    it('should call analyzeSentiment', function () {
      var program = getSample().program;

      sinon.stub(program, 'analyzeSentiment');
      program.main(['sentiment', text]);
      assert.equal(program.analyzeSentiment.calledOnce, true);
      assert.deepEqual(program.analyzeSentiment.firstCall.args.slice(0, -1), [text, {
        type: 'text',
        language: undefined
      }]);
    });

    it('should call analyzeSentimentFromFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'analyzeSentimentFromFile');
      program.main(['sentimentFromFile', bucketName, fileName]);
      assert.equal(program.analyzeSentimentFromFile.calledOnce, true);
      assert.deepEqual(program.analyzeSentimentFromFile.firstCall.args.slice(0, -1), [bucketName, fileName, {
        type: 'text',
        language: undefined
      }]);
    });

    it('should call analyzeEntities', function () {
      var program = getSample().program;

      sinon.stub(program, 'analyzeEntities');
      program.main(['entities', text]);
      assert.equal(program.analyzeEntities.calledOnce, true);
      assert.deepEqual(program.analyzeEntities.firstCall.args.slice(0, -1), [text, {
        type: 'text',
        language: undefined
      }]);
    });

    it('should call analyzeEntitiesFromFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'analyzeEntitiesFromFile');
      program.main(['entitiesFromFile', bucketName, fileName]);
      assert.equal(program.analyzeEntitiesFromFile.calledOnce, true);
      assert.deepEqual(program.analyzeEntitiesFromFile.firstCall.args.slice(0, -1), [bucketName, fileName, {
        type: 'text',
        language: undefined
      }]);
    });

    it('should call analyzeSyntax', function () {
      var program = getSample().program;

      sinon.stub(program, 'analyzeSyntax');
      program.main(['syntax', text]);
      assert.equal(program.analyzeSyntax.calledOnce, true);
      assert.deepEqual(program.analyzeSyntax.firstCall.args.slice(0, -1), [text, {
        type: 'text',
        language: undefined
      }]);
    });

    it('should call analyzeSyntaxFromFile', function () {
      var program = getSample().program;

      sinon.stub(program, 'analyzeSyntaxFromFile');
      program.main(['syntaxFromFile', bucketName, fileName]);
      assert.equal(program.analyzeSyntaxFromFile.calledOnce, true);
      assert.deepEqual(program.analyzeSyntaxFromFile.firstCall.args.slice(0, -1), [bucketName, fileName, {
        type: 'text',
        language: undefined
      }]);
    });
  });
});
