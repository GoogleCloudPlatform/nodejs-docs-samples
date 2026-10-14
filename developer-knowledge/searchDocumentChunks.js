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

// [START developerknowledge_search_document_chunks]
const {DeveloperKnowledgeClient} = require('@google/developer-knowledge');

/**
 * Searches developer documentation chunks for a given query.
 *
 * @param {string} query The search query string.
 * @param {number} pageSize The maximum number of document chunks to return.
 */
async function searchDocumentChunks(
  query = 'How to create a Cloud Storage bucket',
  pageSize = 5
) {
  const client = new DeveloperKnowledgeClient();

  const request = {
    query,
    pageSize,
  };

  // Warning: Should always disable autoPaginate to avoid iterating through all pages.
  // By default NodeJS SDK returns an iterable where you can iterate through all
  // search results instead of only the limited number of results requested on pageSize.
  const [chunks] = await client.searchDocumentChunks(request, {
    autoPaginate: false,
  });

  for (const chunk of chunks) {
    console.log(`Parent Document: ${chunk.parent}`);
    console.log(`Chunk ID: ${chunk.id}`);
    console.log(`Content Preview: ${chunk.content.substring(0, 100)}...\n`);
  }

  return chunks;
}
// [END developerknowledge_search_document_chunks]

module.exports = {searchDocumentChunks};

if (require.main === module) {
  searchDocumentChunks(...process.argv.slice(2)).catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}
