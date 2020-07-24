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
 * Create a Game Servers Config.
 * @param {string} projectId string project identifier
 * @param {string} deploymentId unique identifier for the parent Game Server Deployment
 * @param {string} configId unique identifier for the new Game Server Config
 * @param {string} fleetName fleet name to be stored in Agones
 */
async function main(
  projectId = 'YOUR_PROJECT_ID',
  deploymentId = 'DEPLOYMENT_ID',
  configId = 'CONFIG_ID',
  fleetName = 'FLEET_NAME'
) {
  // [START cloud_game_servers_config_create]
  const {
    GameServerConfigsServiceClient,
  } = require('@google-cloud/game-servers');

  const client = new GameServerConfigsServiceClient();

  async function createGameServerConfig() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const deploymentId = 'A unique ID for the Game Server Deployment';
    // const configId = 'A unique ID for the Game Server Config';
    // const fleetName = 'The fleet name to be stored in Agones';
    // fleet is the spec portion of an agones Fleet.  It must be in JSON format.
    // See https://agones.dev/site/docs/reference/fleet/ for more on fleets.
    const fleet = `
{
   "replicas": 10,
   "scheduling": "Packed",
   "strategy": {
      "type": "RollingUpdate",
      "rollingUpdate": {
         "maxSurge": "25%",
         "maxUnavailable": "25%"
      }
   },
   "template": {
      "metadata": {
         "labels": {
            "gameName": "udp-server"
         }
      },
      "spec": {
         "ports": [
            {
               "name": "default",
               "portPolicy": "Dynamic",
               "containerPort": 2156,
               "protocol": "TCP"
            }
         ],
         "health": {
            "initialDelaySeconds": 30,
            "periodSeconds": 60
         },
         "sdkServer": {
            "logLevel": "Info",
            "grpcPort": 9357,
            "httpPort": 9358
         },
         "template": {
            "spec": {
               "containers": [
                  {
                     "name": "dedicated",
                     "image": "gcr.io/agones-images/udp-server:0.17",
                     "imagePullPolicy": "Always",
                     "resources": {
                        "requests": {
                           "memory": "200Mi",
                           "cpu": "500m"
                        },
                        "limits": {
                           "memory": "200Mi",
                           "cpu": "500m"
                        }
                     }
                  }
               ]
            }
         }
      }
   }
}
`;
    const request = {
      parent: client.gameServerDeploymentPath(
        projectId,
        'global',
        deploymentId
      ),
      configId: configId,
      gameServerConfig: {
        fleetConfigs: [
          {
            name: fleetName,
            fleetSpec: fleet,
          },
        ],
        description: 'nodejs test config',
      },
    };

    const [operation] = await client.createGameServerConfig(request);
    const [result] = await operation.promise();

    console.log('Game Server Config created:');
    console.log(`\t Config name: ${result.name}`);
    console.log(`\t Config description: ${result.description}`);
  }

  createGameServerConfig();

  // [END cloud_game_servers_config_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
