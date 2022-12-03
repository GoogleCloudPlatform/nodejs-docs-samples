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
 * Prints if a given instance is preemptible or not.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to use, for example: us-west3-b
 * @param {string} instanceName - name of the virtual machine to check.
 */
function main(projectId, zone, instanceName) {
  // [START compute_preemptible_check]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';

  const compute = require('@google-cloud/compute');

  async function printPreemptible() {
    const instancesClient = new compute.InstancesClient();

    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: instanceName,
    });

    console.log(`Is instance preemptible: ${instance.scheduling.preemptible}`);
  }

  printPreemptible();
  // [END compute_preemptible_check]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
