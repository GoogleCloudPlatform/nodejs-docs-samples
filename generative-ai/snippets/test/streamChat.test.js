// Copyright 2023 Google LLC
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
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const projectId = process.env.CAIP_PROJECT_ID;
const location = process.env.LOCATION;
const model = 'gemini-1.5-flash-001';

describe('Generative AI Stream Chat', () => {
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_LOCATION';
  // const model = 'gemini-1.5-flash-001';

  it('should create stream chat and begin the conversation the same in each instance', async () => {
    const output = execSync(
      `node ./streamChat.js ${projectId} ${location} ${model}`
    );

    // Assert that the advice given for learning is what we expect
    assert(output.match(/User: How can I learn more about that/));
  });
});
