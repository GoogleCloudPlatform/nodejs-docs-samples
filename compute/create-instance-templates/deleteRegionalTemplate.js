/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(templateName) {
  // [START compute_regional_template_delete]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');

  // Instantiate a regionInstanceTemplatesClient
  const regionInstanceTemplatesClient =
    new computeLib.RegionInstanceTemplatesClient();
  // Instantiate a regionOperationsClient
  const regionOperationsClient = new computeLib.RegionOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project that you want to use.
  const projectId = await regionInstanceTemplatesClient.getProjectId();
  // The region where template is created.
  const region = 'us-central1';
  // The name of the template to delete.
  // const templateName = 'regional-template-name';

  async function deleteRegionalTemplate() {
    const [response] = await regionInstanceTemplatesClient.delete({
      project: projectId,
      instanceTemplate: templateName,
      region,
    });

    let operation = response.latestResponse;

    // Wait for the delete operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await regionOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        region,
      });
    }

    console.log(`Template: ${templateName} deleted.`);
  }

  deleteRegionalTemplate();
  // [END compute_regional_template_delete]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
