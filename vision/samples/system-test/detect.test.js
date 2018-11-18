/**
 * Copyright 2017, Google, Inc.
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
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);
const assert = require('assert');

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const storage = new Storage();
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node detect.js`;
const cwd = path.join(__dirname, `..`);
const files = [
  `face_no_surprise.jpg`,
  `landmark.jpg`,
  `logos.png`,
  `text.jpg`,
  `wakeupcat.jpg`,
  `faulkner.jpg`,
  `city.jpg`,
  'pdf-ocr.pdf',
  'duck_and_truck.jpg',
].map(name => {
  return {
    name,
    localPath: path.resolve(path.join(__dirname, `../resources/${name}`)),
  };
});

describe(`detect`, () => {
  before(async () => {
    tools.checkCredentials;
    const [bucket] = await storage.createBucket(bucketName);
    await Promise.all(files.map(file => bucket.upload(file.localPath)));
  });

  after(async () => {
    const bucket = storage.bucket(bucketName);
    await bucket.deleteFiles({force: true});
    await bucket.deleteFiles({force: true}); // Try a second time...
    await bucket.delete();
  });

  it(`should detect faces in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} faces ${files[0].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Faces:`));
    assert.ok(output.includes(`Face #1:`));
  });

  it(`should detect faces in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} faces-gcs ${bucketName} ${files[0].name}`,
      cwd
    );
    assert.ok(output.includes(`Faces:`));
    assert.ok(output.includes(`Face #1:`));
  });

  it(`should detect labels in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} labels ${files[4].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Labels:`));
    assert.ok(output.includes(`cat`));
  });

  it(`should detect labels in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} labels-gcs ${bucketName} ${files[4].name}`,
      cwd
    );
    assert.ok(output.includes(`Labels:`));
    assert.ok(output.includes(`cat`));
  });

  it(`should detect landmarks in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} landmarks ${files[1].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Landmarks:`));
    assert.ok(output.includes(`Palace of Fine Arts`));
  });

  it(`should detect landmarks in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} landmarks-gcs ${bucketName} ${files[1].name}`,
      cwd
    );
    assert.ok(output.includes(`Landmarks:`));
    assert.ok(output.includes(`Palace of Fine Arts`));
  });

  it(`should detect text in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} text ${files[3].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Text:`));
    assert.ok(output.includes(`System Software Update`));
  });

  it(`should detect text in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} text-gcs ${bucketName} ${files[3].name}`,
      cwd
    );
    assert.ok(output.includes(`Text:`));
    assert.ok(output.includes(`System Software Update`));
  });

  it(`should detect logos in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} logos ${files[2].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Logos:`));
    assert.ok(output.includes(`Google`));
  });

  it(`should detect logos in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} logos-gcs ${bucketName} ${files[2].name}`,
      cwd
    );
    assert.ok(output.includes(`Logos:`));
    assert.ok(output.includes(`Google`));
  });

  it(`should detect properties in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} properties ${files[1].localPath}`,
      cwd
    );
    assert.ok(output.includes(`{ color: { red: 69, green: 42, blue: 27`));
    assert.ok(output.split(`\n`).length > 4, `Multiple colors were detected.`);
  });

  it(`should detect properties in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} properties-gcs ${bucketName} ${files[1].name}`,
      cwd
    );
    assert.ok(output.includes(`{ color: { red: 69, green: 42, blue: 27`));
    assert.ok(output.split(`\n`).length > 4, `Multiple colors were detected.`);
  });

  it(`should detect safe-search in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} safe-search ${files[4].localPath}`,
      cwd
    );
    assert.ok(output.includes(`VERY_LIKELY`));
    assert.ok(output.includes(`Racy:`));
  });

  it(`should detect safe-search in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} safe-search-gcs ${bucketName} ${files[4].name}`,
      cwd
    );
    assert.ok(output.includes(`Medical:`));
  });

  it(`should detect crop hints in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} crops ${files[2].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Crop Hint 0:`));
    assert.ok(output.includes(`Bound 2: (280, 43)`));
  });

  it(`should detect crop hints in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} crops-gcs ${bucketName} ${files[2].name}`,
      cwd
    );
    assert.ok(output.includes(`Crop Hint 0:`));
    assert.ok(output.includes(`Bound 2: (280, 43)`));
  });

  it(`should detect similar web images in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} web ${files[5].localPath}`,
      cwd
    );

    const [results] = await client.webDetection(files[5].localPath);
    const webDetection = results.webDetection;

    if (webDetection.fullMatchingImages.length) {
      assert.ok(output.includes(`Full matches found:`));
    }

    if (webDetection.partialMatchingImages.length) {
      assert.ok(output.includes(`Partial matches found:`));
    }

    if (webDetection.webEntities.length) {
      assert.ok(output.includes(`Web entities found:`));
      assert.ok(output.includes(`Description: Google Cloud Platform`));
    }

    if (webDetection.bestGuessLabels.length) {
      assert.ok(output.includes(`Best guess labels found`));
      assert.ok(output.includes(`Label:`));
    }
  });

  it(`should detect similar web images in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} web-gcs ${bucketName} ${files[5].name}`,
      cwd
    );

    const [results] = await client.webDetection(
      `gs://${bucketName}/${files[5].name}`
    );
    const webDetection = results.webDetection;

    if (webDetection.fullMatchingImages.length) {
      assert.ok(output.includes(`Full matches found:`));
    }

    if (webDetection.partialMatchingImages.length) {
      assert.ok(output.includes(`Partial matches found:`));
    }

    if (webDetection.webEntities.length) {
      assert.ok(output.includes(`Web entities found:`));
      assert.ok(output.includes(`Description: Google Cloud Platform`));
    }

    if (webDetection.bestGuessLabels.length) {
      assert.ok(output.includes(`Best guess labels found`));
      assert.ok(output.includes(`Label:`));
    }
  });

  it(`should detect web entities with geo metadata in local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} web-geo ${files[1].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Description:`));
    assert.ok(output.includes(`Score:`));
    assert.ok(output.includes(`Rome`));
  });

  it(`should detect web entities with geo metadata in remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} web-geo-gcs ${bucketName} ${files[1].name}`,
      cwd
    );
    assert.ok(output.includes(`Description:`));
    assert.ok(output.includes(`Score:`));
    assert.ok(output.includes(`Rome`));
  });

  it(`should read a document from a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} fulltext ${files[2].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Google Cloud Platform`));
    assert.ok(output.includes(`Word text: Cloud`));
    assert.ok(output.includes(`Word confidence: 0.9`));
  });

  it(`should read a document from a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} fulltext-gcs ${bucketName} ${files[2].name}`,
      cwd
    );
    assert.ok(output.includes(`Google Cloud Platform`));
  });

  it(`should extract text from pdf file`, async () => {
    const output = await tools.runAsync(
      `${cmd} pdf ${bucketName} ${files[7].name}`,
      cwd
    );
    assert.ok(output.includes(`pdf-ocr.pdf.json`));
  });

  it(`should detect objects in a local file`, async () => {
    const output = await tools.runAsync(
      `${cmd} localize-objects ${files[8].localPath}`,
      cwd
    );
    assert.ok(output.includes(`Name: Bird`));
    assert.ok(output.includes(`Name: Duck`));
    assert.ok(output.includes(`Name: Toy`));
  });

  it(`should detect objects in a remote file`, async () => {
    const output = await tools.runAsync(
      `${cmd} localize-objects-gcs gs://${bucketName}/${files[8].name}`,
      cwd
    );
    assert.ok(output.includes(`Name: Bird`));
    assert.ok(output.includes(`Name: Duck`));
    assert.ok(output.includes(`Name: Toy`));
  });
});
