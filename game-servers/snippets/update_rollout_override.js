// Copyright 2020, Google LLC.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * Rollout update to add override config.
 * @param {string} projectId string project identifier
 * @param {string} deploymentId unique identifier for the new Game Server Deployment
 * @param {string} configId unique identifier for the new Game Server Config
 * @param {string} realmId the unique ID of the realm
 * @param {string} realmLocation Compute Engine region for realm location.
 */
async function main(
  projectId = 'YOUR_PROJECT_ID',
  deploymentId = 'DEPLOYMENT_ID',
  configId = 'CONFIG_ID',
  realmId = 'REALM_ID',
  realmLocation = 'REALM_LOCATION'
) {
  // [START cloud_game_servers_deployment_rollout_override]
  const {
    GameServerDeploymentsServiceClient,
  } = require('@google-cloud/game-servers');

  const client = new GameServerDeploymentsServiceClient();

  async function rolloutGameServerDeploymentOverride() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const deploymentId = 'A unique ID for the Game Server Deployment';
    // const configId = 'A unique ID for the Game Server Config';
    // const realmId = 'A unique ID for the realm'
    // const realmLocation = 'compute engine region for realm location'
    const request = {
      rollout: {
        name: client.gameServerDeploymentPath(
          projectId,
          'global',
          deploymentId
        ),
        gameServerConfigOverrides: [
          {
            realmsSelector: {
              realms: [client.realmPath(projectId, realmLocation, realmId)],
            },
            configVersion: configId,
          },
        ],
      },
      updateMask: {
        paths: ['game_server_config_overrides'],
      },
    };

    const [operation] = await client.updateGameServerDeploymentRollout(request);
    const [deployment] = await operation.promise();

    console.log(`Deployment updated: ${deployment.name}`);
  }

  rolloutGameServerDeploymentOverride();

  // [END cloud_game_servers_deployment_rollout_override]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
