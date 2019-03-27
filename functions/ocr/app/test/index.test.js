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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const Buffer = require('safe-buffer').Buffer;

const bucketName = 'my-bucket';
const filename = 'image.jpg';
const text = 'text';
const lang = 'lang';
const translation = 'translation';

function getSample() {
  const config = {
    RESULT_TOPIC: 'result-topic',
    RESULT_BUCKET: 'result-bucket',
    TRANSLATE_TOPIC: 'translate-topic',
    TO_LANG: ['en', 'fr', 'es', 'ja', 'ru'],
  };
  const topic = {
    publish: sinon.stub().returns(Promise.resolve([])),
  };
  topic.get = sinon.stub().returns(Promise.resolve([topic]));
  topic.publisher = sinon.stub().returns(topic);

  const file = {
    save: sinon.stub().returns(Promise.resolve([])),
    bucket: bucketName,
    name: filename,
  };
  const bucket = {
    file: sinon.stub().returns(file),
  };
  const pubsubMock = {
    topic: sinon.stub().returns(topic),
  };
  const storageMock = {
    bucket: sinon.stub().returns(bucket),
  };
  const visionMock = {
    textDetection: sinon
      .stub()
      .returns(Promise.resolve([{textAnnotations: [{description: text}]}])),
  };
  const translateMock = {
    detect: sinon.stub().returns(Promise.resolve([{language: 'ja'}])),
    translate: sinon.stub().returns(Promise.resolve([translation])),
  };

  const PubsubMock = sinon.stub().returns(pubsubMock);
  const StorageMock = sinon.stub().returns(storageMock);

  const stubConstructor = (packageName, property, mocks) => {
    let stubInstance = sinon.createStubInstance(
      require(packageName)[property],
      mocks
    );
    stubInstance = Object.assign(stubInstance, mocks);

    const out = {};
    out[property] = sinon.stub().returns(stubInstance);
    return out;
  };

  const visionStub = stubConstructor(
    '@google-cloud/vision',
    'ImageAnnotatorClient',
    visionMock
  );
  const translateStub = stubConstructor(
    '@google-cloud/translate',
    'Translate',
    translateMock
  );

  return {
    program: proxyquire('../', {
      '@google-cloud/translate': translateStub,
      '@google-cloud/vision': visionStub,
      '@google-cloud/pubsub': {PubSub: PubsubMock},
      '@google-cloud/storage': {Storage: StorageMock},
      './config.json': config,
    }),
    mocks: {
      config,
      pubsub: pubsubMock,
      storage: storageMock,
      bucket: bucket,
      file,
      vision: visionMock,
      translate: translateMock,
      topic,
    },
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('processImage does nothing on delete', async () => {
  await getSample().program.processImage({data: {resourceState: 'not_exists'}});
});

it('processImage fails without a bucket', async () => {
  const error = new Error(
    'Bucket not provided. Make sure you have a "bucket" property in your request'
  );
  try {
    await getSample().program.processImage({data: {}});
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('processImage fails without a name', async () => {
  const error = new Error(
    'Filename not provided. Make sure you have a "name" property in your request'
  );
  try {
    await getSample().program.processImage({data: {bucket: bucketName}});
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('processImage processes an image with Node 6 arguments', async () => {
  const event = {
    data: {
      bucket: bucketName,
      name: filename,
    },
  };
  const sample = getSample();

  await sample.program.processImage(event);
  assert.strictEqual(console.log.callCount, 4);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `Looking for text in image ${filename}`,
  ]);
  assert.deepStrictEqual(console.log.getCall(1).args, [
    `Extracted text from image (${text.length} chars)`,
  ]);
  assert.deepStrictEqual(console.log.getCall(2).args, [
    `Detected language "ja" for ${filename}`,
  ]);
  assert.deepStrictEqual(console.log.getCall(3).args, [
    `File ${event.data.name} processed.`,
  ]);
});

it('processImage processes an image with Node 8 arguments', async () => {
  const data = {
    bucket: bucketName,
    name: filename,
  };
  const sample = getSample();

  await sample.program.processImage(data);
  assert.strictEqual(console.log.callCount, 4);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `Looking for text in image ${filename}`,
  ]);
  assert.deepStrictEqual(console.log.getCall(1).args, [
    `Extracted text from image (${text.length} chars)`,
  ]);
  assert.deepStrictEqual(console.log.getCall(2).args, [
    `Detected language "ja" for ${filename}`,
  ]);
  assert.deepStrictEqual(console.log.getCall(3).args, [
    `File ${data.name} processed.`,
  ]);
});

it('translateText fails without text', async () => {
  const error = new Error(
    'Text not provided. Make sure you have a "text" property in your request'
  );
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({})).toString('base64'),
    },
  };
  try {
    await getSample().program.translateText(event);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('translateText fails without a filename', async () => {
  const error = new Error(
    'Filename not provided. Make sure you have a "filename" property in your request'
  );
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({text})).toString('base64'),
    },
  };

  try {
    await getSample().program.translateText(event);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('translateText fails without a lang', async () => {
  const error = new Error(
    'Language not provided. Make sure you have a "lang" property in your request'
  );
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({text, filename})).toString('base64'),
    },
  };

  try {
    await getSample().program.translateText(event);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('translateText translates and publishes text with Node 6 arguments', async () => {
  const event = {
    data: {
      data: Buffer.from(
        JSON.stringify({
          text,
          filename,
          lang,
        })
      ).toString('base64'),
    },
  };
  const sample = getSample();

  sample.mocks.translate.translate.returns(Promise.resolve([translation]));

  await sample.program.translateText(event);
  assert.strictEqual(console.log.callCount, 2);
  assert.deepStrictEqual(console.log.firstCall.args, [
    `Translating text into ${lang}`,
  ]);
  assert.deepStrictEqual(console.log.secondCall.args, [
    `Text translated to ${lang}`,
  ]);
});

it('translateText translates and publishes text with Node 8 arguments', async () => {
  const data = {
    data: Buffer.from(
      JSON.stringify({
        text,
        filename,
        lang,
      })
    ).toString('base64'),
  };
  const sample = getSample();

  sample.mocks.translate.translate.returns(Promise.resolve([translation]));

  await sample.program.translateText(data);
  assert.strictEqual(console.log.callCount, 2);
  assert.deepStrictEqual(console.log.firstCall.args, [
    `Translating text into ${lang}`,
  ]);
  assert.deepStrictEqual(console.log.secondCall.args, [
    `Text translated to ${lang}`,
  ]);
});

it('saveResult fails without text', async () => {
  const error = new Error(
    'Text not provided. Make sure you have a "text" property in your request'
  );
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({})).toString('base64'),
    },
  };

  try {
    await getSample().program.saveResult(event);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('saveResult fails without a filename', async () => {
  const error = new Error(
    'Filename not provided. Make sure you have a "filename" property in your request'
  );
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({text})).toString('base64'),
    },
  };

  try {
    await getSample().program.saveResult(event);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('saveResult fails without a lang', async () => {
  const error = new Error(
    'Language not provided. Make sure you have a "lang" property in your request'
  );
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({text, filename})).toString('base64'),
    },
  };

  try {
    await getSample().program.saveResult(event);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('saveResult translates and publishes text with Node 6 arguments', async () => {
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({text, filename, lang})).toString(
        'base64'
      ),
    },
  };
  const sample = getSample();

  await sample.program.saveResult(event);
  assert.strictEqual(console.log.callCount, 3);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `Received request to save file ${filename}`,
  ]);
  assert.deepStrictEqual(console.log.getCall(1).args, [
    `Saving result to ${filename}_to_${lang}.txt in bucket ${
      sample.mocks.config.RESULT_BUCKET
    }`,
  ]);
  assert.deepStrictEqual(console.log.getCall(2).args, ['File saved.']);
});

it('saveResult translates and publishes text with Node 8 arguments', async () => {
  const data = {
    data: Buffer.from(JSON.stringify({text, filename, lang})).toString(
      'base64'
    ),
  };
  const sample = getSample();

  await sample.program.saveResult(data);
  assert.strictEqual(console.log.callCount, 3);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `Received request to save file ${filename}`,
  ]);
  assert.deepStrictEqual(console.log.getCall(1).args, [
    `Saving result to ${filename}_to_${lang}.txt in bucket ${
      sample.mocks.config.RESULT_BUCKET
    }`,
  ]);
  assert.deepStrictEqual(console.log.getCall(2).args, ['File saved.']);
});

it('saveResult translates and publishes text with dot in filename', async () => {
  const event = {
    data: {
      data: Buffer.from(
        JSON.stringify({text, filename: `${filename}.jpg`, lang})
      ).toString('base64'),
    },
  };
  const sample = getSample();

  await sample.program.saveResult(event);
  assert.strictEqual(console.log.callCount, 3);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `Received request to save file ${filename}.jpg`,
  ]);
  assert.deepStrictEqual(console.log.getCall(1).args, [
    `Saving result to ${filename}.jpg_to_${lang}.txt in bucket ${
      sample.mocks.config.RESULT_BUCKET
    }`,
  ]);
  assert.deepStrictEqual(console.log.getCall(2).args, ['File saved.']);
});
