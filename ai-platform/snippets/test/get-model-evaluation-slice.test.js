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

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const modelId = '3512561418744365056';
const evaluationId = '9035588644970168320';
const sliceId = '6481571820677004173';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

describe('AI platform get model evaluation slice', () => {
  it('should get the evaluation slice from the specified model', async () => {
    const stdout = execSync(
      `node ./get-model-evaluation-slice.js ${modelId} ${evaluationId} \
                                              ${sliceId} ${project} \
                                              ${location}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Get model evaluation slice/);
  });
});
