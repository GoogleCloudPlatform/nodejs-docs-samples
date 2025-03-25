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
const {assert} = require('chai');
const {describe, it} = require('mocha');
const aiplatform = require('@google-cloud/aiplatform');
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const apiEndpoint = 'us-central1-aiplatform.googleapis.com';
const project = process.env.CAIP_PROJECT_ID;
const outputDir = 'gs://ucaip-samples-us-central1/training_pipeline_output';
const job_names = [null];

describe('AI platform tune text-embedding models', () => {
  it('should make tuned-text embedding models', async () => {
    const stdout = execSync(
      `node ./embedding-model-tuning.js ${apiEndpoint} ${project} ${outputDir}`,
      {cwd}
    );
    const match = stdout.match(/job_name: (?<N>\S+).+job_state: (?<S>\S+)/s);
    assert.isNotNull(match);
    assert.notEqual(match.groups.S, 'PIPELINE_STATE_FAILED');
    job_names[0] = match.groups.N;
  });
});
after(async () => {
  const pipelineClient = new aiplatform.v1.PipelineServiceClient({apiEndpoint});
  pipelineClient.cancelPipelineJob({name: job_names[0]}).then(() => {
    return pipelineClient.deletePipelineJob({name: job_names[0]});
  });
});
