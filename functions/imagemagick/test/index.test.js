// Copyright 2017 Google LLC
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
const execPromise = require('child-process-promise').exec;
const path = require('path');
const {Storage} = require('@google-cloud/storage');
const sinon = require('sinon');

const storage = new Storage();

let requestRetry = require('requestretry');
requestRetry = requestRetry.defaults({
  retryStrategy: requestRetry.RetryStrategies.NetworkError,
  method: 'POST',
  json: true,
  retryDelay: 1000,
});

const BUCKET_NAME = process.env.FUNCTIONS_BUCKET;
const {BLURRED_BUCKET_NAME} = process.env;
const blurredBucket = storage.bucket(BLURRED_BUCKET_NAME);
const cwd = path.join(__dirname, '..');

const testFiles = {
  safe: 'bicycle.jpg',
  offensive: 'zombie.jpg',
};

describe('functions/imagemagick tests', () => {
  let startFF, stopFF;

  before(async () => {
    let exists;

    const names = Object.keys(testFiles);
    for (let i = 0; i < names.length; i++) {
      [exists] = await storage
        .bucket(BUCKET_NAME)
        .file(testFiles[names[i]])
        .exists();
      if (!exists) {
        throw Error(
          `Missing required file: gs://${BUCKET_NAME}/${testFiles[names[i]]}`
        );
      }
    }
  });

  before(() => {
    startFF = port => {
      return execPromise(
        `functions-framework --target=blurOffensiveImages --signature-type=event --port=${port}`,
        {timeout: 15000, shell: true, cwd}
      );
    };

    stopFF = async ffProc => {
      try {
        return await ffProc;
      } catch (err) {
        // Timeouts always cause errors on Linux, so catch them
        if (err.name && err.name === 'ChildProcessError') {
          const {stdout, stderr} = err;
          return {stdout, stderr};
        }

        throw err;
      }
    };
  });

  const stubConsole = function () {
    sinon.stub(console, 'error');
  };

  const restoreConsole = function () {
    console.error.restore();
  };

  beforeEach(stubConsole);
  afterEach(restoreConsole);

  describe('functions_imagemagick_setup functions_imagemagick_analyze functions_imagemagick_blur', () => {
    it('blurOffensiveImages detects safe images using Cloud Vision', async () => {
      const PORT = 8080;
      const ffProc = startFF(PORT);

      await requestRetry({
        url: `http://localhost:${PORT}/blurOffensiveImages`,
        body: {
          data: {
            bucket: BUCKET_NAME,
            name: testFiles.safe,
          },
        },
      });

      const {stdout} = await stopFF(ffProc);
      assert.ok(stdout.includes(`Detected ${testFiles.safe} as OK.`));
    });

    it('blurOffensiveImages successfully blurs offensive images', async () => {
      const PORT = 8081;
      const ffProc = startFF(PORT);

      await requestRetry({
        url: `http://localhost:${PORT}/blurOffensiveImages`,
        body: {
          data: {
            bucket: BUCKET_NAME,
            name: testFiles.offensive,
          },
        },
      });

      const {stdout} = await stopFF(ffProc);

      assert.ok(stdout.includes(`Blurred image: ${testFiles.offensive}`));
      assert.ok(
        stdout.includes(
          `Uploaded blurred image to: gs://${BLURRED_BUCKET_NAME}/${testFiles.offensive}`
        )
      );

      const exists = await storage
        .bucket(BLURRED_BUCKET_NAME)
        .file(testFiles.offensive)
        .exists();
      assert.ok(exists, 'File uploaded');
    });

    it('blurOffensiveImages detects missing images as safe using Cloud Vision', async () => {
      const PORT = 8082;
      const ffProc = startFF(PORT);
      const missingFileName = 'file-does-not-exist.jpg';

      await requestRetry({
        url: `http://localhost:${PORT}/blurOffensiveImages`,
        body: {
          data: {
            bucket: BUCKET_NAME,
            name: missingFileName,
          },
        },
      });

      const {stdout} = await stopFF(ffProc);
      assert.ok(stdout.includes(`Detected ${missingFileName} as OK.`));
    });
  });

  after(async () => {
    try {
      await blurredBucket.file(testFiles.offensive).delete();
    } catch (err) {
      console.log('Error deleting uploaded file:', err.message);
    }
  });
});
