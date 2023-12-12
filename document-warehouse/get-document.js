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
  documentId = 'YOUR_DOCUMENT_ID',
  userId = 'user:xxx@example.com'
) {
  // [START contentwarehouse_get_document]

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * const projectNumber = 'YOUR_PROJECT_NUMBER';
   * const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
   * documentId = 'YOUR_DOCUMENT_ID';
   * const userId = 'user:xxx@example.com'; // Format is "user:xxx@example.com"
   */

  // Import from google cloud
  const {DocumentServiceClient} = require('@google-cloud/contentwarehouse').v1;

  const apiEndpoint =
    location === 'us'
      ? 'contentwarehouse.googleapis.com'
      : `${location}-contentwarehouse.googleapis.com`;

  // Create service client
  const serviceClient = new DocumentServiceClient({
    apiEndpoint: apiEndpoint,
  });

  // Get Document Schema
  async function getDocument() {
    // Initialize request argument(s)
    const documentRequest = {
      // The full resource name of the document, e.g.:
      // projects/{project_number}/locations/{location}/documents/{document_id}
      name: serviceClient.projectLocationDocumentPath(
        projectNumber,
        location,
        documentId
      ),
      requestMetadata: {userInfo: {id: userId}},
    };

    // Make Request
    const response = serviceClient.getDocument(documentRequest);

    // Print out response
    response.then(
      result => console.log(`Document Found: ${JSON.stringify(result)}`),
      error => console.log(`${error}`)
    );
  }

  // [END contentwarehouse_get_document]
  await getDocument();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
