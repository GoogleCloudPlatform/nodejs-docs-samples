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

// [START retail_v2_search_request]
const {SearchServiceClient} = require('@google-cloud/retail');

const client = new SearchServiceClient();

/**
 * Search for products using Vertex AI Search for commerce.
 *
 * Performs a search request for a specific placement.
 * Handles both text search (using query) and browse search (using pageCategories).
 *
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} placementId - The placement name for the search.
 * @param {string} visitorId - A unique identifier for the user.
 * @param {string} query - The search term for text search.
 * @param {string[]} pageCategories - The categories for browse search.
 */
async function searchRequest(
  projectId,
  placementId,
  visitorId,
  query = '',
  pageCategories = []
) {
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

  const request = {
    placement: placementPath,
    branch: branchPath,
    visitorId: visitorId,
    query: query,
    pageCategories: pageCategories,
    pageSize: 10,
  };

  try {
    // Set {autoPaginate: false} to manually control the pagination
    const [results] = await client.search(request, {autoPaginate: false});
    console.log('--- Search Results ---');
    for (const result of results) {
      console.log(`Product ID: ${result.id}`);
      console.log(`  Name: ${result.product.name}`);
      console.log(`  Scores: ${JSON.stringify(result.modelScores || {})}`);
    }
  } catch (error) {
    console.error(`Operation failed: ${error.message}`);
  }
}

// [END retail_v2_search_request]

module.exports = {searchRequest};
