// Copyright 2019 Google LLC
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

async function main(projectId, locationId) {
  // [START modelarmor_list_templates]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const locationId = 'us-central1';

  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the Model Armor library
  const {ModelArmorClient} = require('@google-cloud/modelarmor');

  // Adding the endpoint to call the regional model armor server
  const options = {};
  options.apiEndpoint = `modelarmor.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new ModelArmorClient(options);

  async function listTemplates() {
    const request = {
      parent: parent,
    };

    // Run request
    const iterable = client.listTemplatesAsync(request);
    for await (const template of iterable) {
      console.log(template.name);
    }
  }

  listTemplates();
  // [END modelarmor_list_templates]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);