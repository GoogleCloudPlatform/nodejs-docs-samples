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
 * Renders a regional template version, resolving its placeholders with the values of a parameter version, using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} locationId - The ID of the region where the resources are located.
 * @param {string} templateId - The ID of the template to be rendered.
 * @param {string} versionId - The ID of the template version to be rendered.
 * @param {string} parameterId - The ID of the parameter whose version supplies the values.
 * @param {string} parameterVersionId - The ID of the parameter version that supplies the values.
 */
async function main(
  projectId,
  locationId,
  templateId,
  versionId,
  parameterId,
  parameterVersionId
) {
  // [START parametermanager_render_regional_param_template_version]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const templateId = 'my-template';
  // const versionId = 'v1';
  // const parameterId = 'my-parameter';
  // const parameterVersionId = 'v1';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function renderRegionalParamTemplateVersion() {
    // Build the resource name of the template version.
    const name = client.templateVersionPath(
      projectId,
      locationId,
      templateId,
      versionId
    );

    // Build the resource name of the parameter version that supplies the values.
    const parameterVersion = client.parameterVersionPath(
      projectId,
      locationId,
      parameterId,
      parameterVersionId
    );

    // Build the request.
    const request = {
      name: name,
      parameterVersion: parameterVersion,
    };

    // Render the template version.
    const [response] = await client.renderTemplateVersion(request);

    // Print the template payload and the rendered payload.
    console.log(`Template payload: ${response.payload.data.toString('utf-8')}`);
    console.log(
      `Rendered payload: ${response.renderedPayload.toString('utf-8')}`
    );
    return response;
  }

  return await renderRegionalParamTemplateVersion();
  // [END parametermanager_render_regional_param_template_version]
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
