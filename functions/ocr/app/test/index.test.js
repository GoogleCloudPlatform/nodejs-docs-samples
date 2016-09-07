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

var bucket = 'bucket';
var name = 'name';
var text = 'text';
var filename = 'filename';
var lang = 'lang';
var translation = 'translation';

function getSample () {
  var config = {
    TRANSLATE_API_KEY: 'key',
    RESULT_TOPIC: 'result-topic',
    RESULT_BUCKET: 'result-bucket',
    TRANSLATE_TOPIC: 'translate-topic',
    TRANSLATE: true,
    TO_LANG: ['en', 'fr', 'es', 'ja', 'ru']
  };
  var topic = {
    publish: sinon.stub().callsArg(1)
  };
  topic.get = sinon.stub().callsArgWith(1, null, topic);
  var file = {
    save: sinon.stub().callsArg(1)
  };
  var bucket = {
    file: sinon.stub().returns(file)
  };
  var pubsubMock = {
    topic: sinon.stub().returns(topic)
  };
  var storageMock = {
    bucket: sinon.stub().returns(bucket)
  };
  var visionMock = {
    detectText: sinon.stub().callsArg(1)
  };
  var translateMock = {
    detect: sinon.stub().callsArg(1)
  };
  var PubsubMock = sinon.stub().returns(pubsubMock);
  var StorageMock = sinon.stub().returns(storageMock);
  var VisionMock = sinon.stub().returns(visionMock);
  var TranslateMock = sinon.stub().returns(translateMock);

  return {
    sample: proxyquire('../', {
      '@google-cloud/translate': TranslateMock,
      '@google-cloud/vision': VisionMock,
      '@google-cloud/pubsub': PubsubMock,
      '@google-cloud/storage': StorageMock,
      './config.json': config
    }),
    mocks: {
      pubsub: pubsubMock,
      storage: storageMock,
      bucket: bucket,
      file: file,
      vision: visionMock,
      translate: translateMock,
      topic: topic
    }
  };
}

function getMockContext () {
  return {
    done: sinon.stub(),
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

describe('functions:ocr', function () {
  it('processImage does nothing on delete', function () {
    var context = getMockContext();

    getSample().sample.processImage(context, {
      timeDeleted: 1234
    });

    assert.equal(context.done.calledOnce, true);
    assert.equal(context.failure.called, false);
    assert.equal(context.success.called, false);
  });

  it('processImage fails without a bucket', function () {
    var expectedMsg = 'Bucket not provided. Make sure you have a ' +
      '"bucket" property in your request';
    var context = getMockContext();

    getSample().sample.processImage(context, {});

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(console.error.called, true);
  });

  it('processImage fails without a name', function () {
    var expectedMsg = 'Filename not provided. Make sure you have a ' +
      '"name" property in your request';
    var context = getMockContext();

    getSample().sample.processImage(context, {
      bucket: bucket
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(console.error.called, true);
  });

  it('processImage handles detectText error', function (done) {
    var expectedMsg = 'error';
    var context = {
      success: assert.fail,
      failure: function () {
        assert.equal(context.failure.calledOnce, true);
        assert.equal(context.failure.firstCall.args[0], expectedMsg);
        assert.equal(context.success.called, false);
        assert.equal(console.error.calledWith(expectedMsg), true);
        done();
      }
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.mocks.vision.detectText = sinon.stub().callsArgWith(1, expectedMsg);
    ocrSample.sample.processImage(context, {
      bucket: bucket,
      name: name
    });
  });

  it('processImage processes an image', function (done) {
    var context = {
      success: function () {
        assert.equal(context.success.calledOnce, true);
        assert.equal(context.failure.called, false);
        assert.equal(console.log.calledWith('Processed ' + name), true);
        done();
      },
      failure: assert.fail
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.mocks.vision.detectText = sinon.stub().callsArgWith(1, null, [
      text
    ], {});
    ocrSample.mocks.translate.detect = sinon.stub().callsArgWith(1, null, {
      language: 'ja'
    });
    ocrSample.sample.processImage(context, {
      bucket: bucket,
      name: name
    });
  });

  it('translateText fails without text', function () {
    var expectedMsg = 'Text not provided. Make sure you have a ' +
      '"text" property in your request';
    var context = getMockContext();

    getSample().sample.translateText(context, {});

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(console.error.called, true);
  });

  it('translateText fails without a filename', function () {
    var expectedMsg = 'Filename not provided. Make sure you have a ' +
      '"filename" property in your request';
    var context = getMockContext();

    getSample().sample.translateText(context, {
      text: text
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(console.error.called, true);
  });

  it('translateText fails without a lang', function () {
    var expectedMsg = 'Language not provided. Make sure you have a ' +
      '"lang" property in your request';
    var context = getMockContext();

    getSample().sample.translateText(context, {
      text: text,
      filename: filename
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(console.error.called, true);
  });

  it('translateText handles translation error', function (done) {
    var expectedMsg = 'error';
    var context = {
      success: assert.fail,
      failure: function () {
        assert.equal(context.failure.calledOnce, true);
        assert.equal(context.failure.firstCall.args[0], expectedMsg);
        assert.equal(context.success.called, false);
        assert.equal(console.error.calledWith(expectedMsg), true);
        done();
      }
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.mocks.translate.translate = sinon.stub().callsArgWith(2, expectedMsg);
    ocrSample.sample.translateText(context, {
      text: text,
      filename: filename,
      lang: lang
    });
  });

  it('translateText handles get topic error', function (done) {
    var expectedMsg = 'error';
    var context = {
      success: assert.fail,
      failure: function () {
        assert.equal(context.failure.calledOnce, true);
        assert.equal(context.failure.firstCall.args[0], expectedMsg);
        assert.equal(context.success.called, false);
        assert.equal(console.error.calledWith(expectedMsg), true);
        done();
      }
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.mocks.translate.translate = sinon.stub().callsArgWith(2, null, translation);
    ocrSample.mocks.topic.get = sinon.stub().callsArgWith(1, expectedMsg);
    ocrSample.sample.translateText(context, {
      text: text,
      filename: filename,
      lang: lang
    });
  });

  it('translateText handles publish error', function (done) {
    var expectedMsg = 'error';
    var context = {
      success: assert.fail,
      failure: function () {
        assert.equal(context.failure.calledOnce, true);
        assert.equal(context.failure.firstCall.args[0], expectedMsg);
        assert.equal(context.success.called, false);
        assert.equal(console.error.calledWith(expectedMsg), true);
        done();
      }
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.mocks.translate.translate = sinon.stub().callsArgWith(2, null, translation);
    ocrSample.mocks.topic.publish = sinon.stub().callsArgWith(1, expectedMsg);
    ocrSample.sample.translateText(context, {
      text: text,
      filename: filename,
      lang: lang
    });
  });

  it('translateText translates and publishes text', function (done) {
    var context = {
      success: function () {
        assert.equal(context.success.called, true);
        assert.equal(context.failure.called, false);
        assert.equal(console.log.calledWith('Text translated to ' + lang), true);
        done();
      },
      failure: assert.fail
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.mocks.translate.translate = sinon.stub().callsArgWith(2, null, translation);
    ocrSample.sample.translateText(context, {
      text: text,
      filename: filename,
      lang: lang
    });
  });

  it('saveResult fails without text', function () {
    var expectedMsg = 'Text not provided. Make sure you have a ' +
      '"text" property in your request';
    var context = getMockContext();

    getSample().sample.saveResult(context, {});

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(console.error.called, true);
  });

  it('saveResult fails without a filename', function () {
    var expectedMsg = 'Filename not provided. Make sure you have a ' +
      '"filename" property in your request';
    var context = getMockContext();

    getSample().sample.saveResult(context, {
      text: text
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(console.error.called, true);
  });

  it('saveResult fails without a lang', function () {
    var expectedMsg = 'Language not provided. Make sure you have a ' +
      '"lang" property in your request';
    var context = getMockContext();

    getSample().sample.saveResult(context, {
      text: text,
      filename: filename
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(console.error.called, true);
  });

  it('saveResult handles save error', function (done) {
    var expectedMsg = 'error';
    var context = {
      success: assert.fail,
      failure: function () {
        assert.equal(context.failure.calledOnce, true);
        assert.equal(context.failure.firstCall.args[0], expectedMsg);
        assert.equal(context.success.called, false);
        assert.equal(console.error.calledWith(expectedMsg), true);
        done();
      }
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.mocks.file.save = sinon.stub().callsArgWith(1, expectedMsg);
    ocrSample.sample.saveResult(context, {
      text: text,
      filename: filename,
      lang: lang
    });
  });

  it('saveResult translates and publishes text', function (done) {
    var context = {
      success: function () {
        assert.equal(context.success.called, true);
        assert.equal(context.failure.called, false);
        assert.equal(console.log.calledWith('Text written to ' + filename + '_to_lang.txt'), true);
        done();
      },
      failure: assert.fail
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.sample.saveResult(context, {
      text: text,
      filename: filename,
      lang: lang
    });
  });

  it('saveResult translates and publishes text with dot in filename', function (done) {
    var context = {
      success: function () {
        assert.equal(context.success.called, true);
        assert.equal(context.failure.called, false);
        assert.equal(console.log.calledWith('Text written to ' + filename + '_to_lang.txt'), true);
        done();
      },
      failure: assert.fail
    };

    sinon.spy(context, 'success');
    sinon.spy(context, 'failure');

    var ocrSample = getSample();
    ocrSample.sample.saveResult(context, {
      text: text,
      filename: filename + '.jpg',
      lang: lang
    });
  });
});

