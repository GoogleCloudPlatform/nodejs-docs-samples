/**
 * Copyright 2022, Google, Inc.
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

function main(projectId, location, inputId) {
  // [START livestream_update_input]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // inputId = 'my-input';

  // Imports the Livestream library
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;

  // Instantiates a client
  const livestreamServiceClient = new LivestreamServiceClient();

  async function updateInput() {
    // Construct request
    const request = {
      input: {
        name: livestreamServiceClient.inputPath(projectId, location, inputId),
        preprocessingConfig: {
          crop: {
            topPixels: 5,
            bottomPixels: 5,
          },
        },
      },
      updateMask: {
        paths: ['preprocessing_config'],
      },
    };

    // Run request
    const [operation] = await livestreamServiceClient.updateInput(request);
    const response = await operation.promise();
    const [input] = response;
    console.log(`Updated input: ${input.name}`);
  }

  updateInput();
  // [END livestream_update_input]
}

// node updateInput.js <projectId> <location> <inputId>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
