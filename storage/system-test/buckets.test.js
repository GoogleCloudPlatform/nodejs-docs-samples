/**
 * Copyright 2016, Google, Inc.
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

require(`../../system-test/_setup`);

const storage = require(`@google-cloud/storage`)();
const uuid = require(`uuid`);
const path = require(`path`);

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);
const cmd = `node buckets.js`;

test.after.always(async () => {
  try {
    await bucket.delete();
  } catch (err) {} // ignore error
});

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.serial(`should create a bucket`, async (t) => {
  const output = await runAsync(`${cmd} create ${bucketName}`, cwd);
  t.is(output, `Bucket ${bucketName} created.`);
  const [exists] = await bucket.exists();
  t.true(exists);
});

test.serial(`should list buckets`, async (t) => {
  await tryTest(async () => {
    const output = await runAsync(`${cmd} list`, cwd);
    t.true(output.includes(`Buckets:`));
    t.true(output.includes(bucketName));
  }).start();
});

test.serial(`should delete a bucket`, async (t) => {
  const output = await runAsync(`${cmd} delete ${bucketName}`, cwd);
  t.is(output, `Bucket ${bucketName} deleted.`);
  const [exists] = await bucket.exists();
  t.false(exists);
});
