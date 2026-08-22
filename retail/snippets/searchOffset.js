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

// [START retail_v2_search_offset]
const {SearchServiceClient} = require('@google-cloud/retail');

const client = new SearchServiceClient();

/**
 * Search for products with an offset using Vertex AI Search for commerce.
 * Performs a search request starting from a specified position.
 *
 * @param {string} projectId The Google Cloud project ID.
 * @param {string} placementId The placement name for the search.
 * @param {string} visitorId A unique identifier for the user.
 * @param {string} query The search term.
 * @param {number} offset The number of results to skip.
 */
async function searchOffset(projectId, placementId, visitorId, query, offset) {
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
    pageSize: 10,
    offset: offset,
  };

  try {
    // Set {autoPaginate: false} to manually control the pagination
    const [results] = await client.search(request, {autoPaginate: false});
    console.log(`--- Results for offset: ${offset} ---`);
    for (const result of results) {
      console.log(`Product ID: ${result.id}`);
      console.log(`Title: ${result.product.title}`);
      console.log(`Scores: ${JSON.stringify(result.modelScores || {})}`);
    }
  } catch (error) {
    console.error('Error searching using offset:', error.message || error);
  }
}

// [END retail_v2_search_offset]
module.exports = {searchOffset};
