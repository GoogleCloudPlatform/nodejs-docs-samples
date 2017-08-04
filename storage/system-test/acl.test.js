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
const userEmail = `jdobry@google.com`;
const fileName = `test.txt`;
const filePath = path.join(__dirname, `../resources`, fileName);
const cmd = `node acl.js`;

test.before(tools.checkCredentials);
test.before(async (t) => {
  await bucket.create();
  await bucket.upload(filePath);
});

test.after.always(async (t) => {
  // Try deleting all files twice
  try {
    await bucket.deleteFiles({ force: true });
  } catch (err) {} // ignore error
  try {
    await bucket.deleteFiles({ force: true });
  } catch (err) {} // ignore error
  try {
    await bucket.delete();
  } catch (err) {} // ignore error
});

test(`should print acl for a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} print-bucket-acl ${bucketName}`, cwd);
  t.true(output.includes(`OWNER: project-editors-`));
  t.true(output.includes(`OWNER: project-owners-`));
  t.true(output.includes(`READER: project-viewers-`));
});

test(`should print acl for a file`, async (t) => {
  const output = await tools.runAsync(`${cmd} print-file-acl ${bucketName} ${fileName}`, cwd);
  t.true(output.includes(`OWNER: project-editors-`));
  t.true(output.includes(`OWNER: project-owners-`));
  t.true(output.includes(`READER: project-viewers-`));
});

test.serial(`should print a user's acl for a bucket`, async (t) => {
  await bucket.acl.readers.addUser(userEmail);
  const output = await tools.runAsync(`${cmd} print-bucket-acl-for-user ${bucketName} ${userEmail}`, cwd);
  t.is(output, `READER: user-${userEmail}`);
  await bucket.acl.readers.deleteUser(userEmail);
});

test.serial(`should add a user as an owner on a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} add-bucket-owner ${bucketName} ${userEmail}`, cwd);
  t.is(output, `Added user ${userEmail} as an owner on bucket ${bucketName}.`);
});

test.serial(`should remove a user from a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} remove-bucket-owner ${bucketName} ${userEmail}`, cwd);
  t.is(output, `Removed user ${userEmail} from bucket ${bucketName}.`);
});

test.serial(`should add a user as a default owner on a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} add-bucket-default-owner ${bucketName} ${userEmail}`, cwd);
  t.is(output, `Added user ${userEmail} as an owner on bucket ${bucketName}.`);
});

test.serial(`should remove a default user from a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} remove-bucket-default-owner ${bucketName} ${userEmail}`, cwd);
  t.is(output, `Removed user ${userEmail} from bucket ${bucketName}.`);
});

test.serial(`should print a user's acl for a file`, async (t) => {
  await bucket.file(fileName).acl.readers.addUser(userEmail);
  const output = await tools.runAsync(`${cmd} print-file-acl-for-user ${bucketName} ${fileName} ${userEmail}`, cwd);
  t.is(output, `READER: user-${userEmail}`);
  await bucket.file(fileName).acl.readers.deleteUser(userEmail);
});

test.serial(`should add a user as an owner on a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} add-file-owner ${bucketName} ${fileName} ${userEmail}`, cwd);
  t.is(output, `Added user ${userEmail} as an owner on file ${fileName}.`);
});

test.serial(`should remove a user from a bucket`, async (t) => {
  const output = await tools.runAsync(`${cmd} remove-file-owner ${bucketName} ${fileName} ${userEmail}`, cwd);
  t.is(output, `Removed user ${userEmail} from file ${fileName}.`);
});
