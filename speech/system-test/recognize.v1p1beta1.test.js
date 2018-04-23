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

const {runAsync} = require(`@google-cloud/nodejs-repo-tools`);

const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node recognize.v1p1beta1.js`;
const cwd = path.join(__dirname, `..`);
const filename1 = `Google_Gnome.wav`;
const filename2 = `commercial_mono.wav`;
const filepath1 = path.join(__dirname, `../resources/${filename1}`);
const filepath2 = path.join(__dirname, `../resources/${filename2}`);
const text1 = `the weather outside is sunny`;
const text2 = `Terrific. It's on the way.`;
const text3 = `Chrome`;

test.before(async () => {
  const [bucket] = await storage.createBucket(bucketName);
  await bucket.upload(filepath1);
});

test.after.always(async () => {
  const bucket = storage.bucket(bucketName);
  await bucket.deleteFiles({force: true});
  await bucket.deleteFiles({force: true}); // Try a second time...
  await bucket.delete();
});

test(`should run sync recognize with model selection`, async t => {
  const model = `video`;
  const output = await runAsync(`${cmd} sync-model ${filepath1} ${model}`, cwd);
  t.true(output.includes(`Transcription:`));
  t.true(output.includes(text1));
});

test(`should run sync recognize on a GCS file with model selection`, async t => {
  const model = `video`;
  const output = await runAsync(
    `${cmd} sync-model-gcs gs://${bucketName}/${filename1} ${model}`,
    cwd
  );
  t.true(output.includes(`Transcription:`));
  t.true(output.includes(text1));
});

test(`should run sync recognize with auto punctuation`, async t => {
  const output = await runAsync(
    `${cmd} sync-auto-punctuation ${filepath2}`,
    cwd
  );
  t.true(output.includes(text2));
});

test(`should run sync recognize with metadata`, async t => {
  const output = await runAsync(`${cmd} sync-metadata ${filepath2}`, cwd);
  t.true(output.includes(text3));
});
