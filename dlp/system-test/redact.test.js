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

const path = require('path');
const test = require('ava');
const fs = require('fs');
const tools = require('@google-cloud/nodejs-repo-tools');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const cmd = 'node redact.js';
const cwd = path.join(__dirname, `..`);

const testImage = 'resources/test.png';
const testResourcePath = 'system-test/resources';

test.before(tools.checkCredentials);

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
test(`should redact a single sensitive data type from a string`, async t => {
  const output = await tools.runAsync(
    `${cmd} string "My email is jenny@example.com" -t EMAIL_ADDRESS`,
    cwd
  );
  t.regex(output, /My email is \[EMAIL_ADDRESS\]/);
});

test(`should redact multiple sensitive data types from a string`, async t => {
  const output = await tools.runAsync(
    `${cmd} string "I am 29 years old and my email is jenny@example.com" -t EMAIL_ADDRESS AGE`,
    cwd
  );
  t.regex(output, /I am \[AGE\] and my email is \[EMAIL_ADDRESS\]/);
});

test(`should handle string with no sensitive data`, async t => {
  const output = await tools.runAsync(
    `${cmd} string "No sensitive data to redact here" -t EMAIL_ADDRESS AGE`,
    cwd
  );
  t.regex(output, /No sensitive data to redact here/);
});

// redact_image
test(`should redact a single sensitive data type from an image`, async t => {
  const testName = `redact-single-type`;
  const output = await tools.runAsync(
    `${cmd} image ${testImage} ${testName}.actual.png -t PHONE_NUMBER`,
    cwd
  );

  t.regex(output, /Saved image redaction results to path/);

  const difference = await getImageDiffPercentage(
    `${testName}.actual.png`,
    `${testResourcePath}/${testName}.expected.png`
  );
  t.true(difference < 0.03);
});

test(`should redact multiple sensitive data types from an image`, async t => {
  const testName = `redact-multiple-types`;
  const output = await tools.runAsync(
    `${cmd} image ${testImage} ${testName}.actual.png -t PHONE_NUMBER EMAIL_ADDRESS`,
    cwd
  );

  t.regex(output, /Saved image redaction results to path/);

  const difference = await getImageDiffPercentage(
    `${testName}.actual.png`,
    `${testResourcePath}/${testName}.expected.png`
  );
  t.true(difference < 0.03);
});

test(`should report info type errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} string "My email is jenny@example.com" -t NONEXISTENT`,
    cwd
  );
  t.regex(output, /Error in deidentifyContent/);
});

test(`should report image redaction handling errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} image ${testImage} output.png -t BAD_TYPE`,
    cwd
  );
  t.regex(output, /Error in redactImage/);
});
