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
  // [START monitoring_alert_list_policies]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  async function listPolicies() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'YOUR_PROJECT_ID';

    const listAlertPoliciesRequest = {
      name: client.projectPath(projectId),
    };
    const [policies] = await client.listAlertPolicies(listAlertPoliciesRequest);
    console.log('Policies:');
    policies.forEach(policy => {
      console.log(`  Display name: ${policy.displayName}`);
      if (policy.documentation && policy.documentation.content) {
        console.log(`     Documentation: ${policy.documentation.content}`);
      }
    });
  }
  listPolicies();
  // [END monitoring_alert_list_policies]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
