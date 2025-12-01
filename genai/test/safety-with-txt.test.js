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
const sample = require('../safety/safety-with-txt.js');
const {delay} = require('./util');

describe('safety-with-txt', () => {
  it('should call generateContentStream with safety instructions', async function () {
    this.timeout(50000);
    this.retries(4);
    await delay(this.test);
    const output = await sample.generateWithSafetySettings(projectId);
    console.log('output', output);
    assert.isObject(output);
  });
});
