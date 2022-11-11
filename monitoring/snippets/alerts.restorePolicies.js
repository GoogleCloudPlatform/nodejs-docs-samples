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
  // [START monitoring_alert_restore_policies]
  // [START monitoring_alert_create_policy]
  const fs = require('fs');

  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  async function restorePolicies() {
    // Note: The policies are restored one at a time due to limitations in
    // the API. Otherwise, you may receive a 'service unavailable'  error
    // while trying to create multiple alerts simultaneously.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'YOUR_PROJECT_ID';

    console.log('Loading policies from ./policies_backup.json');
    const fileContent = fs.readFileSync('./policies_backup.json', 'utf-8');
    const policies = JSON.parse(fileContent);

    for (const index in policies) {
      // Restore each policy one at a time
      let policy = policies[index];
      if (await doesAlertPolicyExist(policy.name)) {
        policy = await client.updateAlertPolicy({
          alertPolicy: policy,
        });
      } else {
        // Clear away output-only fields
        delete policy.name;
        delete policy.creationRecord;
        delete policy.mutationRecord;
        policy.conditions.forEach(condition => delete condition.name);

        policy = await client.createAlertPolicy({
          name: client.projectPath(projectId),
          alertPolicy: policy,
        });
      }

      console.log(`Restored ${policy[0].name}.`);
    }
    async function doesAlertPolicyExist(name) {
      try {
        const [policy] = await client.getAlertPolicy({
          name,
        });
        return policy ? true : false;
      } catch (err) {
        if (err && err.code === 5) {
          // Error code 5 comes from the google.rpc.code.NOT_FOUND protobuf
          return false;
        }
        throw err;
      }
    }
  }
  restorePolicies();
  // [END monitoring_alert_create_policy]
  // [END monitoring_alert_restore_policies]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
