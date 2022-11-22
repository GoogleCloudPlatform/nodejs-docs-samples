// Copyright 2018 Google LLC
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
  // [START monitoring_alert_backup_policies]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  async function backupPolicies() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'YOUR_PROJECT_ID';

    const listAlertPoliciesRequest = {
      name: client.projectPath(projectId),
    };

    let [policies] = await client.listAlertPolicies(listAlertPoliciesRequest);

    // filter out any policies created by tests for this sample
    policies = policies.filter(policy => {
      return !policy.displayName.startsWith('gcloud-tests-');
    });

    fs.writeFileSync(
      './policies_backup.json',
      JSON.stringify(policies, null, 2),
      'utf-8'
    );

    console.log('Saved policies to ./policies_backup.json');
    // [END monitoring_alert_backup_policies]
  }
  backupPolicies();
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
