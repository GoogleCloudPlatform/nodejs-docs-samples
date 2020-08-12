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

const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const fs = require('fs');
const cp = require('child_process');
const {PNG} = require('pngjs');
const pixelmatch = require('pixelmatch');
const DLP = require('@google-cloud/dlp');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const testImage = 'resources/test.png';
const testResourcePath = 'system-test/resources';

const client = new DLP.DlpServiceClient();

async function readImage(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('error', reject)
      .on('parsed', function () {
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
describe('redact', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });
  // redact_text
  it('should redact a single sensitive data type from a string', () => {
    const output = execSync(
      `node redactText.js ${projectId} "My email is jenny@example.com" -t EMAIL_ADDRESS`
    );
    assert.match(output, /My email is \[EMAIL_ADDRESS\]/);
  });

  it('should redact multiple sensitive data types from a string', () => {
    const output = execSync(
      `node redactText.js ${projectId} "I am 29 years old and my email is jenny@example.com" LIKELIHOOD_UNSPECIFIED 'EMAIL_ADDRESS,AGE'`
    );
    assert.match(output, /I am \[AGE\] and my email is \[EMAIL_ADDRESS\]/);
  });

  it('should handle string with no sensitive data', () => {
    const output = execSync(
      `node redactText.js ${projectId} "No sensitive data to redact here" LIKELIHOOD_UNSPECIFIED 'EMAIL_ADDRESS,AGE'`
    );
    assert.match(output, /No sensitive data to redact here/);
  });

  // redact_image
  it('should redact a single sensitive data type from an image', async () => {
    const testName = 'redact-single-type';
    const output = execSync(
      `node redactImage.js ${projectId} ${testImage} 'LIKELIHOOD_UNSPECIFIED' 'PHONE_NUMBER' ${testName}.actual.png`
    );
    assert.match(output, /Saved image redaction results to path/);
    const difference = await getImageDiffPercentage(
      `${testName}.actual.png`,
      `${testResourcePath}/${testName}.expected.png`
    );
    assert.isBelow(difference, 0.1);
  });

  it('should redact multiple sensitive data types from an image', async () => {
    const testName = 'redact-multiple-types';
    const output = execSync(
      `node redactImage.js ${projectId} ${testImage} LIKELIHOOD_UNSPECIFIED 'PHONE_NUMBER,EMAIL_ADDRESS' ${testName}.actual.png`
    );
    assert.match(output, /Saved image redaction results to path/);
    const difference = await getImageDiffPercentage(
      `${testName}.actual.png`,
      `${testResourcePath}/${testName}.expected.png`
    );
    assert.isBelow(difference, 0.1);
  });

  it('should report info type errors', () => {
    let output;
    try {
      output = execSync(
        `node redactText.js ${projectId} "My email is jenny@example.com" LIKELIHOOD_UNSPECIFIED 'NONEXISTENT'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  it('should report image redaction handling errors', () => {
    let output;
    try {
      output = execSync(
        `node redactImage.js ${projectId} ${testImage} output.png BAD_TYPE`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });
});
