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
 * Prints a list of all firewall rules in specified project.
 *
 * @param {string} projectId - project ID or project number of the Cloud project you want to use.
 */
function main(projectId) {
  // [START compute_firewall_list]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';

  const compute = require('@google-cloud/compute');

  async function listFirewallRules() {
    const firewallsClient = new compute.FirewallsClient();

    const [firewallRules] = await firewallsClient.list({
      project: projectId,
    });

    for (const rule of firewallRules) {
      console.log(` - ${rule.name}: ${rule.description}`);
    }
  }

  listFirewallRules();
  // [END compute_firewall_list]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
