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

const fs = require(`fs`);
const storage = require(`@google-cloud/storage`)();
const uuid = require(`node-uuid`);
const path = require(`path`);
const run = require(`../../utils`).run;

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);
const fileName = `test.txt`;
const movedFileName = `test2.txt`;
const copiedFileName = `test3.txt`;
const filePath = path.join(__dirname, `../resources`, fileName);
const downloadFilePath = path.join(__dirname, `../resources/downloaded.txt`);
const cmd = `node files.js`;

describe('storage:files', () => {
  before(() => bucket.create());

  after(() => {
    try {
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

  it('should upload a file', () => {
    const output = run(`${cmd} upload ${bucketName} ${filePath}`, cwd);
    assert.equal(output, `File ${fileName} uploaded.`);
    return bucket.file(fileName).exists()
      .then((results) => {
        assert.equal(results[0], true);
      });
  });

  it('should download a file', () => {
    const output = run(`${cmd} download ${bucketName} ${fileName} ${downloadFilePath}`, cwd);
    assert.equal(output, `File ${fileName} downloaded to ${downloadFilePath}.`);
    assert.doesNotThrow(() => fs.statSync(downloadFilePath));
  });

  it('should move a file', () => {
    const output = run(`${cmd} move ${bucketName} ${fileName} ${movedFileName}`, cwd);
    assert.equal(output, `File ${fileName} moved to ${movedFileName}.`);
    return bucket.file(movedFileName).exists()
      .then((results) => {
        assert.equal(results[0], true);
      });
  });

  it('should copy a file', () => {
    const output = run(`${cmd} copy ${bucketName} ${movedFileName} ${bucketName} ${copiedFileName}`, cwd);
    assert.equal(output, `File ${movedFileName} copied to ${copiedFileName} in ${bucketName}.`);
    return bucket.file(copiedFileName).exists()
      .then((results) => {
        assert.equal(results[0], true);
      });
  });

  it('should list files', (done) => {
    // Listing is eventually consistent, give the indexes time to update
    setTimeout(() => {
      const output = run(`${cmd} list ${bucketName}`, cwd);
      assert.equal(output.includes(`Files:`), true);
      assert.equal(output.includes(movedFileName), true);
      assert.equal(output.includes(copiedFileName), true);
      done();
    }, 5000);
  });

  it('should list files by a prefix', () => {
    let output = run(`${cmd} list ${bucketName} test "/"`, cwd);
    assert.equal(output.includes(`Files:`), true);
    assert.equal(output.includes(movedFileName), true);
    assert.equal(output.includes(copiedFileName), true);
    output = run(`${cmd} list ${bucketName} foo`, cwd);
    assert.equal(output.includes(`Files:`), true);
    assert.equal(output.indexOf(movedFileName), -1);
    assert.equal(output.indexOf(copiedFileName), -1);
  });

  it('should make a file public', () => {
    const output = run(`${cmd} make-public ${bucketName} ${copiedFileName}`, cwd);
    assert.equal(output, `File ${copiedFileName} is now public.`);
  });

  it('should generate a signed URL for a file', () => {
    const output = run(`${cmd} generate-signed-url ${bucketName} ${copiedFileName}`, cwd);
    assert.equal(output.includes(`The signed url for ${copiedFileName} is `), true);
  });

  it('should get metadata for a file', () => {
    const output = run(`${cmd} get-metadata ${bucketName} ${copiedFileName}`, cwd);
    assert.equal(output.includes(`File: ${copiedFileName}`), true);
    assert.equal(output.includes(`Bucket: ${bucketName}`), true);
  });

  it('should delete a file', () => {
    const output = run(`${cmd} delete ${bucketName} ${copiedFileName}`, cwd);
    assert.equal(output, `File ${copiedFileName} deleted.`);
    return bucket.file(copiedFileName).exists()
      .then((results) => {
        assert.equal(results[0], false);
      });
  });
});
