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
const proxyquire = require('proxyquire').noCallThru();

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'test-project';

describe('tuning-job-get', () => {
  it('should get tuning job and return job name', async function () {
    this.timeout(1000000);

    const mockTuningJob = {
      name: 'test-tuning-job',
      experiment: 'test-experiment',
      tunedModel: {
        model: 'test-model',
        endpoint: 'test-endpoint',
      },
    };

    class MockTunings {
      async get({name}) {
        if (name !== 'TestJobName')
          throw new Error('Unexpected tuning job name');
        return mockTuningJob;
      }
    }

    class MockGoogleGenAI {
      constructor() {
        this.tunings = new MockTunings();
      }
    }

    const sample = proxyquire('../tuning/tuning-job-get.js', {
      '@google/genai': {GoogleGenAI: MockGoogleGenAI},
    });

    const response = await sample.getTuningJob('TestJobName', projectId);

    assert.strictEqual(response, 'test-tuning-job');
  });
});
