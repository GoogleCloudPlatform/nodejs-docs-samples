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
 * Creates a Compute Engine VM instance from an instance template, but overrides the disk and machine type options in the template.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 * @param {string} instanceName - Name of the new instance.
 * @param {string} instanceTemplateName - Name of the instance template to use when creating the new instance.
 * @param {string} machineType - Machine type you want to set in following format:
 *    "zones/{zone}/machineTypes/{type_name}". For example:
 *    "zones/europe-west3-c/machineTypes/f1-micro"
 *    You can find the list of available machine types using:
 *    https://cloud.google.com/sdk/gcloud/reference/compute/machine-types/list
 * @param {string} newDiskSourceImage - Path the the disk image you want to use for your new
 *    disk. This can be one of the public images
 *    (like "projects/debian-cloud/global/images/family/debian-11")
 *    or a private image you have access to.
 *    For a list of available public images, see the documentation:
 *    http://cloud.google.com/compute/docs/images
 */
function main(
  projectId,
  zone,
  instanceName,
  instanceTemplateName,
  machineType = 'n1-standard-2',
  newDiskSourceImage = 'projects/debian-cloud/global/images/family/debian-11'
) {
  // [START compute_instances_create_from_template_with_overrides]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const instanceTemplateName = 'YOUR_INSTANCE_TEMPLATE_NAME';
  // const machineType = 'n1-standard-1';
  // const newDiskSourceImage = 'projects/debian-cloud/global/images/family/debian-11';

  const compute = require('@google-cloud/compute');

  // Creates a new instance in the specified project and zone using a selected template,
  // but overrides the disk and machine type options in the template.
  async function createInstanceFromTemplateWithOverrides() {
    const instancesClient = new compute.InstancesClient();
    const instanceTemplatesClient = new compute.InstanceTemplatesClient();

    console.log(
      `Creating the ${instanceName} instance in ${zone} from template ${instanceTemplateName}...`
    );

    // Retrieve an instance template by name.
    const [instanceTemplate] = await instanceTemplatesClient.get({
      project: projectId,
      instanceTemplate: instanceTemplateName,
    });

    // Adjust diskType field of the instance template to use the URL formatting required by instances.insert.diskType
    // For instance template, there is only a name, not URL.
    for (const disk of instanceTemplate.properties.disks) {
      if (disk.initializeParams.diskType) {
        disk.initializeParams.diskType = `zones/${zone}/diskTypes/${disk.initializeParams.diskType}`;
      }
    }

    const [response] = await instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: {
        name: instanceName,
        machineType: `zones/${zone}/machineTypes/${machineType}`,
        disks: [
          // If you override a repeated field, all repeated values
          // for that property are replaced with the
          // corresponding values provided in the request.
          // When adding a new disk to existing disks,
          // insert all existing disks as well.
          ...instanceTemplate.properties.disks,
          {
            initializeParams: {
              diskSizeGb: '10',
              sourceImage: newDiskSourceImage,
            },
            autoDelete: true,
            boot: false,
            type: 'PERSISTENT',
          },
        ],
      },
      sourceInstanceTemplate: instanceTemplate.selfLink,
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

  createInstanceFromTemplateWithOverrides();
  // [END compute_instances_create_from_template_with_overrides]
}

main(...process.argv.slice(2));
