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

  // Create service client
  const schemaClient = new DocumentSchemaServiceClient();
  const serviceClient = new DocumentServiceClient();

  // Get Document Schema
  async function quickstart() {
    // Initialize request argument(s)
    const schemaRequest = {};
    const documentRequest = {};

    // The full resource name of the location, e.g.:
    // projects/{project_number}/locations/{location}
    const parent = `projects/${projectNumber}/locations/${location}`;
    schemaRequest.parent = parent;
    documentRequest.parent = parent;

    // Property Definition
    const propertyDefinition = {};
    propertyDefinition.name = 'testPropertyDefinitionName'; // Must be unique within a document schema (case insensitive)
    propertyDefinition.displayName = 'searchable text';
    propertyDefinition.isSearchable = true;
    propertyDefinition.textTypeOptions = {};

    // Document Schema
    const documentSchemaRequest = {};
    documentSchemaRequest.displayName = 'My Test Schema';
    documentSchemaRequest.propertyDefinitions = [propertyDefinition];

    schemaRequest.documentSchema = documentSchemaRequest;

    // Create Document Schema
    const documentSchema =
      await schemaClient.createDocumentSchema(schemaRequest);

    // Property Value Definition
    const documentProperty = {};
    documentProperty.name = propertyDefinition.name;
    documentProperty.textValues = {values: ['GOOG']};

    // Document Definition
    const document = {};
    document.displayName = 'My Test Document';
    document.documentSchemaName = documentSchema[0].name;
    document.plainText = "This is a sample of a document's text.";
    document.properties = [documentProperty];

    documentRequest.document = document;

    // Metadata Definition
    documentRequest.requestMetadata = {userInfo: {id: userId}};

    // Make Request
    const response = await serviceClient.createDocument(documentRequest);

    // Print out response
    response.then(
      result => console.log(`Document Created: ${JSON.stringify(result)}`),
      error => console.log(`${error}`)
    );
  }

  // [END contentwarehouse_quickstart]
  await quickstart();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
