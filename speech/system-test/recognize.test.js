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

const path = require(`path`);
const storage = require(`@google-cloud/storage`)();
const test = require(`ava`);
const uuid = require(`uuid`);

const {
  runAsync
} = require(`@google-cloud/nodejs-repo-tools`);

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
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
});

test(`should run sync recognize on a GCS file`, async (t) => {
  const output = await runAsync(`${cmd} sync-gcs gs://${bucketName}/${filename}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
});

test(`should run sync recognize with word time offset`, async (t) => {
  const output = await runAsync(`${cmd} sync-words ${filepath}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
  t.true(new RegExp(`\\d+\\.\\d+ secs - \\d+\\.\\d+ secs`).test(output));
});

test(`should run sync recognize with punctuation`, async (t) => {
  const output = await runAsync(`${cmd} sync-punctuation ${filepath}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
});

test(`should run sync recognize with video`, async (t) => {
  const output = await runAsync(`${cmd} sync-video ${filepath}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp('you do keep doing that'));
  t.regex(output, new RegExp('organic matter and will return'));
});

test(`should run sync recognize with metadata`, async (t) => {
  const output = await runAsync(`${cmd} sync-metadata ${filepath}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp('you do keep doing that'));
  t.regex(output, new RegExp('organic matter and will return'));
});

test(`should run async recognize on a local file`, async (t) => {
  const output = await runAsync(`${cmd} async ${filepath}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
});

test(`should run async recognize on a GCS file`, async (t) => {
  const output = await runAsync(`${cmd} async-gcs gs://${bucketName}/${filename}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
});

test(`should run async recognize on a GCS file with word time offset`, async (t) => {
  const output = await runAsync(`${cmd} async-gcs-words gs://${bucketName}/${filename}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
  // Check for word time offsets
  t.true(new RegExp(`\\d+\\.\\d+ secs - \\d+\\.\\d+ secs`).test(output));
});

test(`should run async recognize on a GCS file with punctuation`, async (t) => {
  const output = await runAsync(`${cmd} async-gcs-punctuation gs://${bucketName}/${filename}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
});

test(`should run async recognize on a GCS file with video`, async (t) => {
  const output = await runAsync(`${cmd} async-gcs-video gs://${bucketName}/${filename}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp('you do keep doing that'));
  t.regex(output, new RegExp('organic matter and will return'));
});

test(`should run async recognize on a GCS file with metadata`, async (t) => {
  const output = await runAsync(`${cmd} async-gcs-metadata gs://${bucketName}/${filename}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp('you do keep doing that'));
  t.regex(output, new RegExp('organic matter and will return'));
});

test(`should run streaming recognize`, async (t) => {
  const output = await runAsync(`${cmd} stream ${filepath}`, cwd);
  t.regex(output, new RegExp(`Transcription`));
  t.regex(output, new RegExp(text));
});
