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
  userId = 'user:xxx@example.com'
) {
  // [START contentwarehouse_quickstart]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * const projectNumber = 'YOUR_PROJECT_NUMBER';
   * const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
   * const userId = 'user:xxx@example.com'; // Format is "user:xxx@example.com"
   */

  // Import from google cloud
  const {DocumentSchemaServiceClient, DocumentServiceClient} =
    require('@google-cloud/contentwarehouse').v1;

  const apiEndpoint =
    location === 'us'
      ? 'contentwarehouse.googleapis.com'
      : `${location}-contentwarehouse.googleapis.com`;

  // Create service client
  const schemaClient = new DocumentSchemaServiceClient({
    apiEndpoint: apiEndpoint,
  });
  const serviceClient = new DocumentServiceClient({apiEndpoint: apiEndpoint});

  // Get Document Schema
  async function quickstart() {
    // The full resource name of the location, e.g.:
    // projects/{project_number}/locations/{location}
    const parent = `projects/${projectNumber}/locations/${location}`;

    // Initialize request argument(s)
    const schemaRequest = {
      parent: parent,
      documentSchema: {
        displayName: 'My Test Schema',
        propertyDefinitions: [
          {
            name: 'testPropertyDefinitionName', // Must be unique within a document schema (case insensitive)
            displayName: 'searchable text',
            isSearchable: true,
            textTypeOptions: {},
          },
        ],
      },
    };

    // Create Document Schema
    const documentSchema =
      await schemaClient.createDocumentSchema(schemaRequest);

    const documentRequest = {
      parent: parent,
      document: {
        displayName: 'My Test Document',
        documentSchemaName: documentSchema[0].name,
        plainText: "This is a sample of a document's text.",
        properties: [
          {
            name: 'testPropertyDefinitionName',
            textValues: {values: ['GOOG']},
          },
        ],
      },
      requestMetadata: {userInfo: {id: userId}},
    };

    // Make Request
    const response = serviceClient.createDocument(documentRequest);

    // Print out response
    response.then(
      result => console.log(`Document Created: ${JSON.stringify(result)}`),
      error => console.log(`error: ${error}`)
    );
  }

  // [END contentwarehouse_quickstart]
  await quickstart();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
