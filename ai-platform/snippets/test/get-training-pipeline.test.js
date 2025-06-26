/*
 * Copyright 2020 Google LLC
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

const {assert} = require('chai');
const {describe, it} = require('mocha');

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const trainingPipelineId = '1419759782528548864';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

describe('AI platform get training pipeline', () => {
  it('should get the specified training pipeline', async () => {
    const stdout = execSync(
      `node ./get-training-pipeline.js ${trainingPipelineId} ${project} ${location}`
    );
    assert.match(stdout, /Get training pipeline response/);
  });
});
