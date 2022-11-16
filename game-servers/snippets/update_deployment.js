// Copyright 2021, Google LLC.
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
 * Update a Game Servers Deployment.
 * @param {string} projectId string project identifier
 * @param {string} deploymentId unique identifier for the Game Server Deployment
 */
async function main(
  projectId = 'YOUR_PROJECT_ID',
  deploymentId = 'DEPLOYMENT_ID'
) {
  // [START cloud_game_servers_deployment_update]
  const {
    GameServerDeploymentsServiceClient,
  } = require('@google-cloud/game-servers');

  const client = new GameServerDeploymentsServiceClient();

  async function updateGameServerDeployment() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const deploymentId = 'The unique ID for the Game Server Deployment';
    const request = {
      gameServerDeployment: {
        name: client.gameServerDeploymentPath(
          projectId,
          'global',
          deploymentId
        ),
        labels: {
          'label-key-1': 'label-value-1',
        },
        description: 'My updated Game Server deployment',
      },
      updateMask: {
        paths: ['labels', 'description'],
      },
    };

    const [operation] = await client.updateGameServerDeployment(request);
    const [result] = await operation.promise();

    console.log(`Deployment updated: ${result.name}`);
  }

  updateGameServerDeployment();

  // [END cloud_game_servers_deployment_update]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
