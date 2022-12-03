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
 * Creates a Compute Engine VM instance from an instance template.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 * @param {string} instanceName - Name of the new instance.
 * @param {string} instanceTemplateUrl - URL of the instance template using for creating the new instance. It can be a full or partial URL.
 *    Examples:
 *    - https://www.googleapis.com/compute/v1/projects/project/global/instanceTemplates/example-instance-template
 *    - projects/project/global/instanceTemplates/example-instance-template
 *    - global/instanceTemplates/example-instance-template
 */
function main(projectId, zone, instanceName, instanceTemplateUrl) {
  // [START compute_instances_create_from_template]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b'
  // const instanceName = 'YOUR_INSTANCE_NAME'
  // const instanceTemplateUrl = 'YOUR_INSTANCE_TEMPLATE_URL'

  const compute = require('@google-cloud/compute');

  // Create a new instance from template in the specified project and zone.
  async function createInstanceFromTemplate() {
    const instancesClient = new compute.InstancesClient();

    console.log(
      `Creating the ${instanceName} instance in ${zone} from template ${instanceTemplateUrl}...`
    );

    const [response] = await instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: {
        name: instanceName,
      },
      sourceInstanceTemplate: instanceTemplateUrl,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Instance created.');
  }

  createInstanceFromTemplate();
  // [END compute_instances_create_from_template]
}

main(...process.argv.slice(2));
