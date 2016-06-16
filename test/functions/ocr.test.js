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

var test = require('ava');
var sinon = require('sinon');
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
  var pubsub = {
    topic: sinon.stub().returns(topic)
  };
  var storage = {
    bucket: sinon.stub().returns(bucket)
  };
  var vision = {
    detectText: sinon.stub().callsArg(1)
  };
  var translate = {
    detect: sinon.stub().callsArg(1)
  };
  var gcloud = {
    pubsub: sinon.stub().returns(pubsub),
    storage: sinon.stub().returns(storage),
    vision: sinon.stub().returns(vision),
    translate: sinon.stub().returns(translate)
  };
  return {
    sample: proxyquire('../../functions/ocr/app', {
      gcloud: gcloud,
      './config.json': config
    }),
    mocks: {
      gcloud: gcloud,
      pubsub: pubsub,
      storage: storage,
      bucket: bucket,
      file: file,
      vision: vision,
      translate: translate,
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

test.before(function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
});

test('processImage does nothing on delete', function (t) {
  var context = getMockContext();

  getSample().sample.processImage(context, {
    timeDeleted: 1234
  });

  t.is(context.done.calledOnce, true);
  t.is(context.failure.called, false);
  t.is(context.success.called, false);
});

test('processImage fails without a bucket', function (t) {
  var expectedMsg = 'Bucket not provided. Make sure you have a ' +
    '"bucket" property in your request';
  var context = getMockContext();

  getSample().sample.processImage(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('processImage fails without a name', function (t) {
  var expectedMsg = 'Filename not provided. Make sure you have a ' +
    '"name" property in your request';
  var context = getMockContext();

  getSample().sample.processImage(context, {
    bucket: bucket
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test.cb('processImage handles detectText error', function (t) {
  var expectedMsg = 'error';
  var context = {
    success: t.fail,
    failure: function () {
      t.is(context.failure.calledOnce, true);
      t.is(context.failure.firstCall.args[0], expectedMsg);
      t.is(context.success.called, false);
      t.is(console.error.calledWith(expectedMsg), true);
      t.end();
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

test.cb('processImage processes an image', function (t) {
  var context = {
    success: function () {
      t.is(context.success.calledOnce, true);
      t.is(context.failure.called, false);
      t.is(console.log.calledWith('Processed ' + name), true);
      t.end();
    },
    failure: t.fail
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

test('translateText fails without text', function (t) {
  var expectedMsg = 'Text not provided. Make sure you have a ' +
    '"text" property in your request';
  var context = getMockContext();

  getSample().sample.translateText(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('translateText fails without a filename', function (t) {
  var expectedMsg = 'Filename not provided. Make sure you have a ' +
    '"filename" property in your request';
  var context = getMockContext();

  getSample().sample.translateText(context, {
    text: text
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('translateText fails without a lang', function (t) {
  var expectedMsg = 'Language not provided. Make sure you have a ' +
    '"lang" property in your request';
  var context = getMockContext();

  getSample().sample.translateText(context, {
    text: text,
    filename: filename
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test.cb('translateText handles translation error', function (t) {
  var expectedMsg = 'error';
  var context = {
    success: t.fail,
    failure: function () {
      t.is(context.failure.calledOnce, true);
      t.is(context.failure.firstCall.args[0], expectedMsg);
      t.is(context.success.called, false);
      t.is(console.error.calledWith(expectedMsg), true);
      t.end();
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

test.cb('translateText handles get topic error', function (t) {
  var expectedMsg = 'error';
  var context = {
    success: t.fail,
    failure: function () {
      t.is(context.failure.calledOnce, true);
      t.is(context.failure.firstCall.args[0], expectedMsg);
      t.is(context.success.called, false);
      t.is(console.error.calledWith(expectedMsg), true);
      t.end();
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

test.cb('translateText handles publish error', function (t) {
  var expectedMsg = 'error';
  var context = {
    success: t.fail,
    failure: function () {
      t.is(context.failure.calledOnce, true);
      t.is(context.failure.firstCall.args[0], expectedMsg);
      t.is(context.success.called, false);
      t.is(console.error.calledWith(expectedMsg), true);
      t.end();
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

test.cb('translateText translates and publishes text', function (t) {
  var context = {
    success: function () {
      t.is(context.success.called, true);
      t.is(context.failure.called, false);
      t.is(console.log.calledWith('Text translated to ' + lang), true);
      t.end();
    },
    failure: t.fail
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

test('saveResult fails without text', function (t) {
  var expectedMsg = 'Text not provided. Make sure you have a ' +
    '"text" property in your request';
  var context = getMockContext();

  getSample().sample.saveResult(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('saveResult fails without a filename', function (t) {
  var expectedMsg = 'Filename not provided. Make sure you have a ' +
    '"filename" property in your request';
  var context = getMockContext();

  getSample().sample.saveResult(context, {
    text: text
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('saveResult fails without a lang', function (t) {
  var expectedMsg = 'Language not provided. Make sure you have a ' +
    '"lang" property in your request';
  var context = getMockContext();

  getSample().sample.saveResult(context, {
    text: text,
    filename: filename
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test.cb('saveResult handles save error', function (t) {
  var expectedMsg = 'error';
  var context = {
    success: t.fail,
    failure: function () {
      t.is(context.failure.calledOnce, true);
      t.is(context.failure.firstCall.args[0], expectedMsg);
      t.is(context.success.called, false);
      t.is(console.error.calledWith(expectedMsg), true);
      t.end();
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

test.cb('saveResult translates and publishes text', function (t) {
  var context = {
    success: function () {
      t.is(context.success.called, true);
      t.is(context.failure.called, false);
      t.is(console.log.calledWith('Text written to ' + filename + '_to_lang.txt'), true);
      t.end();
    },
    failure: t.fail
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

test.cb('saveResult translates and publishes text with dot in filename', function (t) {
  var context = {
    success: function () {
      t.is(context.success.called, true);
      t.is(context.failure.called, false);
      t.is(console.log.calledWith('Text written to ' + filename + '_to_lang.txt'), true);
      t.end();
    },
    failure: t.fail
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

test.after(function () {
  console.error.restore();
  console.log.restore();
});
