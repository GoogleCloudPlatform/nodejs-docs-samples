/** Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(
  projectId = 'YOUR_PROJECT_ID',
  location =  'YOUR_PROJECT_LOCATION',
  query = 'YOUR_DOCUMENT_QUERY',
) {
  // [START contentwarehouse_search_documents]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * projectId = 'YOUR_PROJECT_ID'
   * location =  'YOUR_PROJECT_LOCATION' // Format is 'us' or 'eu'
   * query = 'YOUR_DOCUMENT_QUERY'
   */

  // Import service client from google cloud
  const {DocumentServiceClient} = require('@google-cloud/contentwarehouse').v1;

  // Create client
  const serviceClient = new DocumentServiceClient();

  // Search document
  async function searchDocument() {
    // Initialize request arguments
    const request = {};
    // Full document resource name, e.g.: projects/{project_id}/locations/{location}
    request.parent = `projects/${projectId}/locations/${location}`;
    // File Type Filter
    // Options: DOCUMENT, FOLDER
    const fileTypeFilter = {
      fileType: DOCUMENT
    };
    // Search Prompt
    const documentQuery = {
      query: query,
      fileTypeFilter : fileTypeFilter
    };
    request.documentQuery = documentQuery;
    request.histogramQueries = [{histogramQuery:'count("DocumentSchemaId")'}];

    // Make Request
    const response = serviceClient.searchDocuments(request);

    // Print Search Results
    for (matchingDocument in response.matchingDocuments) {
      const document = matchingDocument.document;
      console.log(`
        ${document.displayName} - ${document.documentSchemaName}\n
        ${document.name}\n
        ${document.createTime}\n
        ${matchingDocument.searchTextSnippet}\n
      `);
    }
    
    // Print Histogram
    for (result in response.histogramQueryResults){
      console.log(`
        History Query: ${result.historyQuery}\n

        //TODO
      `)
    }

  }

  // [END contentwarehouse_search_documents]
  await searchDocument();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});