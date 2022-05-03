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

const assert = require('assert');
const sinon = require('sinon');

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const bucketName = process.env.FUNCTIONS_BUCKET;
const filename = 'wakeupcat.jpg';
const text = 'Wake up human!';
const lang = 'en';

const {RESULT_BUCKET} = process.env;

const program = require('..');

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
      try {
        await program.processImage({data: {}});
        assert.fail('no error thrown');
      } catch (err) {
        assert.strictEqual(err.message, errorMsg('Bucket'));
      }
    });
  });

  describe('functions_ocr_process functions_ocr_detect', () => {
    it('processImage detects text', async () => {
      const data = {
        bucket: bucketName,
        name: filename,
      };

      await program.processImage(data);
      assert.ok(
        console.log.calledWith(`Detected language "en" for ${filename}`)
      );
      assert.ok(console.log.calledWith('Extracted text from image:', text));
      assert.ok(
        console.log.calledWith(`Detected language "en" for ${filename}`)
      );
      assert.ok(console.log.calledWith(`File ${filename} processed.`));
    });
  });
});

describe('translateText', () => {
  describe('functions_ocr_translate', () => {
    it('translateText validates parameters', async () => {
      const event = {
        data: Buffer.from(JSON.stringify({})).toString('base64'),
      };
      try {
        await program.translateText(event);
        assert.fail('no error thrown');
      } catch (err) {
        assert.deepStrictEqual(err.message, errorMsg('Text'));
      }
    });
  });

  describe('functions_ocr_translate', () => {
    it('translateText translates and publishes text', async () => {
      const data = {
        data: Buffer.from(
          JSON.stringify({
            text,
            filename,
            lang,
          })
        ).toString('base64'),
      };

      await program.translateText(data);
      assert.ok(console.log.calledWith(`Translating text into ${lang}`));
      assert.ok(console.log.calledWith(`Text translated to ${lang}`));
    });
  });
});

describe('saveResult', () => {
  describe('functions_ocr_save', () => {
    it('saveResult validates parameters', async () => {
      const event = {
        data: Buffer.from(JSON.stringify({text, filename})).toString('base64'),
      };

      try {
        await program.saveResult(event);
        assert.fail('no error thrown');
      } catch (err) {
        assert.deepStrictEqual(err.message, errorMsg('Language', 'lang'));
      }
    });
  });

  describe('functions_ocr_save', () => {
    it('saveResult translates and publishes text', async () => {
      const data = {
        data: Buffer.from(JSON.stringify({text, filename, lang})).toString(
          'base64'
        ),
      };

      const newFilename = `${filename}_to_${lang}.txt`;

      await program.saveResult(data);
      assert.ok(
        console.log.calledWith(`Received request to save file ${filename}`)
      );
      assert.ok(
        console.log.calledWith(
          `Saving result to ${newFilename} in bucket ${RESULT_BUCKET}`
        )
      );
      assert.ok(console.log.calledWith('File saved.'));

      // Check file was actually saved
      assert.ok(storage.bucket(RESULT_BUCKET).file(newFilename).exists());
    });
  });
});
