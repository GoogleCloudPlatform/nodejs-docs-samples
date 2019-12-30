// Copyright 2017 Google LLC
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
const {describe, it} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('analyze.v1', () => {
  const storage = new Storage();
  const cmd = 'node analyze.v1.js';
  const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
  const fileName = `text.txt`;
  const fileName2 = `android_text.txt`;
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
    const output = execSync(`${cmd} sentiment-text "${text}"`);
    assert.match(output, /Document sentiment:/);
    assert.match(output, new RegExp(`Sentence: ${text}`));
    assert.match(output, /Score: 0/);
    assert.match(output, /Magnitude: 0/);
  });

  it('should analyze sentiment in a file', async () => {
    const output = execSync(`${cmd} sentiment-file ${bucketName} ${fileName}`);
    assert(output, /Document sentiment:/);
    assert.match(output, new RegExp(`Sentence: ${text}`));
    assert.match(output, /Score: 0/);
    assert.match(output, /Magnitude: 0/);
  });

  it('should analyze entities in text', async () => {
    const output = execSync(`${cmd} entities-text "${text}"`);
    assert.match(output, /Obama/);
    assert.match(output, /Type: PERSON/);
    assert.match(output, /White House/);
    assert.match(output, /Type: LOCATION/);
  });

  it('should analyze entities in a file', async () => {
    const output = execSync(`${cmd} entities-file ${bucketName} ${fileName}`);
    assert.match(output, /Entities:/);
    assert.match(output, /Obama/);
    assert.match(output, /Type: PERSON/);
    assert.match(output, /White House/);
    assert.match(output, /Type: LOCATION/);
  });

  it('should analyze syntax in text', async () => {
    const output = execSync(`${cmd} syntax-text "${text}"`);
    assert.match(output, /Tokens:/);
    assert.match(output, /NOUN:/);
    assert.match(output, /President/);
    assert.match(output, /Obama/);
    assert.match(output, /Morphology:/);
    assert.match(output, /tag: 'NOUN'/);
  });

  it('should analyze syntax in a file', async () => {
    const output = execSync(`${cmd} syntax-file ${bucketName} ${fileName}`);
    assert.match(output, /NOUN:/);
    assert.match(output, /President/);
    assert.match(output, /Obama/);
    assert.match(output, /Morphology:/);
    assert.match(output, /tag: 'NOUN'/);
  });

  it('should analyze entity sentiment in text', async () => {
    const output = execSync(`${cmd} entity-sentiment-text "${text}"`);
    assert.match(output, /Entities and sentiments:/);
    assert.match(output, /Obama/);
    assert.match(output, /PERSON/);
    assert.match(output, /Score: 0/);
    assert.match(output, /Magnitude: 0/);
  });

  it('should analyze entity sentiment in a file', async () => {
    const output = execSync(
      `${cmd} entity-sentiment-file ${bucketName} ${fileName}`
    );
    assert.match(output, /Entities and sentiments:/);
    assert.match(output, /Obama/);
    assert.match(output, /PERSON/);
    assert.match(output, /Score: 0/);
    assert.match(output, /Magnitude: 0/);
  });

  it('should classify text in a file', async () => {
    const output = execSync(`${cmd} classify-file ${bucketName} ${fileName2}`);
    assert.match(output, /Name:/);
    assert.match(output, /Computers & Electronics/);
  });

  it('should classify text in text', async () => {
    const output = execSync(`${cmd} classify-text "${text2}"`);
    assert.match(output, /Name:/);
    assert.match(output, /Computers & Electronics/);
  });
});
