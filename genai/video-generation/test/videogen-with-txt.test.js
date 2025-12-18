// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');
const {Storage} = require('@google-cloud/storage');

const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const projectId = process.env.CAIP_PROJECT_ID;
const sample = require('../videogen-with-txt.js');
const {delay} = require('../../test/util');

const storage = new Storage();

const GCS_OUTPUT_BUCKET = 'nodejs-docs-samples-tests';

async function gcs_output_uri() {
  const dt = new Date();
  const prefix = `text_output/${dt.toISOString()}`;
  const fullUri = `gs://${GCS_OUTPUT_BUCKET}/${prefix}`;

  return {
    uri: fullUri,
    async cleanup() {
      const [files] = await storage.bucket(GCS_OUTPUT_BUCKET).getFiles({
        prefix,
      });
      for (const file of files) {
        await file.delete();
      }
    },
  };
}

describe('videogen-with-txt', async () => {
  it('should generate video content from a text prompt', async function () {
    this.timeout(180000);
    this.retries(4);
    await delay(this.test);
    const gscOutput = gcs_output_uri();
    const gscUri = (await gscOutput).uri;
    const output = await sample.generateVideo(gscUri, projectId, location);
    console.log('output', output);
    assert(output);
  });
});
