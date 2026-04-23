// Copyright 2022 Google LLC
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
const {Storage} = require('@google-cloud/storage');
const sinon = require('sinon');
const supertest = require('supertest');
const functionsFramework = require('@google-cloud/functions-framework/testing');

const storage = new Storage();

const BUCKET_NAME = process.env.FUNCTIONS_BUCKET;
const {BLURRED_BUCKET_NAME} = process.env;
const blurredBucket = storage.bucket(BLURRED_BUCKET_NAME);

const testFiles = {
  safe: 'wakeupcat.jpg',
  offensive: 'zombie.jpg',
};

require('../index');

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

  beforeEach(() => sinon.stub(console, 'log'));
  afterEach(() => console.log.restore());

  describe('functions_imagemagick_setup functions_imagemagick_analyze functions_imagemagick_blur', () => {
    it('blurOffensiveImages detects safe images using Cloud Vision', async () => {
      const event = {
        id: '1234',
        type: 'mock-gcs-event',
        data: {
          bucket: BUCKET_NAME,
          name: testFiles.safe,
        },
      };

      const server = functionsFramework.getTestServer('blurOffensiveImages');
      await supertest(server)
        .post('/')
        .send(event)
        .set('Content-Type', 'application/json')
        .expect(204);
    });

    it('blurOffensiveImages successfully blurs offensive images', async () => {
      const event = {
        id: '1234',
        type: 'mock-gcs-event',
        data: {
          bucket: BUCKET_NAME,
          name: testFiles.offensive,
        },
      };

      const server = functionsFramework.getTestServer('blurOffensiveImages');
      await supertest(server)
        .post('/')
        .send(event)
        .set('Content-Type', 'application/json')
        .expect(204);

      assert(console.log.calledWith(`Blurred image: ${testFiles.offensive}`));
      assert(
        console.log.calledWith(
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
      const missingFileName = 'file-does-not-exist.jpg';
      const event = {
        id: '1234',
        type: 'mock-gcs-event',
        data: {
          bucket: BUCKET_NAME,
          name: missingFileName,
        },
      };

      const server = functionsFramework.getTestServer('blurOffensiveImages');
      await supertest(server)
        .post('/')
        .send(event)
        .set('Content-Type', 'application/json')
        .expect(204);

      assert(console.log.calledWith(`Detected ${missingFileName} as OK.`));
    });
  });

  after(async () => {
    try {
      await blurredBucket.file(testFiles.offensive).delete();
    } catch (err) {
      console.error('Error deleting uploaded file:', err.message);
    }
  });
});
