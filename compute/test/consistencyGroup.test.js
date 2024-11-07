/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const assert = require('node:assert/strict');
const {describe, it} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Consistency group', async () => {
  const consistencyGroupName = `consistency-group-name-${uuid.v4()}`;
  const region = 'europe-central2';

  it('should create a new consistency group', () => {
    const response = execSync(
      `node ./disks/consistencyGroups/createConsistencyGroup.js ${consistencyGroupName} ${region}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(`Consistency group: ${consistencyGroupName} created.`)
    );
  });

  it('should delete consistency group', () => {
    const response = execSync(
      `node ./disks/consistencyGroups/deleteConsistencyGroup.js ${consistencyGroupName} ${region}`,
      {
        cwd,
      }
    );

    assert(
      response.includes(`Consistency group: ${consistencyGroupName} deleted.`)
    );
  });
});
