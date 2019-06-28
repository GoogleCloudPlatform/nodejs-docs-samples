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
  url: 'http://localhost:8080/blurOffensiveImages',
});

const BUCKET_NAME = process.env.FUNCTIONS_BUCKET;
const {BLURRED_BUCKET_NAME} = process.env;

const safeFileName = 'bicycle.jpg';
const offensiveFileName = 'zombie.jpg';

const cwd = path.join(__dirname, '..');

const blurredBucket = storage.bucket(BLURRED_BUCKET_NAME);

describe('functions/imagemagick tests', () => {
  const startFF = () => {
    return execPromise(
      `functions-framework --target=blurOffensiveImages --signature-type=event`,
      {timeout: 10000, shell: true, cwd}
    );
  };

  const stopFF = async ffProc => {
    try {
      return await ffProc;
    } catch (err) {
      console.info('DBG ERR', err);
      console.info('DBG PROC', ffProc);
      // Timeouts always cause errors on Linux, so catch them
      if (err.name && err.name === 'ChildProcessError') {
        const {stdout, stderr} = ffProc.childProcess;
        return {stdout, stderr};
      }

      throw err;
    }
  };

  beforeEach(tools.stubConsole);
  afterEach(tools.restoreConsole);

  it('blurOffensiveImages detects safe images using Cloud Vision', async () => {
    const ffProc = startFF();

    await requestRetry({
      body: {
        data: {
          bucket: BUCKET_NAME,
          name: safeFileName,
        },
      },
    });

    const {stdout} = await stopFF(ffProc);

    assert.ok(
      stdout.includes(`The image ${safeFileName} has been detected as OK.`)
    );
  });

  it('blurOffensiveImages successfully blurs offensive images', async () => {
    const ffProc = startFF();

    await requestRetry({
      body: {
        data: {
          bucket: BUCKET_NAME,
          name: offensiveFileName,
        },
      },
    });

    const {stdout, stderr} = await stopFF(ffProc);

    assert.ok(stdout.includes(`Image ${offensiveFileName} has been blurred.`));
    assert.ok(
      stdout.includes(
        `Blurred image has been uploaded to: gs://${BLURRED_BUCKET_NAME}/${offensiveFileName}`
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
