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
function main(projectId = 'YOUR_PROJECT_ID', location = 'LOCATION_ID') {
  // [START cloud_game_servers_list_realms]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'Your Google Cloud Project ID';
  // const location = 'A Compute Engine region, e.g. "us-central1"';
  const {RealmsServiceClient} = require('@google-cloud/game-servers');

  const client = new RealmsServiceClient();

  async function listRealms() {
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
    // [END cloud_game_servers_list_realms]
  }

  listRealms();
}

main(...process.argv.slice(2));
