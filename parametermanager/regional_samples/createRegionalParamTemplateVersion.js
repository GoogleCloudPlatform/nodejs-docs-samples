// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * Creates a new regional template version with placeholders in its payload.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} locationId - The ID of the region where the resources are located.
 * @param {string} templateId - The ID of the template for which the version is to be created.
 * @param {string} versionId - The ID of the template version to be created.
 */
async function main(projectId, locationId, templateId, versionId) {
  // [START parametermanager_create_regional_param_template_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const templateId = 'my-template';
  // const versionId = 'v1';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function createRegionalParamTemplateVersion() {
    // Build the resource name of the template.
    const parent = client.templatePath(projectId, locationId, templateId);

    // Define the template payload.
    const payloadData = {username: '{{.username}}', host: '{{.host}}'};

    // Build the request.
    const request = {
      parent: parent,
      templateVersionId: versionId,
      templateVersion: {
        payload: {
          data: Buffer.from(JSON.stringify(payloadData), 'utf8'),
        },
      },
    };

    // Create the template version.
    const [templateVersion] = await client.createTemplateVersion(request);

    // Print the newly created template version name.
    console.log(`Created regional template version: ${templateVersion.name}`);
    return templateVersion;
  }

  return await createRegionalParamTemplateVersion();
  // [END parametermanager_create_regional_param_template_version]
}
module.exports.main = main;

/* c8 ignore next 10 */
if (require.main === module) {
  main(...process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
