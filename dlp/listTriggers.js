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

'use strict';

// sample-metadata:
//  title: List Triggers
//  description: List Data Loss Prevention API job triggers.
//  usage: node listTriggers.js my-project

function main(projectId) {
  // [START dlp_list_triggers]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project'

  async function listTriggers() {
    // Construct trigger listing request
    const request = {
      parent: `projects/${projectId}/locations/global`,
    };

    // Helper function to pretty-print dates
    const formatDate = date => {
      const msSinceEpoch = parseInt(date.seconds, 10) * 1000;
      return new Date(msSinceEpoch).toLocaleString('en-US');
    };

    // Run trigger listing request
    const [triggers] = await dlp.listJobTriggers(request);
    triggers.forEach(trigger => {
      // Log trigger details
      console.log(`Trigger ${trigger.name}:`);
      console.log(`  Created: ${formatDate(trigger.createTime)}`);
      console.log(`  Updated: ${formatDate(trigger.updateTime)}`);
      if (trigger.displayName) {
        console.log(`  Display Name: ${trigger.displayName}`);
      }
      if (trigger.description) {
        console.log(`  Description: ${trigger.description}`);
      }
      console.log(`  Status: ${trigger.status}`);
      console.log(`  Error count: ${trigger.errors.length}`);
    });
  }

  listTriggers();
  // [END dlp_list_trigger]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
