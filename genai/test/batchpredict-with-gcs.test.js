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
const proxyquire = require('proxyquire');

const projectId = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';
const {delay} = require('./util');
const {GoogleGenAI_Mock} = require('./batchprediction-utils');

const sample = proxyquire('../batch-prediction/batchpredict-with-gcs', {
  '@google/genai': {
    GoogleGenAI: GoogleGenAI_Mock,
  },
});

async function getGcsOutputUri() {
  return {
    uri: 'gs://mock/output',
    async cleanup() {},
  };
}

describe('batchpredict-with-gcs (mocked)', () => {
  it('should return the batch job state', async function () {
    this.timeout(500000);
    this.retries(4);
    await delay(this.test);

    const gcsOutput = await getGcsOutputUri();

    try {
      const output = await sample.runBatchPredictionJob(
        gcsOutput.uri,
        projectId,
        location
      );

      console.log('output', output);
      assert.equal(output, 'JOB_STATE_SUCCEEDED');
    } finally {
      await gcsOutput.cleanup();
    }
  });
});
