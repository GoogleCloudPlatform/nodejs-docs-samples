// Copyright 2020 Google LLC
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
const cleanup = require('./clean.js');
const {describe, before, it} = require('mocha');
const {
  GameServerDeploymentsServiceClient,
} = require('@google-cloud/game-servers');

const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Game Server Deployment Test', () => {
  const client = new GameServerDeploymentsServiceClient();
  let deploymentId;
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
    deploymentId = `test-${uuid.v4()}`;

    await cleanup();
  });

  it('should create a game server deployment', async () => {
    const create_output = execSync(
      `node create_deployment.js ${projectId} ${deploymentId}`
    );
    assert.match(create_output, /Deployment name:/);
  });

  it('should get a game server deployment', async () => {
    const get_output = execSync(
      `node get_deployment.js ${projectId} ${deploymentId}`
    );
    assert.match(get_output, /Deployment name:/);
  });

  it('should list a game server deployment', async () => {
    const list_output = execSync(
      `node list_deployments.js ${projectId} ${deploymentId}`
    );
    assert.match(list_output, /Deployment name:/);
  });

  it('should delete a game server deployment', async () => {
    const delete_output = execSync(
      `node delete_deployment.js ${projectId} ${deploymentId}`
    );
    assert.match(delete_output, /deleted./);
  });
});
