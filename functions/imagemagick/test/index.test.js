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

const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const {Storage} = require('@google-cloud/storage');

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

const safeFileName = 'bicycle.jpg';
const offensiveFileName = 'zombie.jpg';

const cwd = path.join(__dirname, '..');

const blurredBucket = storage.bucket(BLURRED_BUCKET_NAME);

describe('functions/imagemagick tests', () => {
  const startFF = port => {
    return execPromise(
      `functions-framework --target=blurOffensiveImages --signature-type=event --port=${port}`,
      {timeout: 15000, shell: true, cwd}
    );
  };

  const stopFF = async ffProc => {
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

  beforeEach(tools.stubConsole);
  afterEach(tools.restoreConsole);

  it('blurOffensiveImages detects safe images using Cloud Vision', async () => {
    const PORT = 8080;
    const ffProc = startFF(PORT);

    await requestRetry({
      url: `http://localhost:${PORT}/blurOffensiveImages`,
      body: {
        data: {
          bucket: BUCKET_NAME,
          name: safeFileName,
        },
      },
    });

    const {stdout} = await stopFF(ffProc);

    assert.ok(stdout.includes(`Detected ${safeFileName} as OK.`));
  });

  it('blurOffensiveImages successfully blurs offensive images', async () => {
    const PORT = 8081;
    const ffProc = startFF(PORT);

    await requestRetry({
      url: `http://localhost:${PORT}/blurOffensiveImages`,
      body: {
        data: {
          bucket: BUCKET_NAME,
          name: offensiveFileName,
        },
      },
    });

    const {stdout} = await stopFF(ffProc);

    assert.ok(stdout.includes(`Blurred image: ${offensiveFileName}`));
    assert.ok(
      stdout.includes(
        `Uploaded blurred image to: gs://${BLURRED_BUCKET_NAME}/${offensiveFileName}`
      )
    );

    assert.ok(
      storage
        .bucket(BLURRED_BUCKET_NAME)
        .file(offensiveFileName)
        .exists(),
      'File uploaded'
    );
  });

  after(async () => {
    try {
      await blurredBucket.file(offensiveFileName).delete();
    } catch (err) {
      console.log('Error deleting uploaded file:', err);
    }
  });
});
