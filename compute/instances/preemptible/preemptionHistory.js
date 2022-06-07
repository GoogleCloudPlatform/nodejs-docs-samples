// Copyright 2022 Google LLC
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
 * Gets a list of preemption operations from given zone in a project.
 * Optionally limit the results to instance name.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b.
 * @param {string} instanceName - Name of the virtual machine to look for.
 * @param {string} customFilter - Filter string to be used for this listing operation.
 */
function main(projectId, zone, instanceName = '', customFilter = '') {
  // [START compute_preemptible_history]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const customFilter = 'operationType="compute.instances.preempted"';

  const compute = require('@google-cloud/compute');

  async function preemptionHistory() {
    const zoneOperationsClient = new compute.ZoneOperationsClient();

    let filter;

    if (customFilter !== '') {
      filter = customFilter;
    } else {
      filter = 'operationType="compute.instances.preempted"';

      if (instanceName !== '') {
        filter += ` AND targetLink="https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/instances/${instanceName}"`;
      }
    }

    const [operationsList] = await zoneOperationsClient.list({
      project: projectId,
      zone,
      filter,
    });

    for (const operation of operationsList) {
      const thisInstanceName = operation.targetLink.split('/').pop();
      if (thisInstanceName === instanceName) {
        // The filter used is not 100% accurate, it's `contains` not `equals`
        // So we need to check the name to make sure it's the one we want.
        console.log(`- ${instanceName} ${operation.insertTime}`);
      }
    }
  }

  preemptionHistory();
  // [END compute_preemptible_history]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
