// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
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

const projectId = process.env.CAIP_PROJECT_ID;

describe('tuning-textgen-with-txt', () => {
  it('should fetch tuning job and generate content', async function () {
    this.timeout(1000000);

    const mockTuningJob = {
      name: 'test-tuning-job',
      experiment: 'test-experiment',
      tunedModel: {
        model: 'test-model',
        endpoint: 'test-endpoint',
      },
    };

    const mockGenerateContentResult = {
      text: 'Because it is hot and glowing!',
    };

    class MockTunings {
      async get() {
        return mockTuningJob;
      }
    }

    class MockModels {
      async generateContent() {
        return mockGenerateContentResult;
      }
    }

    class MockGoogleGenAI {
      constructor() {
        this.tunings = new MockTunings();
        this.models = new MockModels();
      }
    }

    const sample = proxyquire('../tuning/tuning-textgen-with-txt.js', {
      '@google/genai': {GoogleGenAI: MockGoogleGenAI},
    });

    const response = await sample.generateContent(projectId);

    assert.strictEqual(response, 'Because it is hot and glowing!');
  });
});
