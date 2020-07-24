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
  RealmsServiceClient,
} = require('@google-cloud/game-servers');

const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Game Server Rollout Test', () => {
  const configClient = new GameServerConfigsServiceClient();
  const deploymentClient = new GameServerDeploymentsServiceClient();
  const realmClient = new RealmsServiceClient();
  let projectId;
  const deploymentId = `test-nodejs-${uuid.v4()}`;
  const configId = `test-nodejs-${uuid.v4()}`;
  const realmId = `test-nodejs-${uuid.v4()}`;
  const realmLocation = 'us-central1';

  before(async () => {
    await cleanup();

    projectId = await deploymentClient.getProjectId();

    const request = {
      parent: `projects/${projectId}/locations/global`,
      deploymentId: deploymentId,
    };
    const [operation] = await deploymentClient.createGameServerDeployment(
      request
    );
    await operation.promise();

    const request2 = {
      parent: configClient.gameServerDeploymentPath(
        projectId,
        'global',
        deploymentId
      ),
      configId: configId,
    };
    const [operation2] = await configClient.createGameServerConfig(request2);
    await operation2.promise();

    const request3 = {
      parent: `projects/${projectId}/locations/${realmLocation}`,
      realmId: realmId,
      realm: {
        timeZone: 'US/Pacific',
        description: 'Test Game Server realm',
      },
    };

    const [operation3] = await realmClient.createRealm(request3);
    await operation3.promise();
  });

  it('should update rollout default', async () => {
    const updateDefaultOutput = execSync(
      `node update_rollout_default.js ${projectId} ${deploymentId} ${configId}`
    );

    assert.match(updateDefaultOutput, /Deployment updated:/);

    const getRolloutOutput = execSync(
      `node get_rollout.js ${projectId} ${deploymentId} ${configId}`
    );

    const configName = configClient.gameServerConfigPath(
      projectId,
      'global',
      deploymentId,
      configId
    );
    assert.match(getRolloutOutput, /Rollout name:/);
    assert.match(
      getRolloutOutput,
      new RegExp(`Rollout default: ${configName}`)
    );
  });

  it('should remove rollout default', async () => {
    const removeDefaultOutput = execSync(
      `node update_rollout_remove_default.js ${projectId} ${deploymentId} ${configId}`
    );

    assert.match(removeDefaultOutput, /Deployment updated:/);

    const request = {
      // The full resource name
      name: deploymentClient.gameServerDeploymentPath(
        projectId,
        'global',
        deploymentId
      ),
    };

    const [rollout] = await deploymentClient.getGameServerDeploymentRollout(
      request
    );
    assert.strictEqual(rollout.defaultGameServerConfig, '');
  });

  it('should update rollout override', async () => {
    const updateOverrideOutput = execSync(
      `node update_rollout_override.js ${projectId} ${deploymentId} ${configId} ${realmId} ${realmLocation}`
    );
    assert.match(updateOverrideOutput, /Deployment updated:/);

    const getRolloutOutput = execSync(
      `node get_rollout.js ${projectId} ${deploymentId} ${configId}`
    );

    const configName = configClient.gameServerConfigPath(
      projectId,
      'global',
      deploymentId,
      configId
    );
    const realmName = realmClient.realmPath(projectId, realmLocation, realmId);
    assert.match(
      getRolloutOutput,
      new RegExp(`Rollout config overrides: .*${configName}`)
    );
    assert.match(getRolloutOutput, new RegExp(realmName));
  });

  it('should remove rollout override', async () => {
    const removeOverrideOutput = execSync(
      `node update_rollout_remove_override.js ${projectId} ${deploymentId}`
    );

    assert.match(removeOverrideOutput, /Deployment updated:/);

    const request = {
      // The full resource name
      name: deploymentClient.gameServerDeploymentPath(
        projectId,
        'global',
        deploymentId
      ),
    };

    const [rollout] = await deploymentClient.getGameServerDeploymentRollout(
      request
    );
    assert.strictEqual(rollout.gameServerConfigOverrides.length, 0);
  });

  after(async () => {
    // Delete the Game Server Config
    const request = {
      // Provide full resource name of a Game Server Config
      name: configClient.gameServerConfigPath(
        projectId,
        'global',
        deploymentId,
        configId
      ),
    };
    const [operation] = await configClient.deleteGameServerConfig(request);
    await operation.promise();

    // Delete the Game Server Deployment
    const request2 = {
      // Provide full resource name of a Game Server Deployment
      name: deploymentClient.gameServerDeploymentPath(
        projectId,
        'global',
        deploymentId
      ),
    };
    const [operation2] = await deploymentClient.deleteGameServerDeployment(
      request2
    );
    await operation2.promise();

    // Delete the Realm
    const request3 = {
      // Provide full resource name of a Realm
      name: realmClient.realmPath(projectId, realmLocation, realmId),
    };
    const [operation3] = await realmClient.deleteRealm(request3);
    await operation3.promise();
  });
});
