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
const {describe, it, beforeEach, afterEach} = require('mocha');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('imggen-scribble-ctrl-type-with-txt-img', () => {
  const projectId = process.env.CAIP_PROJECT_ID || 'mock-project-id';
  const location = 'us-central1';
  const MOCK_IMAGE_URI = 'gs://mock-bucket/mock-image.png';

  let sample;
  let editImageStub;

  beforeEach(() => {
    editImageStub = sinon.stub().resolves({
      generatedImages: [
        {
          image: {
            gcsUri: MOCK_IMAGE_URI,
          },
        },
      ],
    });

    sample = proxyquire('../imggen-scribble-ctrl-type-with-txt-img', {
      '@google/genai': {
        GoogleGenAI: class MockGoogleGenAI {
          constructor() {
            this.models = {
              editImage: editImageStub,
            };
          }
        },
        ControlReferenceImage: class MockControlReferenceImage {},
      },
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate images from a text prompt with control reference image', async () => {
    const mockOutputUri = 'gs://test-bucket/test';

    try {
      const generatedImages = await sample.generateImage(
        mockOutputUri,
        projectId,
        location
      );

      const apiCallArgs = editImageStub.firstCall.args[0];
      assert.strictEqual(apiCallArgs.model, 'imagen-3.0-capability-001');
      assert.isArray(generatedImages, 'The response should be an array');
      assert.lengthOf(
        generatedImages,
        1,
        'The array should contain one image object'
      );
      assert.strictEqual(
        generatedImages[0].image.gcsUri,
        MOCK_IMAGE_URI,
        'The generated URI should match the mock URI'
      );
    } catch (err) {
      console.error('Image generation failed:', err);
      throw err;
    }
  });
});
