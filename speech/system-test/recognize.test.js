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

const path = require(`path`);
const storage = require(`@google-cloud/storage`)();
const uuid = require(`uuid`);

const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node recognize.js`;
const cwd = path.join(__dirname, `..`);
const filename = `audio.raw`;
const filepath = path.join(__dirname, `../resources/${filename}`);
const text = `how old is the Brooklyn Bridge`;

test.before(async () => {
  const [bucket] = await storage.createBucket(bucketName);
  await bucket.upload(filepath);
});

test.after.always(async () => {
  const bucket = storage.bucket(bucketName);
  await bucket.deleteFiles({ force: true });
  await bucket.deleteFiles({ force: true }); // Try a second time...
  await bucket.delete();
});

test(`should run sync recognize`, async (t) => {
  const output = await runAsync(`${cmd} sync ${filepath}`, cwd);
  t.true(output.includes(`Transcription: ${text}`));
});

test(`should run sync recognize on a GCS file`, async (t) => {
  const output = await runAsync(`${cmd} sync-gcs gs://${bucketName}/${filename}`, cwd);
  t.true(output.includes(`Transcription: ${text}`));
});

test(`should run async recognize on a local file`, async (t) => {
  const output = await runAsync(`${cmd} async ${filepath}`, cwd);
  t.true(output.includes(`Transcription: ${text}`));
});

test(`should run async recognize on a GCS file`, async (t) => {
  const output = await runAsync(`${cmd} async-gcs gs://${bucketName}/${filename}`, cwd);
  t.true(output.includes(`Transcription: ${text}`));
});

test(`should run streaming recognize`, async (t) => {
  const output = await runAsync(`${cmd} stream ${filepath}`, cwd);
  t.true(output.includes(`Transcription: ${text}`));
});
