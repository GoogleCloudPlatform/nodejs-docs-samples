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

/**
 * Deletes a firewall rule from the project.
 *
 * @param {string} projectId - project ID or project number of the Cloud project you want to use.
 * @param {string} firewallRuleName - name of the rule you want to modify.
 */
function main(projectId, firewallRuleName) {
  // [START compute_firewall_delete]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const firewallRuleName = 'FIREWALL_RULE_NAME';

  const compute = require('@google-cloud/compute');

  async function deleteFirewallRule() {
    const firewallsClient = new compute.FirewallsClient();
    const operationsClient = new compute.GlobalOperationsClient();

    const [response] = await firewallsClient.delete({
      project: projectId,
      firewall: firewallRuleName,
    });
    let operation = response.latestResponse;

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }

    console.log('Firewall rule deleted');
  }

  deleteFirewallRule();
  // [END compute_firewall_delete]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
