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
  // [START compute_regional_template_get]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');

  // Instantiate a regionInstanceTemplatesClient
  const regionInstanceTemplatesClient =
    new computeLib.RegionInstanceTemplatesClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project that you want to use.
  const projectId = await regionInstanceTemplatesClient.getProjectId();
  // The region where template is created.
  const region = 'us-central1';
  // The name of the template to return.
  // const templateName = 'regional-template-name';

  async function getRegionalTemplate() {
    const template = (
      await regionInstanceTemplatesClient.get({
        project: projectId,
        region,
        instanceTemplate: templateName,
      })
    )[0];

    console.log(JSON.stringify(template));
  }

  getRegionalTemplate();
  // [END compute_regional_template_get]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
