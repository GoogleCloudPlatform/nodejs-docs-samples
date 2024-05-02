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

async function main(
  projectId,
  location,
  collectionId,
  dataStoreId,
  servingConfigId,
  searchQuery
) {
  // [START genappbuilder_search]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_LOCATION';              // Options: 'global', 'us', 'eu'
  // const collectionId = 'default_collection';     // Options: 'default_collection'
  // const dataStoreId = 'YOUR_DATA_STORE_ID'       // Create in Cloud Console
  // const servingConfigId = 'default_config';      // Options: 'default_config'
  // const searchQuery = 'Google';

  const {SearchServiceClient} = require('@google-cloud/discoveryengine').v1beta;

  // For more information, refer to:
  // https://cloud.google.com/generative-ai-app-builder/docs/locations#specify_a_multi-region_for_your_data_store
  const apiEndpoint =
    location === 'global'
      ? 'discoveryengine.googleapis.com'
      : `${location}-discoveryengine.googleapis.com`;

  // Instantiates a client
  const client = new SearchServiceClient({apiEndpoint: apiEndpoint});

  async function search() {
    // The full resource name of the search engine serving configuration.
    // Example: projects/{projectId}/locations/{location}/collections/{collectionId}/dataStores/{dataStoreId}/servingConfigs/{servingConfigId}
    // You must create a search engine in the Cloud Console first.
    const name = client.projectLocationCollectionDataStoreServingConfigPath(
      projectId,
      location,
      collectionId,
      dataStoreId,
      servingConfigId
    );

    const request = {
      pageSize: 10,
      query: searchQuery,
      servingConfig: name,
    };

    const IResponseParams = {
      ISearchResult: 0,
      ISearchRequest: 1,
      ISearchResponse: 2,
    };

    // Perform search request
    const response = await client.search(request, {
      // Warning: Should always disable autoPaginate to avoid iterate through all pages.
      //
      // By default NodeJS SDK returns an iterable where you can iterate through all
      // search results instead of only the limited number of results requested on
      // pageSize, by sending multiple sequential search requests page-by-page while
      // iterating, until it exhausts all the search results. This will be unexpected and
      // may cause high Search API usage and long wait time, especially when the matched
      // document numbers are huge.
      autoPaginate: false,
    });
    const results = response[IResponseParams.ISearchResponse].results;

    for (const result of results) {
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
