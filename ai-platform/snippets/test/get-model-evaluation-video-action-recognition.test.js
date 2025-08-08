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

const modelId = '3530998029718913024';
const evaluationId = '305008923591573504';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

describe('AI platform get video action recognition model evaluation', () => {
  it('should get the evaluation from the specified model', async () => {
    const stdout = execSync(
      `node ./get-model-evaluation-video-action-recognition.js ${modelId} \
                                                             ${evaluationId} \
                                                             ${project} \
                                                             ${location}`
    );
    assert.match(
      stdout,
      /Get model evaluation video action recognition response/
    );
  });
});
