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

function main(projectId, enabled, filter) {
  enabled = enabled === 'true';

  // [START monitoring_alert_enable_policies]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.AlertPolicyServiceClient();

  async function enablePolicies() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'YOUR_PROJECT_ID';
    // const enabled = true;
    // const filter = 'A filter for selecting policies, e.g. description:"cloud"';

    const listAlertPoliciesRequest = {
      name: client.projectPath(projectId),
      // See https://cloud.google.com/monitoring/alerting/docs/sorting-and-filtering
      filter: filter,
    };

    const [policies] = await client.listAlertPolicies(listAlertPoliciesRequest);
    const responses = [];
    for (const policy of policies) {
      responses.push(
        await client.updateAlertPolicy({
          updateMask: {
            paths: ['enabled'],
          },
          alertPolicy: {
            name: policy.name,
            enabled: {
              value: enabled,
            },
          },
        })
      );
    }
    responses.forEach(response => {
      const alertPolicy = response[0];
      console.log(`${enabled ? 'Enabled' : 'Disabled'} ${alertPolicy.name}.`);
    });
  }
  enablePolicies();
  // [END monitoring_alert_enable_policies]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
