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

const path = require(`path`);
const storage = require(`@google-cloud/storage`)();
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);
const userEmail = `test@example.com`;
const cmd = `node iam.js`;
const roleName = `roles/storage.objectViewer`;

test.before(tools.checkCredentials);
test.before(async (t) => {
  await bucket.create();
});

test.after.always(async (t) => {
  try {
    await bucket.delete();
  } catch (err) {} // ignore error
});

test.serial(`should add multiple members to a role on a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} add-members ${bucketName} ${roleName} "user:${userEmail}"`, cwd);
  t.true(output.includes(`Added the following member(s) with role ${roleName} to ${bucketName}:`));
  t.true(output.includes(`user:${userEmail}`));
});

test.serial(`should list members of a role on a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} view-members ${bucketName} "user:${userEmail}"`, cwd);
  t.true(output.includes(`Roles for bucket ${bucketName}:`));
  t.true(output.includes(`Role: ${roleName}`));
  t.true(output.includes(`Members:`));
  t.true(output.includes(`user:${userEmail}`));
});

test.serial(`should remove multiple members from a role on a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} remove-members ${bucketName} ${roleName} "user:${userEmail}"`, cwd);
  t.true(output.includes(`Removed the following member(s) with role ${roleName} from ${bucketName}:`));
  t.true(output.includes(`user:${userEmail}`));
});
