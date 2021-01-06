// Copyright 2018 Google LLC
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

/* eslint-env node, mocha */

const uuid = require('uuid');
const assert = require('assert');
const fs = require('fs');
const execPromise = require('child-process-promise').exec;
let requestRetry = require('requestretry');

const path = require('path');
const cwd = path.join(__dirname, '..');

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const BASE_URL = 'http://localhost:8080';
const outputBucket = storage.bucket(process.env.OUTPUT_BUCKET);

requestRetry = requestRetry.defaults({
  retryStrategy: requestRetry.RetryStrategies.NetworkError,
  method: 'POST',
  json: true,
  url: `${BASE_URL}/speechTranslate`,
});

describe('speechTranslate tests', () => {
  let ffProc;
  before(() => {
    ffProc = execPromise(
      'functions-framework --target=speechTranslate --signature-type=http',
      {timeout: 8000, shell: true, cwd}
    );
  });

  after(async () => {
    try {
      await ffProc;
    } catch (err) {
      // Timeouts always cause errors on Linux, so catch them
      if (err.name && err.name === 'ChildProcessError') {
        return;
      }

      throw err;
    }
  });

  describe('validate_request', () => {
    describe('Validate encoding field', () => {
      it('should fail if encoding field is missing.', async () => {
        const response = await requestRetry({
          body: {
            // encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en',
            audioContent: 'base64-audio-content',
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Invalid encoding.');
      });

      it('should fail if encoding field is empty.', async () => {
        const response = await requestRetry({
          body: {
            encoding: '',
            sampleRateHertz: 16000,
            languageCode: 'en',
            audioContent: 'base64-audio-content',
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Invalid encoding.');
      });
    });

    describe('Validate sampleRateHertz field', () => {
      it('should fail if sampleRateHertz field is missing.', async () => {
        const response = await requestRetry({
          body: {
            encoding: 'LINEAR16',
            // sampleRateHertz: 16000,
            languageCode: 'en',
            audioContent: 'base64-audio-content',
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Sample rate hertz must be numeric.');
      });

      it('should fail if sampleRateHertz field is empty.', async () => {
        const response = await requestRetry({
          body: {
            encoding: 'LINEAR16',
            sampleRateHertz: '',
            languageCode: 'en',
            audioContent: 'base64-audio-content',
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Sample rate hertz must be numeric.');
      });

      it('should fail if sampleRateHertz field is not numeric.', async () => {
        const response = await requestRetry({
          body: {
            encoding: 'LINEAR16',
            sampleRateHertz: 'NaN',
            languageCode: 'en',
            audioContent: 'base64-audio-content',
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Sample rate hertz must be numeric.');
      });
    });

    describe('Validate languageCode field', () => {
      it('should fail if languageCode field is missing.', async () => {
        const response = await requestRetry({
          body: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            // languageCode: 'en',
            audioContent: 'base64-audio-content',
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Invalid language code.');
      });

      it('should fail if languageCode field is empty.', async () => {
        const response = await requestRetry({
          body: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: '',
            audioContent: 'base64-audio-content',
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Invalid language code.');
      });
    });

    describe('Validate audioContent field', () => {
      it('should fail if audioContent field is missing.', async () => {
        const response = await requestRetry({
          body: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en',
            // audioContent: 'base64-audio-content'
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Invalid audio content.');
      });

      it('should fail if audioContent field is empty.', async () => {
        const response = await requestRetry({
          body: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en',
            audioContent: '',
          },
        });
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body, 'Invalid audio content.');
      });
    });
  });

  describe('GCS bucket tests', () => {
    const gcsFilename = `speech-to-speech-${uuid.v4()}`;

    describe('call_speech_to_text call_text_to_speech call_text_translation chain_cloud_calls upload_to_cloud_storage validate_request', () => {
      it('should transcribe speech, translate it, and synthesize it in another language', async () => {
        const response = await requestRetry({
          body: {
            filename: gcsFilename,
            encoding: 'LINEAR16',
            sampleRateHertz: 24000,
            languageCode: 'en',
            audioContent: fs.readFileSync('test/speech-recording.b64', 'utf8'),
          },
        });

        assert.strictEqual(response.statusCode, 200);

        // Test transcription
        response.body.translations.forEach(translation => {
          assert.ifError(translation.error);
        });
        assert.strictEqual(
          response.body['transcription'],
          'this is a test please translate this message'
        );

        // Test speech synthesis + result uploading
        assert.ok(outputBucket.file(gcsFilename).exists());
      });
    });

    after(async () => {
      try {
        await outputBucket.file(gcsFilename).delete();
      } catch (err) {
        // Delete might fail if the test itself didn't create the file
      }
    });
  });
});
