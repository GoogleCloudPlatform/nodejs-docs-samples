// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const quickstart = require('../index');
const {assert} = require('chai');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION_ID = 'us-central1';
const WORKFLOW = 'myFirstWorkflow';

describe('Cloud Workflows Quickstart Tests', () => {
  it('should execute the quickstart', async () => {
    // Ensure project is configured
    assert.notEqual(PROJECT_ID, undefined, 'GOOGLE_CLOUD_PROJECT must be set');

    // Execute workflow, with long test timeout
    const result = await quickstart(
      PROJECT_ID,
      LOCATION_ID,
      WORKFLOW
    );
    assert.isTrue(result.length > 0);
  }).timeout(5_000);
});
