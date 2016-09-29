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

const storage = require(`@google-cloud/storage`)();
const uuid = require(`node-uuid`);
const path = require(`path`);
const run = require(`../../utils`).run;

const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node buckets.js`;

describe('storage:buckets', () => {
  after((done) => {
    storage.bucket(bucketName).delete(() => {
      // Ignore any error
      done();
    });
  });

  it(`should create a bucket`, (done) => {
    const output = run(`${cmd} create ${bucketName}`, cwd);
    assert.equal(output, `Bucket ${bucketName} created.`);
    storage.bucket(bucketName).exists((err, exists) => {
      assert.ifError(err);
      assert.equal(exists, true);
      done();
    });
  });

  it(`should list buckets`, (done) => {
    // Listing is eventually consistent. Give the indexes time to update.
    setTimeout(() => {
      const output = run(`${cmd} list`, cwd);
      assert.notEqual(output.indexOf(`Buckets:`), -1);
      assert.notEqual(output.indexOf(bucketName), -1);
      done();
    }, 5000);
  });

  it(`should delete a bucket`, (done) => {
    const output = run(`${cmd} delete ${bucketName}`, cwd);
    assert.equal(output, `Bucket ${bucketName} deleted.`);
    storage.bucket(bucketName).exists((err, exists) => {
      assert.ifError(err);
      assert.equal(exists, false);
      done();
    });
  });
});
