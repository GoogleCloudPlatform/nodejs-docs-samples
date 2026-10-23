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
 * Lists all versions of a regional template using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} locationId - The ID of the region where the resources are located.
 * @param {string} templateId - The ID of the template for which versions are to be listed.
 */
async function main(projectId, locationId, templateId) {
  // [START parametermanager_list_regional_param_template_versions]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const templateId = 'my-template';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function listRegionalParamTemplateVersions() {
    // Build the resource name of the template.
    const parent = client.templatePath(projectId, locationId, templateId);

    // List the versions of the template.
    const versions = [];
    for await (const version of client.listTemplateVersionsAsync({
      parent: parent,
    })) {
      console.log(`Found regional template version: ${version.name}`);
      versions.push(version);
    }
    return versions;
  }

  return await listRegionalParamTemplateVersions();
  // [END parametermanager_list_regional_param_template_versions]
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
