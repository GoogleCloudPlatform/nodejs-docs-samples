// Copyright 2016 Google LLC
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
const {Storage} = require('@google-cloud/storage');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const storage = new Storage();
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = 'node recognize.js';
const resourcePath = path.join(__dirname, '..', 'resources');
const filename = 'audio.raw';
const filename1 = 'Google_Gnome.wav';
const filename2 = 'commercial_mono.wav';
const filename3 = 'commercial_stereo.wav';
const filepath = path.join(resourcePath, filename);
const filepath1 = path.join(resourcePath, filename1);
const filepath2 = path.join(resourcePath, filename2);
const filepath3 = path.join(resourcePath, filename3);
const text = 'how old is the Brooklyn Bridge';
const text1 = 'the weather outside is sunny';
const text2 = "Terrific. It's on the way.";
const text3 = 'Chrome';

describe('Recognize', () => {
  before(async () => {
    const [bucket] = await storage.createBucket(bucketName);
    await bucket.upload(filepath);
    await bucket.upload(filepath1);
    await bucket.upload(filepath3);
  });

  after(async () => {
    const bucket = storage.bucket(bucketName);
    await bucket.deleteFiles({force: true});
    await bucket.deleteFiles({force: true}); // Try a second time...
    await bucket.delete();
  });

  it('should run sync recognize', async () => {
    const output = execSync(`${cmd} sync ${filepath}`);
    assert.match(output, new RegExp(`Transcription:  ${text}`));
  });

  it('should run sync recognize on a GCS file', async () => {
    const output = execSync(`${cmd} sync-gcs gs://${bucketName}/${filename}`);
    assert.match(output, new RegExp(`Transcription:  ${text}`));
  });

  it('should run sync recognize with word time offset', async () => {
    const output = execSync(`${cmd} sync-words ${filepath}`);
    assert.match(output, new RegExp(`Transcription:  ${text}`));
    assert.match(output, new RegExp('\\d+\\.\\d+ secs - \\d+\\.\\d+ secs'));
  });

  it('should run async recognize on a local file', async () => {
    const output = execSync(`${cmd} async ${filepath}`);
    assert.match(output, new RegExp(`Transcription: ${text}`));
  });

  it('should run async recognize on a GCS file', async () => {
    const output = execSync(`${cmd} async-gcs gs://${bucketName}/${filename}`);
    assert.match(output, new RegExp(`Transcription: ${text}`));
  });

  it('should run async recognize on a GCS file with word time offset', async () => {
    const output = execSync(
      `${cmd} async-gcs-words gs://${bucketName}/${filename}`
    );
    assert.match(output, new RegExp(`Transcription: ${text}`));
    // Check for word time offsets
    assert.match(output, new RegExp('\\d+\\.\\d+ secs - \\d+\\.\\d+ secs'));
  });

  it('should run streaming recognize', async () => {
    const output = execSync(`${cmd} stream ${filepath}`);
    assert.match(output, new RegExp(`Transcription: ${text}`));
  });

  it('should run sync recognize with model selection', async () => {
    const model = 'video';
    const output = execSync(`${cmd} sync-model ${filepath1} ${model}`);
    assert.match(output, /Transcription:/);
    assert.match(output, new RegExp(text1));
  });

  it('should run sync recognize on a GCS file with model selection', async () => {
    const model = 'video';
    const output = execSync(
      `${cmd} sync-model-gcs gs://${bucketName}/${filename1} ${model}`
    );
    assert.match(output, /Transcription:/);
    assert.match(output, new RegExp(text1));
  });

  it('should run sync recognize with auto punctuation', async () => {
    const output = execSync(`${cmd} sync-auto-punctuation ${filepath2}`);
    assert.match(output, new RegExp(text2));
  });

  it('should run sync recognize with enhanced model', async () => {
    const output = execSync(`${cmd} sync-enhanced-model ${filepath2}`);
    assert.match(output, new RegExp(text3));
  });

  it('should run multi channel transcription on a local file', async () => {
    const output = execSync(`${cmd} sync-multi-channel ${filepath3}`);
    assert.match(output, /Channel Tag: 2/);
  });

  it('should run multi channel transcription on GCS file', async () => {
    const output = execSync(
      `${cmd} sync-multi-channel-gcs gs://${bucketName}/${filename3}`
    );
    assert.match(output, /Channel Tag: 2/);
  });

  it('should run speech diarization on a local file', async () => {
    const output = execSync(`${cmd} Diarization -f ${filepath2}`);
    assert.match(output, /speakerTag:/);
  });
});
