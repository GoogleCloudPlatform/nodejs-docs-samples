// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

require('..');

const assert = require('assert');
const sinon = require('sinon');
const {CloudEvent} = require('cloudevents');

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

process.env.GCP_PROJECT = 'nodejs-docs-samples-tests';
process.env.FUNCTIONS_BUCKET = 'nodejs-docs-samples-tests';
process.env.TRANSLATE_TOPIC = 'integration-tests-instance';
process.env.RESULT_TOPIC = 'integration-tests-instance';
process.env.RESULT_BUCKET = 'nodejs-docs-samples-tests';
process.env.TO_LANG = 'en,es';

const filename = 'wakeupcat.jpg';
const text = 'Wake up human!';
const lang = 'en';
const {RESULT_BUCKET, FUNCTIONS_BUCKET} = process.env;

const supertest = require('supertest');
const {getTestServer} = require('@google-cloud/functions-framework/testing');

const errorMsg = (name, propertyName) => {
  propertyName = propertyName || name.toLowerCase();
  return `${name} not provided. Make sure you have a "${propertyName}" property in your request`;
};

const stubConsole = function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
};

const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};

beforeEach(stubConsole);
afterEach(restoreConsole);

describe('processImage', () => {
  describe('functions_ocr_process', () => {
    it('processImage validates parameters', async () => {
      const cloudEvent = new CloudEvent({
        data: {},
        source: 'tests',
        type: 'google.cloud.storage.object.v1.finalized',
      });
      const server = getTestServer('processImage');
      await supertest(server)
        .post('/')
        .send(cloudEvent)
        .expect(500)
        .expect(errorMsg('Bucket'));
    });
  });

  describe('functions_ocr_process functions_ocr_detect', () => {
    it('processImage detects text', async () => {
      const cloudEvent = new CloudEvent({
        data: {
          bucket: FUNCTIONS_BUCKET,
          name: filename,
        },
        source: 'tests',
        type: 'google.cloud.storage.object.v1.finalized',
      });

      const server = getTestServer('processImage');
      await supertest(server).post('/').send(cloudEvent);
      assert.ok(
        console.log.calledWith(`Looking for text in image ${filename}`)
      );
      assert.ok(console.log.calledWith('Extracted text from image:', text));
      assert.ok(
        console.log.calledWith(`Detected language "en" for ${filename}`)
      );
    });
  });
});

describe('translateText', () => {
  describe('functions_ocr_translate', () => {
    it('translateText validates parameters', async () => {
      const cloudEvent = new CloudEvent({
        data: {
          message: Buffer.from(JSON.stringify({})).toString('base64'),
        },
        source: 'tests',
        type: 'google.cloud.storage.object.v1.finalized',
      });
      const server = getTestServer('translateText');
      await supertest(server)
        .post('/')
        .send(cloudEvent)
        .expect(500)
        .expect(errorMsg('Text'));
    });
  });

  describe('functions_ocr_translate', () => {
    it('translateText translates and publishes text', async () => {
      const cloudEvent = new CloudEvent({
        data: {
          message: Buffer.from(
            JSON.stringify({
              text,
              filename,
              lang,
            })
          ).toString('base64'),
        },
        source: 'tests',
        type: 'google.cloud.storage.object.v1.finalized',
      });

      const server = getTestServer('translateText');
      await supertest(server).post('/').send(cloudEvent);
      assert.ok(console.log.calledWith(`Translating text into ${lang}`));
      assert.ok(console.log.calledWith(`Text translated to ${lang}`));
    });
  });
});
describe('saveResult', () => {
  describe('functions_ocr_save', () => {
    it('saveResult validates parameters', async () => {
      const cloudEvent = new CloudEvent({
        data: {
          message: Buffer.from(JSON.stringify({text, filename})).toString(
            'base64'
          ),
        },
        source: 'tests',
        type: 'google.cloud.storage.object.v1.finalized',
      });

      const server = getTestServer('saveResult');
      await supertest(server)
        .post('/')
        .send(cloudEvent)
        .expect(500)
        .expect(res => {
          assert.strictEqual(res.error.text, errorMsg('Language', 'lang'));
        });
    });
  });

  describe('functions_ocr_save', () => {
    it('saveResult translates and publishes text', async () => {
      const cloudEvent = new CloudEvent({
        data: {
          message: Buffer.from(JSON.stringify({text, filename, lang})).toString(
            'base64'
          ),
        },
        source: 'tests',
        type: 'google.cloud.storage.object.v1.finalized',
      });

      const newFilename = `${filename}_to_${lang}.txt`;

      const server = getTestServer('saveResult');
      await supertest(server).post('/').send(cloudEvent);
      assert.ok(
        console.log.calledWith(`Received request to save file ${filename}`)
      );
      assert.ok(
        console.log.calledWith(
          `Saving result to ${newFilename} in bucket ${RESULT_BUCKET}`
        )
      );

      // Check file was actually saved
      assert.ok(storage.bucket(RESULT_BUCKET).file(newFilename).exists());
    });
  });
});
