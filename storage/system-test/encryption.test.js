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

const fs = require('fs');
const path = require('path');
const run = require(`../../utils`).run;
const storage = require('@google-cloud/storage')();
const uuid = require('node-uuid');

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);
const cmd = `node encryption.js`;

const fileName = `test.txt`;
const filePath = path.join(__dirname, `../resources`, fileName);
const downloadFilePath = path.join(__dirname, `../resources/downloaded.txt`);

describe('storage:encryption', () => {
  let key;

  before(() => bucket.create(bucketName));

  after(() => {
    try {
      // Delete the downloaded file
      fs.unlinkSync(downloadFilePath);
    } catch (err) {
      console.log(err);
    }
    // Try deleting all files twice, just to make sure. Ignore any errors.
    return bucket.deleteFiles({ force: true })
      .then(() => bucket.deleteFiles({ force: true }), () => {})
      .then(() => bucket.delete(), () => {})
      .catch(() => {});
  });

  it(`should generate a key`, () => {
    const output = run(`${cmd} generate-encryption-key`, cwd);
    assert.equal(output.includes(`Base 64 encoded encryption key:`), true);
    const test = /^Base 64 encoded encryption key: (.+)$/;
    key = output.match(test)[1];
  });

  it(`should upload a file`, () => {
    const output = run(`${cmd} upload ${bucketName} ${filePath} ${fileName} ${key}`, cwd);
    assert.equal(output, `File ${filePath} uploaded to ${fileName}.`);
    return bucket.file(fileName).exists()
      .then((results) => {
        assert.equal(results[0], true);
      });
  });

  it(`should download a file`, () => {
    const output = run(`${cmd} download ${bucketName} ${fileName} ${downloadFilePath} ${key}`, cwd);
    assert.equal(output, `File ${fileName} downloaded to ${downloadFilePath}.`);
    assert.doesNotThrow(() => {
      fs.statSync(downloadFilePath);
    });
  });

  it(`should rotate keys`, () => {
    assert.throws(() => {
      run(`${cmd} rotate ${bucketName} ${fileName} ${key} ${key}`, cwd);
    }, Error, `This is currently not available using the Cloud Client Library.`);
  });
});
