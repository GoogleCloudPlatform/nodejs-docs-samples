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

function main(projectId, trigger) {
  // [START cloudbuild_v1_generated_CloudBuild_CreateBuildTrigger_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  The parent resource where this trigger will be created.
   *  Format: `projects/{project}/locations/{location}`
   */
  // const parent = 'abc123'
  /**
   *  Required. ID of the project for which to configure automatic builds.
   */
  // const projectId = 'abc123'
  /**
   *  Required. `BuildTrigger` to create.
   */
  // const trigger = {}

  // Imports the Cloudbuild library
  const {CloudBuildClient} = require('@google-cloud/cloudbuild').v1;

  // Instantiates a client
  const cloudbuildClient = new CloudBuildClient();

  async function callCreateBuildTrigger() {
    // Construct request
    const request = {
      projectId,
      trigger,
    };

    // Run request
    const response = await cloudbuildClient.createBuildTrigger(request);
    console.log(response);
  }

  callCreateBuildTrigger();
  // [END cloudbuild_v1_generated_CloudBuild_CreateBuildTrigger_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
