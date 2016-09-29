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
const program = require('../encryption');
const run = require(`../../utils`).run;
const storage = require('@google-cloud/storage')();
const uuid = require('node-uuid');

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node encryption.js`;

const fileName = `test.txt`;
const filePath = path.join(__dirname, `../resources`, fileName);
const downloadFilePath = path.join(__dirname, `../resources/downloaded.txt`);

describe('storage:encryption', () => {
  let key;

  before((done) => {
    // Create an encryption key to use throughout the test
    key = program.generateEncryptionKey();
    // Create a test bucket
    storage.createBucket(bucketName, done);
  });

  after((done) => {
    try {
      // Delete the downloaded file
      fs.unlinkSync(downloadFilePath);
    } catch (err) {
      console.log(err);
    }
    // Delete any files that were uploaded
    storage.bucket(bucketName).deleteFiles({ force: true }, (err) => {
      assert.ifError(err);
      // Delete the test bucket
      storage.bucket(bucketName).delete(done);
    });
  });

  it(`should generate a key`, () => {
    const output = run(`${cmd} generate-encryption-key`, cwd);
    assert.notEqual(output.indexOf(`Base 64 encoded encryption key:`), -1);
  });

  it(`should upload a file`, (done) => {
    const output = run(`${cmd} upload ${bucketName} ${filePath} ${fileName} ${key}`, cwd);
    assert.equal(output, `File ${filePath} uploaded to ${fileName}.`);
    storage.bucket(bucketName).file(fileName).exists((err, exists) => {
      assert.ifError(err);
      assert.equal(exists, true);
      done();
    });
  });

  it(`should download a file`, (done) => {
    const output = run(`${cmd} download ${bucketName} ${fileName} ${downloadFilePath} ${key}`, cwd);
    assert.equal(output, `File ${fileName} downloaded to ${downloadFilePath}.`);
    storage.bucket(bucketName).file(fileName).exists((err, exists) => {
      assert.ifError(err);
      assert.doesNotThrow(() => {
        fs.statSync(downloadFilePath);
      });
      done();
    });
  });

  it(`should rotate keys`, () => {
    assert.throws(() => {
      run(`${cmd} rotate ${bucketName} ${fileName} ${key} ${key}`, cwd);
    }, Error, `This is currently not available using the Cloud Client Library.`);
  });
});
