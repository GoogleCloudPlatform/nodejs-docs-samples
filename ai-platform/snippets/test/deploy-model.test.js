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
const {after, describe, it} = require('mocha');

const uuid = require('uuid').v4;
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const endpointDisplayName = `temp_create_endpoint_test_${uuid()}`;

const modelId = '4190810559500779520';
const deployedModelDisplayName = `temp_deploy_model_test_${uuid()}`;
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';
let deployedModelId;
let endpointId;

describe('AI platform deploy model', () => {
  it('should deploy the model in the specified endpoint', async () => {
    const endOut =
      execSync(`node ./create-endpoint.js ${endpointDisplayName} ${project} \
                                   ${location}`);
    endpointId = endOut
      .split('/locations/us-central1/endpoints/')[1]
      .split('\n')[0]
      .split('/')[0];
    const stdout =
      execSync(`node ./deploy-model.js ${modelId} ${deployedModelDisplayName} \
                                ${endpointId} \
                                ${project} ${location}`);
    assert.match(stdout, /Deploy model response/);
    deployedModelId = stdout.split('Id : ')[1].split('\n')[0];
  });

  after('should undeploy the deployed model', async () => {
    // If test failed, the attempt to undeploy will fail too.
    // Check to see whether we have a deployedModelId
    if (deployedModelId === undefined) {
      return;
    }

    execSync(`node ./undeploy-model.js ${deployedModelId} ${endpointId} ${project} \
                                  ${location}`);
    execSync(`node ./delete-endpoint.js ${endpointId} ${project} ${location}`);
  });
});
