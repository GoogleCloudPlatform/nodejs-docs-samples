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

async function main(projectId, locationId, templateId) {
  // [START modelarmor_list_templates_with_filter]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const locationId = 'your-location-id';
  // const templateId = 'your-template-id';

  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the Model Armor library
  const {ModelArmorClient} = require('@google-cloud/modelarmor').v1;

  // Adding the endpoint to call the regional model armor server
  const options = {};
  options.apiEndpoint = `modelarmor.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new ModelArmorClient(options);

  async function listModelArmorTemplatesWithFilter() {
    const request = {
      parent: parent,
      // Construct your filter string as needed
      filter: `name="${parent}/templates/${templateId}"`,
    };
  
    // Use listTemplatesAsync to handle pagination automatically
    const iterable = await client.listTemplatesAsync(request);

    for await (const template of iterable) {
      console.log(
        `Found template ${template.name}`
      );
    }
  }

  listModelArmorTemplatesWithFilter();
  // [END modelarmor_list_templates_with_filter]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);

// node listTemplatesWithFilter.js ma-crest-data-test-2 us-east4 basic-sdp-template
