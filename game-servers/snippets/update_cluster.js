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
 * Update a Game Servers cluster.
 * @param {string} projectId string project identifier
 * @param {string} location Compute Engine region for the realm
 * @param {string} realmId the realm to use
 * @param {string} gameClusterId unique identifier for the Game Cluster
 */
async function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'LOCATION_ID',
  realmId = 'REALM_ID',
  gameClusterId = 'GAME_CLUSTER_ID'
) {
  // [START cloud_game_servers_cluster_update]
  const {
    GameServerClustersServiceClient,
  } = require('@google-cloud/game-servers');

  const client = new GameServerClustersServiceClient();

  async function updateGameServerCluster() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const location = 'A Compute Engine region, e.g. "us-central1"';
    // const realmId = 'The ID of the realm of this cluster';
    // const gameClusterId = 'A unique ID for this Game Server Cluster';
    const request = {
      // Provide full resource name of a Game Server Cluster
      gameServerCluster: {
        name: client.gameServerClusterPath(
          projectId,
          location,
          realmId,
          gameClusterId
        ),
        labels: {
          'label-key-1': 'label-value-1',
        },
        description: 'My updated Game Server Cluster',
      },
      updateMask: {
        paths: ['labels', 'description'],
      },
    };

    const [operation] = await client.updateGameServerCluster(request);
    const [result] = await operation.promise();

    console.log(`Cluster updated: ${result.name}`);
  }

  updateGameServerCluster();
  // [END cloud_game_servers_cluster_update]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
