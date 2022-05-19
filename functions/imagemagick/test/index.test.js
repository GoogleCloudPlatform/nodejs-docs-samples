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
const {spawn} = require('child_process');
const {Storage} = require('@google-cloud/storage');
const sinon = require('sinon');
const {request} = require('gaxios');
const waitPort = require('wait-port');

const storage = new Storage();

const BUCKET_NAME = process.env.FUNCTIONS_BUCKET;
const {BLURRED_BUCKET_NAME} = process.env;
const blurredBucket = storage.bucket(BLURRED_BUCKET_NAME);

const testFiles = {
  safe: 'bicycle.jpg',
  offensive: 'zombie.jpg',
};

async function startFF(port) {
  const ffProc = spawn('npx', [
    'functions-framework',
    '--target',
    'blurOffensiveImages',
    '--signature-type',
    'event',
    '--port',
    port,
  ]);
  const ffProcHandler = new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    ffProc.stdout.on('data', data => (stdout += data));
    ffProc.stderr.on('data', data => (stderr += data));
    ffProc.on('error', reject);
    ffProc.on('exit', c => (c === 0 ? resolve(stdout) : reject(stderr)));
  });
  await waitPort({host: 'localhost', port});
  return {ffProc, ffProcHandler};
}

describe('functions/imagemagick tests', () => {
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

  beforeEach(() => sinon.stub(console, 'error'));
  afterEach(() => console.error.restore());

  describe('functions_imagemagick_setup functions_imagemagick_analyze functions_imagemagick_blur', () => {
    it('blurOffensiveImages detects safe images using Cloud Vision', async () => {
      const PORT = 8080;
      const {ffProc, ffProcHandler} = await startFF(PORT);

      await request({
        url: `http://localhost:${PORT}/blurOffensiveImages`,
        method: 'POST',
        data: {
          data: {
            bucket: BUCKET_NAME,
            name: testFiles.safe,
          },
        },
      });
      ffProc.kill();
      const stdout = await ffProcHandler;
      assert.ok(stdout.includes(`Detected ${testFiles.safe} as OK.`));
    });

    it('blurOffensiveImages successfully blurs offensive images', async () => {
      const PORT = 8081;
      const {ffProc, ffProcHandler} = await startFF(PORT);

      await request({
        url: `http://localhost:${PORT}/blurOffensiveImages`,
        method: 'POST',
        data: {
          data: {
            bucket: BUCKET_NAME,
            name: testFiles.offensive,
          },
        },
      });

      ffProc.kill();
      const stdout = await ffProcHandler;

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
      const {ffProc, ffProcHandler} = await startFF(PORT);
      const missingFileName = 'file-does-not-exist.jpg';

      await request({
        url: `http://localhost:${PORT}/blurOffensiveImages`,
        method: 'POST',
        data: {
          data: {
            bucket: BUCKET_NAME,
            name: missingFileName,
          },
        },
      });

      ffProc.kill();
      const stdout = await ffProcHandler;
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
