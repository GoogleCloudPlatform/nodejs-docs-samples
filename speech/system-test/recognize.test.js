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
const {Storage} = require(`@google-cloud/storage`);
const assert = require(`assert`);
const uuid = require(`uuid`);

const {runAsync} = require(`@google-cloud/nodejs-repo-tools`);

const storage = new Storage();
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node recognize.js`;
const cwd = path.join(__dirname, `..`);
const filename = `audio.raw`;
const filename1 = `Google_Gnome.wav`;
const filename2 = `commercial_mono.wav`;
const filepath = path.join(__dirname, `../resources/${filename}`);
const filepath1 = path.join(__dirname, `../resources/${filename1}`);
const filepath2 = path.join(__dirname, `../resources/${filename2}`);
const text = `how old is the Brooklyn Bridge`;
const text1 = `the weather outside is sunny`;
const text2 = `Terrific. It's on the way.`;
const text3 = `Chrome`;

describe(`Recognize`, () => {
  before(async () => {
    const [bucket] = await storage.createBucket(bucketName);
    await bucket.upload(filepath);
    await bucket.upload(filepath1);
  });

  after(async () => {
    const bucket = storage.bucket(bucketName);
    await bucket.deleteFiles({force: true});
    await bucket.deleteFiles({force: true}); // Try a second time...
    await bucket.delete();
  });

  it(`should run sync recognize`, async () => {
    const output = await runAsync(`${cmd} sync ${filepath}`, cwd);
    assert.ok(output.includes(`Transcription:  ${text}`));
  });

  it(`should run sync recognize on a GCS file`, async () => {
    const output = await runAsync(
      `${cmd} sync-gcs gs://${bucketName}/${filename}`,
      cwd
    );
    assert.ok(output.includes(`Transcription:  ${text}`));
  });

  it(`should run sync recognize with word time offset`, async () => {
    const output = await runAsync(`${cmd} sync-words ${filepath}`, cwd);
    assert.ok(output.includes(`Transcription:  ${text}`));
    assert.ok(new RegExp(`\\d+\\.\\d+ secs - \\d+\\.\\d+ secs`).test(output));
  });

  it(`should run async recognize on a local file`, async () => {
    const output = await runAsync(`${cmd} async ${filepath}`, cwd);
    assert.ok(output.includes(`Transcription: ${text}`));
  });

  it(`should run async recognize on a GCS file`, async () => {
    const output = await runAsync(
      `${cmd} async-gcs gs://${bucketName}/${filename}`,
      cwd
    );
    assert.ok(output.includes(`Transcription: ${text}`));
  });

  it(`should run async recognize on a GCS file with word time offset`, async () => {
    const output = await runAsync(
      `${cmd} async-gcs-words gs://${bucketName}/${filename}`,
      cwd
    );
    assert.ok(output.includes(`Transcription: ${text}`));
    // Check for word time offsets
    assert.ok(new RegExp(`\\d+\\.\\d+ secs - \\d+\\.\\d+ secs`).test(output));
  });

  it(`should run streaming recognize`, async () => {
    const output = await runAsync(`${cmd} stream ${filepath}`, cwd);
    assert.ok(output.includes(`Transcription: ${text}`));
  });

  it(`should run sync recognize with model selection`, async () => {
    const model = `video`;
    const output = await runAsync(
      `${cmd} sync-model ${filepath1} ${model}`,
      cwd
    );
    assert.ok(output.includes(`Transcription:`));
    assert.ok(output.includes(text1));
  });

  it(`should run sync recognize on a GCS file with model selection`, async () => {
    const model = `video`;
    const output = await runAsync(
      `${cmd} sync-model-gcs gs://${bucketName}/${filename1} ${model}`,
      cwd
    );
    assert.ok(output.includes(`Transcription:`));
    assert.ok(output.includes(text1));
  });

  it(`should run sync recognize with auto punctuation`, async () => {
    const output = await runAsync(
      `${cmd} sync-auto-punctuation ${filepath2}`,
      cwd
    );
    assert.ok(output.includes(text2));
  });

  it(`should run sync recognize with enhanced model`, async () => {
    const output = await runAsync(
      `${cmd} sync-enhanced-model ${filepath2}`,
      cwd
    );
    assert.ok(output.includes(text3));
  });
});
