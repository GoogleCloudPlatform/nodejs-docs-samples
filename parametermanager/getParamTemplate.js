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
 * Gets the details of a template using the Google Cloud Parameter Manager SDK.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} templateId - The ID of the template to be retrieved.
 */
async function main(projectId, templateId) {
  // [START parametermanager_get_param_template]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const templateId = 'my-template';

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function getParamTemplate() {
    // Build the resource name of the template.
    const name = client.templatePath(projectId, 'global', templateId);

    // Get the template.
    const [template] = await client.getTemplate({name: name});

    // Print the template details.
    console.log(`Got template ${template.name} with format ${template.format}`);
    return template;
  }

  return await getParamTemplate();
  // [END parametermanager_get_param_template]
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
