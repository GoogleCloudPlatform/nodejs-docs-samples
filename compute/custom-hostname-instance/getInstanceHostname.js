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
 * Prints the hostname of the Google Cloud VM instance.
 *
 * @param {string} projectId - ID of the project in which you want to get the VM instance hostname.
 * @param {string} zone - Name of the zone your instance belongs to, for example: us-west3-b.
 * @param {string} instanceName - Name of the new VM instance.
 */
function main(projectId, zone, instanceName) {
  // [START compute_instances_get_hostname]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b'
  // const instanceName = 'YOUR_INSTANCE_NAME'

  const compute = require('@google-cloud/compute');

  async function getInstanceHostname() {
    const instancesClient = new compute.InstancesClient();

    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: instanceName,
    });
    // If a custom hostname is not set, the output for instance.hostname will be undefined
    console.log(`Instance ${instanceName} has hostname: ${instance.hostname}`);
  }

  getInstanceHostname();
  // [END compute_instances_get_hostname]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
