/**
 * Copyright 2023 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(projectId, location, searchEngineId, servingConfigId, searchQuery) {
  // [START genappbuilder_search]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_LOCATION';              // Options: 'global'
  // const searchEngineId = 'YOUR_SEARCH_ENGINE_ID' // Create in Cloud Console
  // const servingConfigId = 'default_config';      // Options: 'default_config'
  // const searchQuery = 'Google';

  const { SearchServiceClient } =
    require('@google-cloud/discoveryengine').v1beta;

  // Instantiates a client
  const client = new SearchServiceClient();

  async function search() {
    // The full resource name of the search engine serving configuration.
    // Example: projects/{projectId}/locations/{location}/dataStores/{searchEngineId}/servingConfigs/{servingConfigId}
    // You must create a search engine in the Cloud Console first.
    const name = client.projectLocationDataStoreServingConfigPath(projectId, location, searchEngineId, servingConfigId);

    const request = {
      name,
      query: searchQuery
    };

    // Perform search request
    const response = await client.search(request);

    for (const result of response) {
      console.log(result);
    }
  }
  // [END genappbuilder_search]
  await search();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
