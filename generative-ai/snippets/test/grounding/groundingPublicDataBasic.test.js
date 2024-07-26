// Copyright 2024 Google LLC
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

describe('Google search grounding', async () => {
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_LOCATION';
  // const model = 'gemini-1.5-flash-001';

  it('should ground results in public search data', async () => {
    const output = execSync(
      `node ./grounding/groundingPublicDataBasic.js ${projectId} ${location} ${model}`
    );
    assert(output.match(/GroundingMetadata.*[Ww]hy is the sky blue?/));
  });
});
