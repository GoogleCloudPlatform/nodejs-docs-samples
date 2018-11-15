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

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const Buffer = require('safe-buffer').Buffer;

const bucketName = `my-bucket`;
const filename = `image.jpg`;
const text = `text`;
const lang = `lang`;
const translation = `translation`;

function getSample () {
  const config = {
    RESULT_TOPIC: `result-topic`,
    RESULT_BUCKET: `result-bucket`,
    TRANSLATE_TOPIC: `translate-topic`,
    TRANSLATE: true,
    TO_LANG: [`en`, `fr`, `es`, `ja`, `ru`]
  };
  const topic = {
    publish: sinon.stub().returns(Promise.resolve([]))
  };
  topic.get = sinon.stub().returns(Promise.resolve([topic]));
  const file = {
    save: sinon.stub().returns(Promise.resolve([])),
    bucket: bucketName,
    name: filename
  };
  const bucket = {
    file: sinon.stub().returns(file)
  };
  const pubsubMock = {
    topic: sinon.stub().returns(topic)
  };
  const storageMock = {
    bucket: sinon.stub().returns(bucket)
  };
  const visionMock = {
    textDetection: sinon.stub().returns(Promise.resolve([{ textAnnotations: [{ description: text }] }]))
  };
  const translateMock = {
    detect: sinon.stub().returns(Promise.resolve([{ language: `ja` }])),
    translate: sinon.stub().returns(Promise.resolve([translation]))
  };
  const PubsubMock = sinon.stub().returns(pubsubMock);
  const StorageMock = sinon.stub().returns(storageMock);
  const VisionMock = sinon.stub().returns(visionMock);
  const TranslateMock = sinon.stub().returns(translateMock);

  return {
    program: proxyquire(`../`, {
      '@google-cloud/translate': TranslateMock,
      '@google-cloud/vision': VisionMock,
      '@google-cloud/pubsub': PubsubMock,
      '@google-cloud/storage': StorageMock,
      './config.json': config
    }),
    mocks: {
      config,
      pubsub: pubsubMock,
      storage: storageMock,
      bucket: bucket,
      file,
      vision: visionMock,
      translate: translateMock,
      topic
    }
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial(`processImage does nothing on delete`, async (t) => {
  t.plan(0);
  await getSample().program.processImage({ data: { resourceState: `not_exists` } });
});

test.serial(`processImage fails without a bucket`, async (t) => {
  const error = new Error(`Bucket not provided. Make sure you have a "bucket" property in your request`);
  const err = await t.throws(getSample().program.processImage({ data: {} }));
  t.deepEqual(err, error);
});

test.serial(`processImage fails without a name`, async (t) => {
  const error = new Error(`Filename not provided. Make sure you have a "name" property in your request`);
  const err = await t.throws(getSample().program.processImage({ data: { bucket: bucketName } }));
  t.deepEqual(err, error);
});

test.serial(`processImage processes an image with Node 6 arguments`, async (t) => {
  const event = {
    data: {
      bucket: bucketName,
      name: filename
    }
  };
  const sample = getSample();

  await sample.program.processImage(event);
  t.is(console.log.callCount, 4);
  t.deepEqual(console.log.getCall(0).args, [`Looking for text in image ${filename}`]);
  t.deepEqual(console.log.getCall(1).args, [`Extracted text from image (${text.length} chars)`]);
  t.deepEqual(console.log.getCall(2).args, [`Detected language "ja" for ${filename}`]);
  t.deepEqual(console.log.getCall(3).args, [`File ${event.data.name} processed.`]);
});

test.serial(`processImage processes an image with Node 8 arguments`, async (t) => {
  const data = {
    bucket: bucketName,
    name: filename
  };
  const sample = getSample();

  await sample.program.processImage(data);
  t.is(console.log.callCount, 4);
  t.deepEqual(console.log.getCall(0).args, [`Looking for text in image ${filename}`]);
  t.deepEqual(console.log.getCall(1).args, [`Extracted text from image (${text.length} chars)`]);
  t.deepEqual(console.log.getCall(2).args, [`Detected language "ja" for ${filename}`]);
  t.deepEqual(console.log.getCall(3).args, [`File ${data.name} processed.`]);
});

test.serial(`translateText fails without text`, async (t) => {
  const error = new Error(`Text not provided. Make sure you have a "text" property in your request`);
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({})).toString(`base64`)
    }
  };
  const err = await t.throws(getSample().program.translateText(event));
  t.deepEqual(err, error);
});

test.serial(`translateText fails without a filename`, async (t) => {
  const error = new Error(`Filename not provided. Make sure you have a "filename" property in your request`);
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({ text })).toString(`base64`)
    }
  };
  const err = await t.throws(getSample().program.translateText(event));
  t.deepEqual(err, error);
});

test.serial(`translateText fails without a lang`, async (t) => {
  const error = new Error(`Language not provided. Make sure you have a "lang" property in your request`);
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({ text, filename })).toString(`base64`)
    }
  };

  const err = await t.throws(getSample().program.translateText(event));
  t.deepEqual(err, error);
});

test.serial(`translateText translates and publishes text with Node 6 arguments`, async (t) => {
  const event = {
    data: {
      data: Buffer.from(
        JSON.stringify({
          text,
          filename,
          lang
        })
      ).toString(`base64`)
    }
  };
  const sample = getSample();

  sample.mocks.translate.translate.returns(Promise.resolve([translation]));

  await sample.program.translateText(event);
  t.is(console.log.callCount, 2);
  t.deepEqual(console.log.firstCall.args, [`Translating text into ${lang}`]);
  t.deepEqual(console.log.secondCall.args, [`Text translated to ${lang}`]);
});

test.serial(`translateText translates and publishes text with Node 8 arguments`, async (t) => {
  const data = {
    data: Buffer.from(
      JSON.stringify({
        text,
        filename,
        lang
      })
    ).toString(`base64`)
  };
  const sample = getSample();

  sample.mocks.translate.translate.returns(Promise.resolve([translation]));

  await sample.program.translateText(data);
  t.is(console.log.callCount, 2);
  t.deepEqual(console.log.firstCall.args, [`Translating text into ${lang}`]);
  t.deepEqual(console.log.secondCall.args, [`Text translated to ${lang}`]);
});

test.serial(`saveResult fails without text`, async (t) => {
  const error = new Error(`Text not provided. Make sure you have a "text" property in your request`);
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({})).toString(`base64`)
    }
  };

  const err = await t.throws(getSample().program.saveResult(event));
  t.deepEqual(err, error);
});

test.serial(`saveResult fails without a filename`, async (t) => {
  const error = new Error(`Filename not provided. Make sure you have a "filename" property in your request`);
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({ text })).toString(`base64`)
    }
  };

  const err = await t.throws(getSample().program.saveResult(event));
  t.deepEqual(err, error);
});

test.serial(`saveResult fails without a lang`, async (t) => {
  const error = new Error(`Language not provided. Make sure you have a "lang" property in your request`);
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({ text, filename })).toString(`base64`)
    }
  };

  const err = await t.throws(getSample().program.saveResult(event));
  t.deepEqual(err, error);
});

test.serial(`saveResult translates and publishes text with Node 6 arguments`, async (t) => {
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({ text, filename, lang })).toString(`base64`)
    }
  };
  const sample = getSample();

  await sample.program.saveResult(event);
  t.is(console.log.callCount, 3);
  t.deepEqual(console.log.getCall(0).args, [`Received request to save file ${filename}`]);
  t.deepEqual(console.log.getCall(1).args, [`Saving result to ${filename}_to_${lang}.txt in bucket ${sample.mocks.config.RESULT_BUCKET}`]);
  t.deepEqual(console.log.getCall(2).args, [`File saved.`]);
});

test.serial(`saveResult translates and publishes text with Node 8 arguments`, async (t) => {
  const data = {
    data: Buffer.from(JSON.stringify({ text, filename, lang })).toString(`base64`)
  };
  const sample = getSample();

  await sample.program.saveResult(data);
  t.is(console.log.callCount, 3);
  t.deepEqual(console.log.getCall(0).args, [`Received request to save file ${filename}`]);
  t.deepEqual(console.log.getCall(1).args, [`Saving result to ${filename}_to_${lang}.txt in bucket ${sample.mocks.config.RESULT_BUCKET}`]);
  t.deepEqual(console.log.getCall(2).args, [`File saved.`]);
});

test.serial(`saveResult translates and publishes text with dot in filename`, async (t) => {
  const event = {
    data: {
      data: Buffer.from(JSON.stringify({ text, filename: `${filename}.jpg`, lang })).toString(`base64`)
    }
  };
  const sample = getSample();

  await sample.program.saveResult(event);
  t.is(console.log.callCount, 3);
  t.deepEqual(console.log.getCall(0).args, [`Received request to save file ${filename}.jpg`]);
  t.deepEqual(console.log.getCall(1).args, [`Saving result to ${filename}.jpg_to_${lang}.txt in bucket ${sample.mocks.config.RESULT_BUCKET}`]);
  t.deepEqual(console.log.getCall(2).args, [`File saved.`]);
});
