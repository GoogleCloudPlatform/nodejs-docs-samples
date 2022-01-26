// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


'use strict';

function main(projectId) {
  // [START cloudbuild_v1_generated_CloudBuild_ListBuildTriggers_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  The parent of the collection of `Triggers`.
   *  Format: `projects/{project}/locations/{location}`
   */
  // const parent = 'abc123'
  /**
   *  Required. ID of the project for which to list BuildTriggers.
   */
  // const projectId = 'abc123'
  /**
   *  Number of results to return in the list.
   */
  // const pageSize = 1234
  /**
   *  Token to provide to skip to a particular spot in the list.
   */
  // const pageToken = 'abc123'

  // Imports the Cloudbuild library
  const {CloudBuildClient} = require('@google-cloud/cloudbuild').v1;

  // Instantiates a client
  const cloudbuildClient = new CloudBuildClient();

  async function callListBuildTriggers() {
    // Construct request
    const request = {
      projectId,
    };

    // Run request
    const iterable = await cloudbuildClient.listBuildTriggersAsync(request);
    for await (const response of iterable) {
        console.log(response);
    }
  }

  callListBuildTriggers();
  // [END cloudbuild_v1_generated_CloudBuild_ListBuildTriggers_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
