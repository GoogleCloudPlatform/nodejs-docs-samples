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

const {GameServerClustersServiceClient} = require('@google-cloud/game-servers');
const {RealmsServiceClient} = require('@google-cloud/game-servers');

const gameServerClusterClient = new GameServerClustersServiceClient();
const realmsClient = new RealmsServiceClient();

/**
 * Utility function for removing unneeded realms from project.
 */
module.exports = async () => {
  const projectId = await realmsClient.getProjectId();
  const location = 'us-central1';

  const request = {
    parent: `projects/${projectId}/locations/${location}`,
  };

  const MAX_REALM_LIFESPAN = 3600000; // One hour (in milliseconds)
  const NOW = new Date();

  const [results] = await realmsClient.listRealms(request);
  for (const realm of results) {
    // Check age of realm. If older than maximum life span, delete.
    const ageOfRealm = new Date(realm.createTime.seconds * 1000);
    if (NOW - ageOfRealm > MAX_REALM_LIFESPAN) {
      // First, delete all clusters associated with this realm.
      const clustersRequest = {
        parent: realm.name,
      };

      const clustersResult = await gameServerClusterClient.listGameServerClusters(
        clustersRequest
      );
      const [clusters] = clustersResult;
      for (const cluster of clusters.gameServerClusters) {
        const deleteClusterRequest = {
          name: cluster.name,
        };

        const [
          deleteClusterOperation,
        ] = await gameServerClusterClient.deleteGameServerCluster(
          deleteClusterRequest
        );
        await deleteClusterOperation.promise();
      }

      // Then delete the realm itself.
      const realmDeleteRequest = {
        name: realm.name,
      };

      const [deleteRealmOperation] = await realmsClient.deleteRealm(
        realmDeleteRequest
      );
      await deleteRealmOperation.promise();
    }
  }
};
