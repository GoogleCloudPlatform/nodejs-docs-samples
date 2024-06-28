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

const spawnSync = require('node:child_process').spawnSync;

// TODO: replace chai with standard assert/strict
const {assert} = require('chai');
const {describe, it} = require('mocha');

// Can't use arrow function to access this context in describe hook, needed
// to pass the configured timeout to the hook's process runner (assertExec).
// eslint-disable-next-line prefer-arrow-callback
describe('Client v2 with sources and findings', async function () {
  // Spawn child process and assert that it exits normally.
  const assertChild = (...args) => {
    const result = spawnSync('node', args, {timeout: this.timeout()});
    const output = result.stdout.toString();
    console.log(output);
    console.error(result.stderr.toString());
    assert(
      result.status === 0,
      `process exited with non-zero status: ${result.status}`
    );
    return output;
  };

  // Register test for the child process.
  const testChild = (msg, ...args) => {
    it(msg, () => {
      assertChild(...args);
    });
  };

  testChild('can create source', 'v2/createSource.js');
  testChild('can create a finding', 'v2/createFinding.js');
  testChild('can list all findings', 'v2/listAllFindings.js');
  testChild('can list only some findings', 'v2/listFilteredFindings.js');
  testChild('can mute a finding', 'v2/setMuteFinding.js');
  testChild('can unmute a finding', 'v2/setUnmuteFinding.js');
  testChild('can group all findings', 'v2/groupFindings.js');
  testChild('can group filtered findings', 'v2/groupFindingsWithFilter.js');
  testChild('can bulk mute findings', 'v2/bulkMuteFindings.js');
  testChild('can get IAM policy', 'v2/getIamPolicy.js');
  testChild('can IAM policies', 'v2/testIam.js');
  testChild('can set access control policy on a source', 'v2/setIamPolicy.js');
  testChild('client can update a finding state', 'v2/setFindingState.js');
  testChild(
    'can create or update a finding source',
    'v2/updateFindingSource.js'
  );
  testChild(
    'can list all security sources in an organization',
    'v2/listAllSources.js'
  );
  testChild('client can create or update a source', 'v2/updateSource.js');
  testChild('client can get a specific source', 'v2/getSource.js');
});
