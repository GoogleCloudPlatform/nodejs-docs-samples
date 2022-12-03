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
 * Retrieves an instance template, which you can use to create virtual machine
 *    (VM) instances and managed instance groups (MIGs).
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you use.
 * @param {string} templateName - Name of the template to retrieve.
 */
function main(projectId, templateName) {
  // [START compute_template_get]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const templateName = 'your_template_name';

  const compute = require('@google-cloud/compute');

  // Retrieve an instance template, which you can use to create
  // virtual machine (VM) instances and managed instance groups (MIGs).
  async function getInstanceTemplate() {
    const instanceTemplatesClient = new compute.InstanceTemplatesClient();

    const [instance] = await instanceTemplatesClient.get({
      project: projectId,
      instanceTemplate: templateName,
    });

    console.log('Instance template:', instance);
  }

  getInstanceTemplate();
  // [END compute_template_get]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
