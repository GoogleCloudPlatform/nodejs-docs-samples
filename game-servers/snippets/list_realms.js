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
 * List all of the realms in a project.
 * @param {string} projectId string project identifier.
 * @param {string} location Compute Engine region.
 */
async function main(projectId = 'YOUR_PROJECT_ID', location = 'LOCATION_ID') {
  // [START cloud_game_servers_realm_list]
  const {RealmsServiceClient} = require('@google-cloud/game-servers');

  const client = new RealmsServiceClient();

  async function listRealms() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const location = 'A Compute Engine region, e.g. "us-central1"';
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
    };

    const [results] = await client.listRealms(request);
    for (const realm of results) {
      console.log(`Realm name: ${realm.name}`);
      console.log(`Realm description: ${realm.description}`);
      console.log(`Realm time zone: ${realm.timeZone}`);

      const createTime = realm.createTime;
      const createDate = new Date(createTime.seconds * 1000);
      console.log(`Realm created on: ${createDate.toLocaleDateString()}\n`);
    }
  }

  listRealms();
  // [END cloud_game_servers_realm_list]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
