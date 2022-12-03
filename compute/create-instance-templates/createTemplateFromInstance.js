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
 * Creates a new instance template based on an existing instance.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you use.
 * @param {string} instance - The instance to base the new template on. This value uses
 *    the following format: "projects/{project}/zones/{zone}/instances/{instance_name}"
 * @param {string} templateName - Name of the new template to create.
 */
function main(projectId, instance, templateName) {
  // [START compute_template_create_from_instance]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const instance = 'projects/project/zones/zone/instances/instance';
  // const templateName = 'your_template_name';

  const compute = require('@google-cloud/compute');

  // Create a new instance template based on an existing instance.
  // This new template specifies a different boot disk.
  async function createTemplateFromInstance() {
    const instanceTemplatesClient = new compute.InstanceTemplatesClient();

    const [response] = await instanceTemplatesClient.insert({
      project: projectId,
      instanceTemplateResource: {
        name: templateName,
        sourceInstance: instance,
        sourceInstanceParams: {
          diskConfigs: [
            {
              // Device name must match the name of a disk attached to the instance
              // your template is based on.
              deviceName: 'disk-1',
              // Replace the original boot disk image used in your instance with a Rocky Linux image.
              instantiateFrom: 'CUSTOM_IMAGE',
              customImage:
                'projects/rocky-linux-cloud/global/images/family/rocky-linux-8',
              // Override the auto_delete setting.
              autoDelete: true,
            },
          ],
        },
      },
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.GlobalOperationsClient();

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }

    console.log('Instance template created.');
  }

  createTemplateFromInstance();
  // [END compute_template_create_from_instance]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
