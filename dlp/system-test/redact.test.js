/**
 * Copyright 2018, Google, Inc.
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

const path = require('path');
const assert = require('assert');
const fs = require('fs');
const tools = require('@google-cloud/nodejs-repo-tools');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const cmd = 'node redact.js';
const cwd = path.join(__dirname, `..`);

const testImage = 'resources/test.png';
const testResourcePath = 'system-test/resources';

before(tools.checkCredentials);

function readImage(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('error', reject)
      .on('parsed', function() {
        resolve(this);
      });
  });
}

async function getImageDiffPercentage(image1Path, image2Path) {
  const image1 = await readImage(image1Path);
  const image2 = await readImage(image2Path);
  const diff = new PNG({width: image1.width, height: image1.height});

  const diffPixels = pixelmatch(
    image1.data,
    image2.data,
    diff.data,
    image1.width,
    image1.height
  );
  return diffPixels / (diff.width * diff.height);
}

// redact_text
it('should redact a single sensitive data type from a string', async () => {
  const output = await tools.runAsync(
    `${cmd} string "My email is jenny@example.com" -t EMAIL_ADDRESS`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/My email is \[EMAIL_ADDRESS\]/).test(output),
    true
  );
});

it('should redact multiple sensitive data types from a string', async () => {
  const output = await tools.runAsync(
    `${cmd} string "I am 29 years old and my email is jenny@example.com" -t EMAIL_ADDRESS AGE`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/I am \[AGE\] and my email is \[EMAIL_ADDRESS\]/).test(output),
    true
  );
});

it('should handle string with no sensitive data', async () => {
  const output = await tools.runAsync(
    `${cmd} string "No sensitive data to redact here" -t EMAIL_ADDRESS AGE`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/No sensitive data to redact here/).test(output),
    true
  );
});

// redact_image
it('should redact a single sensitive data type from an image', async () => {
  const testName = `redact-single-type`;
  const output = await tools.runAsync(
    `${cmd} image ${testImage} ${testName}.actual.png -t PHONE_NUMBER`,
    cwd
  );

  assert.strictEqual(
    new RegExp(/Saved image redaction results to path/).test(output),
    true
  );

  const difference = await getImageDiffPercentage(
    `${testName}.actual.png`,
    `${testResourcePath}/${testName}.expected.png`
  );
  assert.strictEqual(difference < 0.03, true);
});

it('should redact multiple sensitive data types from an image', async () => {
  const testName = `redact-multiple-types`;
  const output = await tools.runAsync(
    `${cmd} image ${testImage} ${testName}.actual.png -t PHONE_NUMBER EMAIL_ADDRESS`,
    cwd
  );

  assert.strictEqual(
    new RegExp(/Saved image redaction results to path/).test(output),
    true
  );

  const difference = await getImageDiffPercentage(
    `${testName}.actual.png`,
    `${testResourcePath}/${testName}.expected.png`
  );
  assert.strictEqual(difference < 0.03, true);
});

it('should report info type errors', async () => {
  const output = await tools.runAsync(
    `${cmd} string "My email is jenny@example.com" -t NONEXISTENT`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Error in deidentifyContent/).test(output),
    true
  );
});

it('should report image redaction handling errors', async () => {
  const output = await tools.runAsync(
    `${cmd} image ${testImage} output.png -t BAD_TYPE`,
    cwd
  );
  assert.strictEqual(new RegExp(/Error in redactImage/).test(output), true);
});
