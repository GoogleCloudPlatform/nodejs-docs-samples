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
 * Get a realm by ID
 * @param {string} projectId string project identifier.
 * @param {string} location Compute Engine region.
 * @param {string} realmId the unique ID of the realm
 */
async function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'LOCATION_ID',
  realmId = 'REALM_ID'
) {
  // [START cloud_game_servers_realm_get]
  const {RealmsServiceClient} = require('@google-cloud/game-servers');

  const client = new RealmsServiceClient();

  async function getRealm() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const location = 'A Compute Engine region, e.g. "us-central1"';
    // const realmId = 'Unique identifier of the realm';
    const request = {
      // Realm name is the full resource name including project ID and location
      name: client.realmPath(projectId, location, realmId),
    };

    const [realm] = await client.getRealm(request);
    console.log(`Realm name: ${realm.name}`);
    console.log(`Realm description: ${realm.description}`);
    console.log(`Realm time zone: ${realm.timeZone}`);

    const createTime = realm.createTime;
    const createDate = new Date(createTime.seconds * 1000);

    console.log(`Realm created on: ${createDate.toLocaleDateString()}`);
  }

  getRealm();
  // [END cloud_game_servers_realm_get]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
