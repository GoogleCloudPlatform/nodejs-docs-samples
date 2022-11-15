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
 * Prints a list of instance template objects available in a project.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you use.
 */
function main(projectId) {
  // [START compute_template_list]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';

  const compute = require('@google-cloud/compute');

  // Print a list of instance template objects available in a project.
  async function listInstanceTemplates() {
    const instanceTemplatesClient = new compute.InstanceTemplatesClient();

    const instanceTemplates = instanceTemplatesClient.listAsync({
      project: projectId,
    });

    for await (const instanceTemplate of instanceTemplates) {
      console.log(` - ${instanceTemplate.name}`);
    }
  }

  listInstanceTemplates();
  // [END compute_template_list]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
