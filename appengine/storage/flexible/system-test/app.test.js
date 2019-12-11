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
const storage = new Storage();
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

const bucketName = process.env.GCLOUD_STORAGE_BUCKET;
const bucket = storage.bucket(bucketName);

const cwd = path.join(__dirname, '../');
const requestObj = tools.getRequest({cwd: cwd});

before(async () => {
  assert(
    process.env.GCLOUD_PROJECT,
    `Must set GCLOUD_PROJECT environment variable!`
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
  );
  await bucket.create(bucket).then(() => {
    return bucket.acl.add({
      entity: 'allUsers',
      role: Storage.acl.READER_ROLE,
    });
  });
});
after(async () => {
  try {
    await bucket.deleteFiles();
    await bucket.delete();
  } catch (err) {} // ignore error
});

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
