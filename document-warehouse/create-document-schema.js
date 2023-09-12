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

  // Create service client
  const serviceClient = new DocumentSchemaServiceClient();

  // Create Document Schema
  async function createDocumentSchema() {
    // Initialize request argument(s)
    const request = {};

    // Property Definition
    const propertyDefinition = {};
    propertyDefinition.name = 'schema property 1'; // Must be unique within a document schema (case insensitive)
    propertyDefinition.displayName = 'searchable text';
    propertyDefinition.isSearchable = true;
    propertyDefinition.textTypeOptions = {};

    // Document Schema
    const documentSchema = {};
    documentSchema.displayName = 'My Test Schema';
    documentSchema.propertyDefinitions = [];

    request.documentSchema = documentSchema;

    // The full resource name of the location, e.g.:
    // projects/{project_number}/locations/{location}
    request.parent = `projects/${projectNumber}/locations/${location}`;

    // Make Request
    const response = serviceClient.createDocumentSchema(request);

    // Print out response
    response.then(
      result => console.log(`${JSON.stringify(result)}`),
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
