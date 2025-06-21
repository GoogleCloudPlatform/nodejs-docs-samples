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

import path from 'node:path';
import {assert} from 'chai';
import {describe, it} from 'mocha';
import cp from 'node:child_process';
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const modelId = '3512561418744365056';
const evaluationId = '9035588644970168320';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

describe('AI platform list model evaluation slices', () => {
  it('should list all the evaluation slices from the \
       specified model', async () => {
    const stdout = execSync(
      `node ./list-model-evaluation-slices.js ${modelId} \
                                                ${evaluationId} \
                                                ${project} \
                                                ${location}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /List model evaluation response/);
  });
});
