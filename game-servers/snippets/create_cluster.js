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
 * Create a Game Servers cluster.
 * @param {string} projectId string project identifier
 * @param {string} location Compute Engine region
 * @param {string} realmId the realm to use
 * @param {string} gameClusterId unique identifier for the new Game Cluster
 * @param {string} gkeClusterName The full resource name of the GKE cluster to use
 */
async function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'LOCATION_ID',
  realmId = 'REALM_ID',
  gameClusterId = 'GAME_CLUSTER_ID',
  gkeClusterName = 'GKE_CLUSTER_NAME'
) {
  // [START cloud_game_servers_cluster_create]
  const {
    GameServerClustersServiceClient,
  } = require('@google-cloud/game-servers');

  const client = new GameServerClustersServiceClient();

  async function createGameServerCluster() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const location = 'A Compute Engine region, e.g. "us-central1"';
    // const realmId = 'The ID of the realm to locate this cluster in';
    // const gameClusterId = 'A unique ID for this Game Server Cluster';
    // const gkeClusterName= 'The full resource name of the GKE cluster to use';
    const request = {
      // Provide full resource name of a Game Server Realm
      parent: client.realmPath(projectId, location, realmId),
      gameServerClusterId: gameClusterId,
      gameServerCluster: {
        description: 'My Game Server Cluster',
        connectionInfo: {
          gkeClusterReference: {
            // Provide full resource name of a Kubernetes Engine cluster
            // In the form of 'projects/<project-id>/locations/<location>/clusters/<gke-cluster-name>'
            cluster: gkeClusterName,
          },
          namespace: 'default',
        },
      },
    };

    const [operation] = await client.createGameServerCluster(request);
    const [result] = await operation.promise();

    console.log('Game Server Cluster created:');
    console.log(`\tCluster name: ${result.name}`);
    console.log(`\tCluster description: ${result.description}`);
    console.log(
      `\tGKE cluster: ${result.connectionInfo.gkeClusterReference.cluster}`
    );
  }

  createGameServerCluster();
  // [END cloud_game_servers_cluster_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
