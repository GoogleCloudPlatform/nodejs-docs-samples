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

const fs = require(`fs`);
const storage = require(`@google-cloud/storage`)();
const uuid = require(`uuid`);
const path = require(`path`);

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);
const fileName = `test.txt`;
const movedFileName = `test2.txt`;
const copiedFileName = `test3.txt`;
const filePath = path.join(__dirname, `../resources`, fileName);
const downloadFilePath = path.join(__dirname, `../resources/downloaded.txt`);
const cmd = `node files.js`;

test.before(async () => {
  await bucket.create();
});

test.after.always(async () => {
  try {
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

test.serial(`should upload a file`, async (t) => {
  const output = await runAsync(`${cmd} upload ${bucketName} ${filePath}`, cwd);
  t.is(output, `File ${fileName} uploaded.`);
  const [exists] = await bucket.file(fileName).exists();
  t.true(exists);
});

test.serial(`should download a file`, async (t) => {
  const output = await runAsync(`${cmd} download ${bucketName} ${fileName} ${downloadFilePath}`, cwd);
  t.is(output, `File ${fileName} downloaded to ${downloadFilePath}.`);
  t.notThrows(() => fs.statSync(downloadFilePath));
});

test.serial(`should move a file`, async (t) => {
  const output = await runAsync(`${cmd} move ${bucketName} ${fileName} ${movedFileName}`, cwd);
  t.is(output, `File ${fileName} moved to ${movedFileName}.`);
  const [exists] = await bucket.file(movedFileName).exists();
  t.true(exists);
});

test.serial(`should copy a file`, async (t) => {
  const output = await runAsync(`${cmd} copy ${bucketName} ${movedFileName} ${bucketName} ${copiedFileName}`, cwd);
  t.is(output, `File ${movedFileName} copied to ${copiedFileName} in ${bucketName}.`);
  const [exists] = await bucket.file(copiedFileName).exists();
  t.true(exists);
});

test.serial(`should list files`, async (t) => {
  await tryTest(async () => {
    const output = await runAsync(`${cmd} list ${bucketName}`, cwd);
    t.true(output.includes(`Files:`));
    t.true(output.includes(movedFileName));
    t.true(output.includes(copiedFileName));
  }).start();
});

test.serial(`should list files by a prefix`, async (t) => {
  let output = await runAsync(`${cmd} list ${bucketName} test "/"`, cwd);
  t.true(output.includes(`Files:`));
  t.true(output.includes(movedFileName));
  t.true(output.includes(copiedFileName));
  output = await runAsync(`${cmd} list ${bucketName} foo`, cwd);
  t.true(output.includes(`Files:`));
  t.false(output.includes(movedFileName));
  t.false(output.includes(copiedFileName));
});

test.serial(`should make a file public`, async (t) => {
  const output = await runAsync(`${cmd} make-public ${bucketName} ${copiedFileName}`, cwd);
  t.is(output, `File ${copiedFileName} is now public.`);
});

test.serial(`should generate a signed URL for a file`, async (t) => {
  const output = await runAsync(`${cmd} generate-signed-url ${bucketName} ${copiedFileName}`, cwd);
  t.true(output.includes(`The signed url for ${copiedFileName} is `));
});

test.serial(`should get metadata for a file`, async (t) => {
  const output = await runAsync(`${cmd} get-metadata ${bucketName} ${copiedFileName}`, cwd);
  t.true(output.includes(`File: ${copiedFileName}`));
  t.true(output.includes(`Bucket: ${bucketName}`));
});

test.serial(`should delete a file`, async (t) => {
  const output = await runAsync(`${cmd} delete ${bucketName} ${copiedFileName}`, cwd);
  t.is(output, `File ${copiedFileName} deleted.`);
  const [exists] = await bucket.file(copiedFileName).exists();
  t.false(exists);
});
