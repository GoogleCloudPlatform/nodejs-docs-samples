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
 * Creates a regional template, a parameter version and renders the template version.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} locationId - The ID of the region where the resources are located.
 * @param {string} templateId - The ID to assign to the new template.
 * @param {string} parameterId - The ID to assign to the new parameter.
 * @param {string} versionId - The ID used for both the template version and the parameter version.
 */
async function main(projectId, locationId, templateId, parameterId, versionId) {
  // [START parametermanager_regional_template_quickstart]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const templateId = 'my-template';
  // const parameterId = 'my-parameter';
  // const versionId = 'v1';

  // Imports the Parameter Manager library
  const {
    ParameterManagerClient,
    protos,
  } = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function regionalTemplateQuickstart() {
    // Build the resource name of the parent location.
    const parent = client.locationPath(projectId, locationId);

    // Create a template in JSON format.
    const [template] = await client.createTemplate({
      parent: parent,
      templateId: templateId,
      template: {
        format:
          protos.google.cloud.parametermanager.v1.TemplateFormat
            .TEMPLATE_FORMAT_JSON,
      },
    });
    console.log(`Created regional template: ${template.name}`);

    // Create a template version with {{.variableName}} placeholders.
    const templatePayload = {username: '{{.username}}', host: '{{.host}}'};
    const [templateVersion] = await client.createTemplateVersion({
      parent: template.name,
      templateVersionId: versionId,
      templateVersion: {
        payload: {
          data: Buffer.from(JSON.stringify(templatePayload), 'utf8'),
        },
      },
    });
    console.log(`Created regional template version: ${templateVersion.name}`);

    // Create a JSON parameter.
    const [parameter] = await client.createParameter({
      parent: parent,
      parameterId: parameterId,
      parameter: {
        format: protos.google.cloud.parametermanager.v1.ParameterFormat.JSON,
      },
    });
    console.log(`Created regional parameter: ${parameter.name}`);

    // Create a parameter version that holds the values for the placeholders.
    const values = {username: 'test-user', host: 'localhost'};
    const [parameterVersion] = await client.createParameterVersion({
      parent: parameter.name,
      parameterVersionId: versionId,
      parameterVersion: {
        payload: {
          data: Buffer.from(JSON.stringify(values), 'utf8'),
        },
      },
    });
    console.log(`Created regional parameter version: ${parameterVersion.name}`);

    // Render the template version with the parameter version's values.
    const [response] = await client.renderTemplateVersion({
      name: templateVersion.name,
      parameterVersion: parameterVersion.name,
    });
    console.log(
      `Rendered regional payload: ${response.renderedPayload.toString('utf-8')}`
    );
    return response;
  }

  return await regionalTemplateQuickstart();
  // [END parametermanager_regional_template_quickstart]
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
