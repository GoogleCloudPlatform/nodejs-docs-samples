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
const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';

const sample = require('../text-generation/textgen-with-multi-local-img.js');
const {delay} = require('./util');

describe('textgen-with-multi-local-img', () => {
  it('should generate text content from multiple images', async function () {
    this.timeout(180000);
    this.retries(5);
    await delay(this.test);
    const imagePath1 = './test-data/latte.jpg';
    const imagePath2 = './test-data/scones.jpg';
    const output = await sample.generateContent(
      projectId,
      location,
      imagePath1,
      imagePath2
    );
    assert(output.length > 0);
  });
});
