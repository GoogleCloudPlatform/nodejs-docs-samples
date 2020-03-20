// Copyright 2019 Google LLC
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

const {Storage} = require('@google-cloud/storage');
const cp = require('child_process');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const storage = new Storage();
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cmd = `node batch_parse_table.js`;

const testParseTable = {
  projectId: process.env.GCLOUD_PROJECT,
  location: 'us-central1',
  gcsOutputUriPrefix: uuid.v4(),
};

describe(`Document AI batch parse table`, () => {
  before(async () => {
    await storage.createBucket(bucketName);
  });

  after(async () => {
    const bucket = storage.bucket(bucketName);
    await bucket.deleteFiles({force: true});
    await bucket.delete();
  });

  it(`should parse the GCS invoice example as as table`, async () => {
    const output = execSync(
      `${cmd} ${testParseTable.projectId} ${testParseTable.location} gs://${bucketName}`
    );
    assert.match(output, /First detected language:/);
  });
});
