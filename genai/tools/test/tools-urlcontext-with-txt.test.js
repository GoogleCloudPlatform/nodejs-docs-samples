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

const {describe, it} = require('mocha');

const projectId = process.env.CAIP_PROJECT_ID;
const sample = require('../tools-urlcontext-with-txt');
const {delay} = require('../../test/util');
const {assert} = require('chai');

describe('tools-urlcontext-with-txt', () => {
  it('should create urlcontext with txt', async function () {
    this.timeout(180000);
    this.retries(4);
    await delay(this.test);
    const output = await sample.generateContent(projectId);
    assert(output.length > 0);
  });
});
