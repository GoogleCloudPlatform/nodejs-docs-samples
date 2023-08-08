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

function main(projectId, location, poolId) {
  // [START livestream_get_pool]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // poolId = 'my-pool';

  // Imports the Livestream library
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;

  // Instantiates a client
  const livestreamServiceClient = new LivestreamServiceClient();

  async function getPool() {
    // Construct request
    const request = {
      name: livestreamServiceClient.poolPath(projectId, location, poolId),
    };
    const [pool] = await livestreamServiceClient.getPool(request);
    console.log(`Pool: ${pool.name}`);
  }

  getPool();
  // [END livestream_get_pool]
}

// node getPool.js <projectId> <location> <poolId>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
