// Copyright 2020 Google LLC
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

// sample-metadata:
//  title: Delete Trigger
//  description: Delete results of a Data Loss Prevention API job.
//  usage: node deleteTrigger.js my-rpoject projects/my-project/jobTriggers/my-trigger

function main(projectId, triggerId) {
  // [START dlp_delete_trigger]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project'

  // The name of the trigger to be deleted
  // Parent project ID is automatically extracted from this parameter
  // const triggerId = 'projects/my-project/triggers/my-trigger';

  async function deleteTrigger() {
    // Construct trigger deletion request
    const request = {
      name: triggerId,
    };

    // Run trigger deletion request
    await dlp.deleteJobTrigger(request);
    console.log(`Successfully deleted trigger ${triggerId}.`);
  }

  deleteTrigger();
  // [END dlp_delete_trigger]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
