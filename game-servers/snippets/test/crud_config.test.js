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
const {describe, before, after, it} = require('mocha');
const {
  GameServerConfigsServiceClient,
  GameServerDeploymentsServiceClient,
} = require('@google-cloud/game-servers');

const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Game Server Config Test', () => {
  const client = new GameServerConfigsServiceClient();
  const deploymentClient = new GameServerDeploymentsServiceClient();
  let deploymentId;
  let configId;
  let projectId;

  before(async () => {
    await cleanup();

    projectId = await client.getProjectId();
    deploymentId = `test-${uuid.v4()}`;
    configId = `test-${uuid.v4()}`;

    const request = {
      parent: `projects/${projectId}/locations/global`,
      deploymentId: deploymentId,
    };
    const [operation] = await deploymentClient.createGameServerDeployment(
      request
    );
    await operation.promise();
  });

  it('should create a game server config', async () => {
    const create_output = execSync(
      `node create_config.js ${projectId} ${deploymentId} ${configId} nodejs_fleet_name`
    );
    assert.match(create_output, /Config name:/);
  });

  it('should get a game server config', async () => {
    const get_output = execSync(
      `node get_config.js ${projectId} ${deploymentId} ${configId}`
    );
    assert.match(get_output, /Config name:/);
  });

  it('should list a game server config', async () => {
    const list_output = execSync(
      `node list_configs.js ${projectId} ${deploymentId} ${configId}`
    );
    assert.match(list_output, /Config name:/);
  });

  it('should delete a game server config', async () => {
    const delete_output = execSync(
      `node delete_config.js ${projectId} ${deploymentId} ${configId}`
    );
    assert.match(delete_output, /deleted./);
  });

  after(async () => {
    // Delete the Game Server Deployment
    const request = {
      // Provide full resource name of a Game Server Deployment
      name: deploymentClient.gameServerDeploymentPath(
        projectId,
        'global',
        deploymentId
      ),
    };
    const [operation] = await deploymentClient.deleteGameServerDeployment(
      request
    );
    await operation.promise();
  });
});
