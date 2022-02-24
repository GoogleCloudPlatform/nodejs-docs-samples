// Copyright 2021 Google LLC
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

const path = require('path');
const assert = require('assert');
const {execSync} = require('child_process');
const {v4: uuidv4} = require('uuid');
const {Storage} = require('@google-cloud/storage');

const cwd = path.join(__dirname, '..');
const cmd = 'node downscoping.js';
process.env.GOOGLE_CLOUD_PROJECT = 'long-door-651';

const CONTENTS = 'helloworld';
let bucket;
let file;
let bucketName;
let objectName;

const GOOGLE_CLOUD_PROJECT = 'long-door-651';

before(async () => {
  const storage = new Storage({projectId: GOOGLE_CLOUD_PROJECT});
  bucketName = 'bucket-downscoping-test-' + uuidv4();
  objectName = 'object-downscoping-test-' + uuidv4();

  try {
    await storage.createBucket(bucketName);
    await storage.bucket(bucketName).file(objectName).save(CONTENTS);
  } catch (error) {
    console.log(error.message);
  }
  bucket = storage.bucket(bucketName);
  file = bucket.file(objectName);
});

after(async () => {
  await file.delete();
  await bucket.delete();
});

it('should downscope with credential access boundary and call storage apis', () => {
  console.log(
    `${cmd} auth-downscoping-with-credential-access-boundary -b ${bucketName} -o ${objectName}`
  );
  const output = execSync(
    `${cmd} auth-downscoping-with-credential-access-boundary -b ${bucketName} -o ${objectName}`,
    {cwd, shell: true}
  );
  assert.strictEqual(output.toString('utf8').includes(CONTENTS), true);
});
