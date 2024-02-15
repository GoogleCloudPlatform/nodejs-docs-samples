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
  location = 'YOUR_PROJECT_LOCATION'
) {
  // [START contentwarehouse_create_document_schema]

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * const projectNumber = 'YOUR_PROJECT_NUMBER';
   * const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
   */

  // Import from google cloud
  const {DocumentSchemaServiceClient} =
    require('@google-cloud/contentwarehouse').v1;

  const apiEndpoint =
    location === 'us'
      ? 'contentwarehouse.googleapis.com'
      : `${location}-contentwarehouse.googleapis.com`;

  // Create service client
  const serviceClient = new DocumentSchemaServiceClient({
    apiEndpoint: apiEndpoint,
  });

  // Create Document Schema
  async function createDocumentSchema() {
    // The full resource name of the location, e.g.:
    // projects/{project_number}/locations/{location}
    const parent = `projects/${projectNumber}/locations/${location}`;
    // Initialize request argument(s)
    const request = {
      parent: parent,
      // Document Schema
      documentSchema: {
        displayName: 'My Test Schema',
        // Property Definition
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

    // Make Request
    const response = serviceClient.createDocumentSchema(request);

    // Print out response
    response.then(
      result =>
        console.log(`Document Schema Created: ${JSON.stringify(result)}`),
      error => console.log(`${error}`)
    );
  }

  // [END contentwarehouse_create_document_schema]
  await createDocumentSchema();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
