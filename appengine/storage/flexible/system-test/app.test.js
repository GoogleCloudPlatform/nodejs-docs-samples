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

const path = require(`path`);
const Storage = require(`@google-cloud/storage`);
const storage = Storage();
const test = require(`ava`);
const utils = require(`@google-cloud/nodejs-repo-tools`);

const bucketName = process.env.GCLOUD_STORAGE_BUCKET;
const bucket = storage.bucket(bucketName);

const cwd = path.join(__dirname, `../`);
const requestObj = utils.getRequest({cwd: cwd});

test.before(async () => {
  utils.checkCredentials();
  await bucket.create(bucket).then(() => {
    return bucket.acl.add({
      entity: 'allUsers',
      role: Storage.acl.READER_ROLE,
    });
  });
});
test.after.always(async () => {
  try {
    await bucket.deleteFiles();
    await bucket.delete();
  } catch (err) {} // ignore error
});

test.cb.serial(`should load`, t => {
  requestObj
    .get(`/`)
    .expect(200)
    .expect(response => {
      t.regex(response.text, /<input type="file" name="file">/);
    })
    .end(t.end);
});

test.cb.serial(`should upload a file`, t => {
  requestObj
    .post(`/upload`)
    .attach(`file`, path.join(__dirname, `resources/test.txt`))
    .expect(200)
    .expect(response => {
      t.is(
        response.text,
        `https://storage.googleapis.com/${bucketName}/test.txt`
      );
    })
    .end(t.end);
});
