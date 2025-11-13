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

const projectId = process.env.CAIP_PROJECT_ID;
const sample = require('../image-generation/imggen-scribble-ctrl-type-with-txt-img');
const {delay} = require('./util');
const {createOutputGcsUri} = require('./imggen-util');
const location = 'us-central1';

describe('imggen-scribble-ctrl-type-with-txt-img', async () => {
  it('should generate images from a text prompt with control reference image', async function () {
    this.timeout(600000);
    this.retries(3);

    const output = await createOutputGcsUri();
    console.log('Output GCS URI:', output.uri);

    try {
      await delay(this.test);
      const generatedFileNames = await sample.generateImage(
        output.uri,
        projectId,
        location
      );
      console.log('Generated files:', generatedFileNames);

      assert(generatedFileNames.length > 0);
    } catch (err) {
      console.error('Image generation failed:', err);
      throw err;
    }
  });
});
