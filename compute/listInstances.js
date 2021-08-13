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
 * Gets a list of instances created in given project in given zone.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 */
function main(projectId, zone) {
  // [START compute_instances_list]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b'

  const compute = require('@google-cloud/compute');

  // List all instances in the given zone in the specified project.
  async function listInstances() {
    const instancesClient = new compute.InstancesClient();

    const [instanceList] = await instancesClient.list({
      project: projectId,
      zone,
    });

    console.log(`Instances found in zone ${zone}:`);

    for (const instance of instanceList) {
      console.log(` - ${instance.name} (${instance.machineType})`);
    }
  }

  listInstances();
  // [END compute_instances_list]
}

main(...process.argv.slice(2));
