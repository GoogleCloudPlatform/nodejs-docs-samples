/**
 * Copyright 2023 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function main(projectId, location, poolId, peeredNetwork) {
  // [START livestream_update_pool]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // poolId = 'my-pool';
  // peeredNetwork = 'projects/my-network-project-number/global/networks/my-network-name';

  // Imports the Livestream library
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;

  // Instantiates a client
  const livestreamServiceClient = new LivestreamServiceClient();

  async function updatePool() {
    // Construct request
    const request = {
      pool: {
        name: livestreamServiceClient.poolPath(projectId, location, poolId),
        networkConfig: {
          peeredNetwork: peeredNetwork,
        },
      },
      updateMask: {
        paths: ['network_config'],
      },
    };

    // Run request
    const [operation] = await livestreamServiceClient.updatePool(request);
    const response = await operation.promise();
    const [pool] = response;
    console.log(`Updated pool: ${pool.name}`);
  }

  updatePool();
  // [END livestream_update_pool]
}

// node updatePool.js <projectId> <location> <poolId>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
