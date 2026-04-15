// Copyright 2026 Google LLC
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

'use strict';

// [START retail_v2_search_pagination]
const {SearchServiceClient} = require('@google-cloud/retail');

const client = new SearchServiceClient();

/**
 * Search for products with pagination using Vertex AI Search for commerce.
 * Performs a search request, then uses the next_page_token to get the next page.
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} placementId - The placement name for the search.
 * @param {string} visitorId - A unique identifier for the user.
 * @param {string} query - The search term.
 */
async function searchPagination(projectId, placementId, visitorId, query) {
  const placementPath = client.servingConfigPath(
    projectId,
    'global',
    'default_catalog',
    placementId
  );

  const branchPath = client.branchPath(
    projectId,
    'global',
    'default_catalog',
    'default_branch'
  );

  // First page request
  const firstRequest = {
    placement: placementPath,
    branch: branchPath,
    visitorId: visitorId,
    query: query,
    pageSize: 5,
  };

  try {
    // Set {autoPaginate: false} to manually control the pagination
    // and extract the raw response which contains the next_page_token.
    const [firstPageResults, , firstRawResponse] = await client.search(
      firstRequest,
      {autoPaginate: false}
    );

    console.log('--- First Page ---');
    for (const result of firstPageResults) {
      console.log(`Product ID: ${result.id}`);
    }

    const nextPageToken = firstRawResponse.nextPageToken;

    if (nextPageToken) {
      // Second page request using pageToken
      const secondRequest = {
        placement: placementPath,
        branch: branchPath,
        visitorId: visitorId,
        query: query,
        pageSize: 5,
        pageToken: nextPageToken,
      };

      const [secondPageResults] = await client.search(secondRequest, {
        autoPaginate: false,
      });

      console.log('--- Second Page ---');
      for (const result of secondPageResults) {
        console.log(`Product ID: ${result.id}`);
      }
    } else {
      console.log('No more pages.');
    }
  } catch (error) {
    console.error(
      'Failed to complete paginated search:',
      error.message || error
    );
  }
}
// [END retail_v2_search_pagination]

module.exports = {searchPagination};
