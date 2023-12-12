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
  projectNumber = 'YOUR_PROJECT_NUMBER',
  location = 'YOUR_PROJECT_LOCATION',
  userId = 'user:xxx@example.com',
  documentQueryText = 'YOUR_DOCUMENT_QUERY'
) {
  // [START contentwarehouse_search_documents]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * const projectNumber = 'YOUR_PROJECT_NUMBER';
   * const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
   * const userId = 'user:xxx@example.com'; // Format is "user:xxx@example.com"
   * const documentQueryText = 'YOUR_DOCUMENT_QUERY'
   */

  // Import from google cloud
  const {DocumentServiceClient} = require('@google-cloud/contentwarehouse').v1;

  const apiEndpoint =
    location === 'us'
      ? 'contentwarehouse.googleapis.com'
      : `${location}-contentwarehouse.googleapis.com`;

  // Create service client
  const serviceClient = new DocumentServiceClient({apiEndpoint: apiEndpoint});

  // Get Document Schema
  async function searchDocuments() {
    // Initialize request argument(s)
    const searchRequest = {
      // The full resource name of the location, e.g.:
      // projects/{project_number}/locations/{location}
      parent: `projects/${projectNumber}/locations/${location}`,

      // Document Text Query
      documentQuery: {
        query: documentQueryText,
        // File Type Filter
        fileTypeFilter: {
          fileType: 'DOCUMENT',
        },
      },

      // Histogram Query
      histogramQueries: [
        {
          histogramQuery: 'count("DocumentSchemaId")',
        },
      ],
      requestMetadata: {userInfo: {id: userId}},
    };

    // Make Request
    const response = serviceClient.searchDocuments(searchRequest);

    // Print out response
    response.then(
      result => console.log(`Document Found: ${JSON.stringify(result)}`),
      error => console.log(`${error}`)
    );
  }

  // [END contentwarehouse_search_documents]
  await searchDocuments();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
