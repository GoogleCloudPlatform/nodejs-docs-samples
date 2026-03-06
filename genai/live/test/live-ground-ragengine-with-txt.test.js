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

const {delay} = require('../../test/util');

describe('live-ground-ragengine-with-txt', () => {
  it('should return text from mocked RAG session', async function () {
    const fakeSession = {
      sendClientContent: async () => {},
      close: async () => {},
    };

    const mockClient = {
      live: {
        connect: async (opts = {}) => {
          setImmediate(() =>
            opts.callbacks.onmessage({
              text: 'In December 2023, Google launched Gemini...',
              serverContent: {turnComplete: false},
            })
          );
          setImmediate(() =>
            opts.callbacks.onmessage({
              text: 'Mock final message.',
              serverContent: {turnComplete: true},
            })
          );

          return fakeSession;
        },
      },
    };

    const sample = proxyquire('../live-ground-ragengine-with-txt', {
      '@google/genai': {
        GoogleGenAI: function () {
          return mockClient;
        },
        Modality: {TEXT: 'TEXT'},
      },
    });

    this.timeout(10000);
    this.retries(4);
    await delay(this.test);
    const output = await sample.generateLiveRagTextResponse();
    console.log('Generated output:', output);
    assert(output.length > 0);
  });
});
