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
 * Deletes an instance template.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you use.
 * @param {string} templateName - Name of the template to delete.
 */
function main(projectId, templateName) {
  // [START compute_template_delete]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const templateName = 'your_template_name';

  const compute = require('@google-cloud/compute');

  // Delete an instance template.
  async function deleteInstanceTemplate() {
    const instanceTemplatesClient = new compute.InstanceTemplatesClient();

    const [response] = await instanceTemplatesClient.delete({
      project: projectId,
      instanceTemplate: templateName,
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

    console.log('Instance template deleted.');
  }

  deleteInstanceTemplate();
  // [END compute_template_delete]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
