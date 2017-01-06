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

const fs = require('fs');
const path = require('path');
const storage = require('@google-cloud/storage')();
const uuid = require('uuid');

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);
const cmd = `node encryption.js`;

const fileName = `test.txt`;
const filePath = path.join(__dirname, `../resources`, fileName);
const downloadFilePath = path.join(__dirname, `../resources/downloaded.txt`);

let key;

test.before(async () => {
  await bucket.create(bucketName);
});

test.after.always(async () => {
  try {
    // Delete the downloaded file
    fs.unlinkSync(downloadFilePath);
  } catch (err) {
    console.log(err);
  }
  // Try deleting all files twice, just to make sure
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

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.serial(`should generate a key`, async (t) => {
  const output = await runAsync(`${cmd} generate-encryption-key`, cwd);
  t.true(output.includes(`Base 64 encoded encryption key:`));
  const test = /^Base 64 encoded encryption key: (.+)$/;
  key = output.match(test)[1];
});

test.serial(`should upload a file`, async (t) => {
  const output = await runAsync(`${cmd} upload ${bucketName} ${filePath} ${fileName} ${key}`, cwd);
  t.is(output, `File ${filePath} uploaded to ${fileName}.`);
  const [exists] = await bucket.file(fileName).exists();
  t.true(exists);
});

test.serial(`should download a file`, async (t) => {
  const output = await runAsync(`${cmd} download ${bucketName} ${fileName} ${downloadFilePath} ${key}`, cwd);
  t.is(output, `File ${fileName} downloaded to ${downloadFilePath}.`);
  t.notThrows(() => {
    fs.statSync(downloadFilePath);
  });
});

test.serial(`should rotate keys`, (t) => {
  t.throws(() => {
    run(`${cmd} rotate ${bucketName} ${fileName} ${key} ${key}`, cwd);
  }, Error, `This is currently not available using the Cloud Client Library.`);
});
