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
 * Modifies the priority of a given firewall rule.
 *
 * @param {string} projectId - project ID or project number of the Cloud project you want to use.
 * @param {string} firewallRuleName - name of the rule you want to modify.
 * @param {number} priority - the new priority to be set for the rule.
 */
function main(projectId, firewallRuleName, priority = 10) {
  // [START compute_firewall_patch]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const firewallRuleName = 'FIREWALL_RULE_NAME';
  // const priority = 10;

  const compute = require('@google-cloud/compute');
  const computeProtos = compute.protos.google.cloud.compute.v1;

  async function patchFirewallPriority() {
    const firewallsClient = new compute.FirewallsClient();
    const operationsClient = new compute.GlobalOperationsClient();

    const firewallRule = new computeProtos.Firewall();
    firewallRule.priority = priority;

    // The patch operation doesn't require the full definition of a Firewall object. It will only update
    // the values that were set in it, in this case it will only change the priority.
    const [response] = await firewallsClient.patch({
      project: projectId,
      firewall: firewallRuleName,
      firewallResource: firewallRule,
    });
    let operation = response.latestResponse;

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }

    console.log('Firewall rule updated');
  }

  patchFirewallPriority();
  // [END compute_firewall_patch]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
