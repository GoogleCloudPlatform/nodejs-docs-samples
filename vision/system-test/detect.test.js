// Copyright 2018 Google LLC
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
const cp = require('child_process');
const uuid = require('uuid');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const vision = require('@google-cloud/vision');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const client = new vision.ImageAnnotatorClient();

const storage = new Storage();
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const prefix = 'results';
const cmd = 'node detect.js';
const files = [
  'face_no_surprise.jpg',
  'landmark.jpg',
  'logos.png',
  'text.jpg',
  'wakeupcat.jpg',
  'faulkner.jpg',
  'city.jpg',
  'pdf-ocr.pdf',
  'duck_and_truck.jpg',
  'google.png',
].map(name => {
  return {
    name,
    localPath: path.resolve(path.join(__dirname, `../resources/${name}`)),
  };
});

describe('detect', () => {
  before(async () => {
    const [bucket] = await storage.createBucket(bucketName);
    await Promise.all(files.map(file => bucket.upload(file.localPath)));
  });

  after(async () => {
    const bucket = storage.bucket(bucketName);
    await bucket.deleteFiles({force: true});
    await bucket.deleteFiles({force: true}); // Try a second time...
    await bucket.delete();
  });

  it('should detect faces in a local file', async () => {
    const output = execSync(`${cmd} faces ${files[0].localPath}`);
    assert.match(output, /Faces:/);
    assert.match(output, /Face #1:/);
  });

  it('should detect faces in a remote file', async () => {
    const output = execSync(`${cmd} faces-gcs ${bucketName} ${files[0].name}`);
    assert.match(output, /Faces:/);
    assert.match(output, /Face #1:/);
  });

  it('should detect labels in a local file', async () => {
    const output = execSync(`${cmd} labels ${files[4].localPath}`);
    assert.match(output, /Labels:/);
    assert.match(output, /cat/i);
  });

  it('should detect labels in a remote file', async () => {
    const output = execSync(`${cmd} labels-gcs ${bucketName} ${files[4].name}`);
    assert.match(output, /Labels:/);
    assert.match(output, /cat/i);
  });

  it('should detect landmarks in a local file', async () => {
    const output = execSync(`${cmd} landmarks ${files[1].localPath}`);
    assert.match(output, /Landmarks:/);
    // FLAKY: confirm there is output, if not an exact match
    assert.match(output, /description:/i);
  });

  it('should detect landmarks in a remote file', async () => {
    const output = execSync(
      `${cmd} landmarks-gcs ${bucketName} ${files[1].name}`
    );
    assert.match(output, /Landmarks:/);
    // FLAKY: confirm there is output, if not an exact match
    assert.match(output, /description:/i);
  });

  it('should detect text in a local file', async () => {
    const output = execSync(`${cmd} text ${files[3].localPath}`);
    assert.match(output, /Text:/);
    assert.match(output, /System Software Update/);
  });

  it('should detect text in a remote file', async () => {
    const output = execSync(`${cmd} text-gcs ${bucketName} ${files[3].name}`);
    assert.match(output, /Text:/);
    assert.match(output, /System Software Update/);
  });

  it('should detect logos in a local file', async () => {
    const output = execSync(`${cmd} logos ${files[2].localPath}`);
    assert.match(output, /Logos:/);
    // confirm output with a description, but not necessarily an exact value
    assert.match(output, /description:/i);
  });

  it('should detect logos in a remote file', async () => {
    const output = execSync(`${cmd} logos-gcs ${bucketName} ${files[2].name}`);
    assert.match(output, /Logos:/);
    // confirm output with a description, but not necessarily an exact value
    assert.match(output, /description:/i);
  });

  it('should detect properties in a local file', async () => {
    const output = execSync(`${cmd} properties ${files[1].localPath}`);
    assert.match(output, /color: { red: 69, green: 42, blue: 27/);
    assert.ok(output.split('\n').length > 4, 'Multiple colors were detected.');
  });

  it('should detect properties in a remote file', async () => {
    const output = execSync(
      `${cmd} properties-gcs ${bucketName} ${files[1].name}`
    );
    assert.match(output, /color: { red: 69, green: 42, blue: 27/);
    assert.ok(output.split('\n').length > 4, 'Multiple colors were detected.');
  });

  it('should detect safe-search in a local file', async () => {
    const output = execSync(`${cmd} safe-search ${files[4].localPath}`);
    assert.match(output, /VERY_LIKELY/);
    assert.match(output, /Racy:/);
  });

  it('should detect safe-search in a remote file', async () => {
    const output = execSync(
      `${cmd} safe-search-gcs ${bucketName} ${files[4].name}`
    );
    assert.match(output, /Medical:/);
  });

  it('should detect crop hints in a local file', async () => {
    const output = execSync(`${cmd} crops ${files[2].localPath}`);
    assert.match(output, /Crop Hint 0:/);
    assert.match(output, /Bound 2:/);
  });

  it('should detect crop hints in a remote file', async () => {
    const output = execSync(`${cmd} crops-gcs ${bucketName} ${files[2].name}`);
    assert.match(output, /Crop Hint 0:/);
    assert.match(output, /Bound 2:/);
  });

  it('should detect similar web images in a local file', async () => {
    const output = execSync(`${cmd} web ${files[5].localPath}`);

    const [results] = await client.webDetection(files[5].localPath);
    const webDetection = results.webDetection;

    if (webDetection.fullMatchingImages.length) {
      assert.match(output, /Full matches found:/);
    }

    if (webDetection.partialMatchingImages.length) {
      assert.match(output, /Partial matches found:/);
    }

    if (webDetection.webEntities.length) {
      assert.match(output, /Web entities found:/);
      assert.match(output, /Description:/);
    }

    if (webDetection.bestGuessLabels.length) {
      assert.match(output, /Best guess labels found/);
      assert.match(output, /Label:/);
    }
  });

  it('should detect similar web images in a remote file', async () => {
    const output = execSync(`${cmd} web-gcs ${bucketName} ${files[5].name}`);

    const [results] = await client.webDetection(
      `gs://${bucketName}/${files[5].name}`
    );
    const webDetection = results.webDetection;

    if (webDetection.fullMatchingImages.length) {
      assert.match(output, /Full matches found:/);
    }

    if (webDetection.partialMatchingImages.length) {
      assert.match(output, /Partial matches found:/);
    }

    if (webDetection.webEntities.length) {
      assert.match(output, /Web entities found:/);
      assert.match(output, /Description:/);
    }

    if (webDetection.bestGuessLabels.length) {
      assert.match(output, /Best guess labels found/);
      assert.match(output, /Label:/);
    }
  });

  it('should detect web entities with geo metadata in local file', async () => {
    const output = execSync(`${cmd} web-geo ${files[1].localPath}`);
    assert.match(output, /Description:/);
    assert.match(output, /Score:/);
    assert.match(output, /Rome/);
  });

  it('should detect web entities with geo metadata in remote file', async () => {
    const output = execSync(
      `${cmd} web-geo-gcs ${bucketName} ${files[1].name}`
    );
    assert.match(output, /Description:/);
    assert.match(output, /Score:/);
    assert.match(output, /Rome/);
  });

  it('should read a document from a local file', async () => {
    const output = execSync(`${cmd} fulltext ${files[2].localPath}`);
    assert.match(output, /Google Cloud Platform/);
    assert.match(output, /Word text: Cloud/);
    assert.match(output, /Word confidence: 0.9/);
  });

  it('should read a document from a remote file', async () => {
    const output = execSync(
      `${cmd} fulltext-gcs ${bucketName} ${files[2].name}`
    );
    assert.match(output, /Google Cloud Platform/);
  });

  it('should extract text from pdf file', async () => {
    const output = execSync(
      `${cmd} pdf ${bucketName} ${files[7].name} ${prefix}`
    );
    assert.match(output, /results/);
  });

  it('should detect objects in a local file', async () => {
    const output = execSync(`${cmd} localize-objects ${files[8].localPath}`);
    assert.match(output, /Name: Toy/);
  });

  it('should detect objects in a remote file', async () => {
    const output = execSync(
      `${cmd} localize-objects-gcs gs://${bucketName}/${files[8].name}`
    );
    assert.match(output, /Name: Toy/);
  });
});
