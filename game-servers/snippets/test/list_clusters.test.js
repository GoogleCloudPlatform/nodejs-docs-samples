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
const {describe, it, before, after} = require('mocha');
const {
  RealmsServiceClient,
  GameServerClustersServiceClient,
} = require('@google-cloud/game-servers');

const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const LOCATION = 'us-central1';
const GKE_CLUSTER_NAME =
  process.env.SAMPLE_CLUSTER_NAME ||
  'projects/217093627905/locations/us-central1/clusters/gke-shared-default';

describe('Game Servers List Clusters Test', () => {
  const realmsClient = new RealmsServiceClient();
  const gameClustersClient = new GameServerClustersServiceClient();
  let realmId, gameClusterId;

  before(async () => {
    await cleanup();

    // Create a realm
    const projectId = await realmsClient.getProjectId();
    realmId = `list-realm-${uuid.v4()}`;
    gameClusterId = `test-${uuid.v4()}`;

    const createRealmRequest = {
      parent: `projects/${projectId}/locations/${LOCATION}`,
      realmId: realmId,
      realm: {
        timeZone: 'US/Pacific',
        description: 'Test Game Server realm',
      },
    };

    const [operation1] = await realmsClient.createRealm(createRealmRequest);
    await operation1.promise();

    // Create a cluster
    const createClusterRequest = {
      parent: `projects/${projectId}/locations/${LOCATION}/realms/${realmId}`,
      gameServerClusterId: gameClusterId,
      gameServerCluster: {
        description: 'My Game Server Cluster',
        connectionInfo: {
          gkeClusterReference: {
            // Provide full resource name of a Kubernetes Engine cluster
            cluster: GKE_CLUSTER_NAME,
          },
          namespace: 'default',
        },
      },
    };

    const [operation2] =
      await gameClustersClient.createGameServerCluster(createClusterRequest);
    await operation2.promise();
  });

  it('should list Game Server clusters in a realm', async () => {
    const projectId = await realmsClient.getProjectId();

    const create_output = execSync(
      `node list_clusters.js ${projectId} ${LOCATION} ${realmId}`
    );
    assert.match(create_output, /Cluster name:/);
  });

  after(async () => {
    const projectId = await realmsClient.getProjectId();

    // Delete the Game Server cluster
    const deleteClusterRequest = {
      // Provide full resource name of a Game Server Realm
      name: `projects/${projectId}/locations/${LOCATION}/realms/${realmId}/gameServerClusters/${gameClusterId}`,
    };
    const [operation1] =
      await gameClustersClient.deleteGameServerCluster(deleteClusterRequest);
    await operation1.promise();

    // Delete the realm
    const deleteRealmRequest = {
      name: `projects/${projectId}/locations/${LOCATION}/realms/${realmId}`,
    };
    const [operation2] = await realmsClient.deleteRealm(deleteRealmRequest);
    await operation2.promise();
  });
});
