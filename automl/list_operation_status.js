// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

function main(projectId = 'YOUR_PROJECT_ID', location = 'us-central1') {
  // [START automl_list_operation_status]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require('@google-cloud/automl').v1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function listOperationStatus() {
    // Construct request
    const request = {
      name: client.locationPath(projectId, location),
      filter: `worksOn=projects/${projectId}/locations/${location}/models/*`,
    };

    const [response] = await client.operationsClient.listOperations(request);

    console.log('List of operation status:');
    for (const operation of response) {
      console.log(`Name: ${operation.name}`);
      console.log('Operation details:');
      console.log(`${operation}`);
    }
  }

  listOperationStatus();
  // [END automl_list_operation_status]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
