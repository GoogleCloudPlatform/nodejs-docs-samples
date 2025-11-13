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
const sample = require('../image-generation/imggen-subj-refer-ctrl-refer-with-txt-imgs');
const {delay} = require('./util');
const {createOutputGcsUri} = require('./imggen-util');
const location = 'us-central1';

describe('imggen-subj-refer-ctrl-refer-with-txt-imgs', async () => {
  it('should generate images from a text prompt with subject reference image and control reference image', async function () {
    this.timeout(180000);
    this.retries(4);
    const output = await createOutputGcsUri();
    console.log(output.uri);
    await delay(this.test);
    const generatedFileNames = await sample.generateImage(
      output.uri,
      projectId,
      location
    );
    assert(generatedFileNames.length > 0);
  });
});
