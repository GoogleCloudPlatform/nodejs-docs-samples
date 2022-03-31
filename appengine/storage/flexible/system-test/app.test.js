// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const path = require('path');
const {Storage} = require('@google-cloud/storage');
const supertest = require('supertest');
const storage = new Storage();
const assert = require('assert');
const proxyquire = require('proxyquire').noPreserveCache();

process.env.GCLOUD_STORAGE_BUCKET =
  'nodejs-docs-samples-test-appengine-storage-std';
const bucketName = 'nodejs-docs-samples-test-appengine-storage-std';
const bucket = storage.bucket(bucketName);

const cwd = path.join(__dirname, '../');
const requestObj = supertest(proxyquire(path.join(cwd, 'app'), {process}));

before(async () => {
  try {
    await bucket.create(bucket).then(() => {
      return bucket.acl.add({
        entity: 'allUsers',
        role: Storage.acl.READER_ROLE,
      });
    });
  } catch (err) {
    if (
      !err.message.match(
        /Your previous request to create the named bucket succeeded and you already own it./
      )
    ) {
      throw err;
    }
  }
});
after(async () => {
  try {
    await bucket.deleteFiles();
    await bucket.delete();
  } catch (err) {
    // ignore error
  }
});

describe('gae_flex_storage_app', () => {
  it('should load', async () => {
    await requestObj
      .get('/')
      .expect(200)
      .expect(response => {
        assert.strictEqual(
          new RegExp(/<input type="file" name="file">/).test(response.text),
          true
        );
      });
  });

  it('should upload a file', async () => {
    await requestObj
      .post('/upload')
      .attach('file', path.join(__dirname, 'resources/test.txt'))
      .expect(200)
      .expect(response => {
        assert.strictEqual(
          response.text,
          `https://storage.googleapis.com/${bucketName}/test.txt`
        );
      });
  });
});
