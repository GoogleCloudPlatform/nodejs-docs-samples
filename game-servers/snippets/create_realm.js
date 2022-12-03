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
 * Create a Game Servers realm.
 * @param {string} projectId string project identifier.
 * @param {string} location Compute Engine region.
 * @param {string} realmId a unique identifier for the new realm
 */
async function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'LOCATION_ID',
  realmId = 'REALM_ID'
) {
  // [START cloud_game_servers_realm_create]
  const {RealmsServiceClient} = require('@google-cloud/game-servers');

  const client = new RealmsServiceClient();

  async function createRealm() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const location = 'A Compute Engine region, e.g. "us-central1"';
    // const realmId = 'A unique identifier for the realm';
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      realmId: realmId,
      realm: {
        // Must use a supported time zone name.
        // See https://cloud.google.com/dataprep/docs/html/Supported-Time-Zone-Values_66194188
        timeZone: 'US/Pacific',
        description: 'My Game Server realm',
      },
    };

    const [operation] = await client.createRealm(request);
    const results = await operation.promise();
    const [realm] = results;

    console.log('Realm created:');

    console.log(`\tRealm name: ${realm.name}`);
    console.log(`\tRealm description: ${realm.description}`);
    console.log(`\tRealm time zone: ${realm.timeZone}`);
  }

  createRealm();
  // [END cloud_game_servers_realm_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
