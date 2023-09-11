// Copyright 2023 Google LLC
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

const fs = require('fs');
const path = require('path');
const {Storage} = require('@google-cloud/storage');
const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('analyze.v2', () => {
  const storage = new Storage();
  const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
  const fileName = 'text.txt';
  const fileName2 = 'android_text.txt';
  const localFilePath = path.join(__dirname, `../resources/${fileName}`);
  const localFilePath2 = path.join(__dirname, `../resources/${fileName2}`);
  const text = fs.readFileSync(localFilePath, 'utf-8');
  const text2 = fs.readFileSync(localFilePath2, 'utf-8');

  before(async () => {
    const [bucket] = await storage.createBucket(bucketName);
    await bucket.upload(localFilePath);
    await bucket.upload(localFilePath2);
  });

  after(async () => {
    const bucket = storage.bucket(bucketName);
    await bucket.deleteFiles({force: true});
    await bucket.deleteFiles({force: true}); // Try a second time...
    await bucket.delete();
  });

  it('should analyze sentiment in text', async () => {
    const output = execSync(`node analyze_sentiment_v2_text.js "${text}"`);
    assert.match(output, /Document sentiment:/);
    assert.match(output, /Sentence: /);
    assert.match(output, /Score: /);
    assert.match(output, /Magnitude: /);
  });

  it('should analyze sentiment in a file', async () => {
    const output = execSync(
      `node analyze_sentiment_v2_file.js ${bucketName} ${fileName}`
    );
    assert.match(output, /Document sentiment:/);
    assert.match(output, /Sentence: /);
    assert.match(output, /Score: /);
    assert.match(output, /Magnitude: /);
  });

  it('should analyze entities in text', async () => {
    const output = execSync(`node analyze_entities_v2_text.js "${text}"`);
    assert.match(output, /Entities:/);
    assert.match(output, /Type:/);
  });

  it('should analyze entities in a file', async () => {
    const output = execSync(
      `node analyze_entities_v2_file.js ${bucketName} ${fileName}`
    );
    assert.match(output, /Entities:/);
    assert.match(output, /Type:/);
  });

  it('should classify text in a file', async () => {
    const output = execSync(
      `node classify_text_v2_file.js ${bucketName} ${fileName2}`
    );
    assert.match(output, /Name:/);
  });

  it('should classify text in text', async () => {
    const output = execSync(`node classify_text_v2_text.js "${text2}"`);
    assert.match(output, /Name:/);
  });
});
