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
const sample = require('../live-structured-ouput-with-txt');

describe('live-structured-ouput-with-txt', () => {
  it('should extract structured information from text input using the model', async function () {
    this.timeout(18000);
    const output = await sample.generateStructuredTextResponse(projectId);
    console.log('Generated output:', output);
    assert(output.length > 0);
  });
});
