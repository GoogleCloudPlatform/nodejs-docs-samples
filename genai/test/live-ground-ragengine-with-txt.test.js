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
const sinon = require('sinon');
const {describe, it, beforeEach, afterEach} = require('mocha');

const sample = require('../live/live-ground-ragengine-with-txt');

describe('live-ground-ragengine-with-txt', () => {
  let mockClient, mockSession;

  beforeEach(() => {
    mockSession = {
      async *receive() {
        yield {
          text: 'In December 2023, Google launched Gemini, their "most capable and general model". It\'s multimodal, meaning it understands and combines different types of information like text, code, audio, images, and video.',
        };
      },
      sendClientContent: sinon.stub().resolves(),
      close: sinon.stub().resolves(),
    };

    mockClient = {
      aio: {
        live: {
          connect: sinon.stub().resolves(mockSession),
        },
      },
    };

    sinon.stub(require('@google/genai'), 'GoogleGenAI').returns(mockClient);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return text from mocked RAG session', async function () {
    this.timeout(5000);

    const output = await sample.generateLiveRagTextResponse();

    console.log('Generated output:', output);

    assert(output.length > 0);
  });
});
