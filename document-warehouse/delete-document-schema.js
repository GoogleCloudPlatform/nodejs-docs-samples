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
  location = 'YOUR_PROJECT_LOCATION',
  documentSchemaId = 'YOUR_DOCUMENT_SCHEMA_ID'
) {
  // [START contentwarehouse_delete_document_schema]

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * const projectId = 'YOUR_PROJECT_ID';
   * const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
   * const documentSchemaId = 'YOUR_DOCUMENT_SCHEMA_ID';
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

  // Delete Document Schema
  async function deleteDocumentSchema() {
    // Initialize request argument(s)
    const request = {
      // The full resource name of the location, e.g.:
      // projects/{project_number}/locations/{location}/documentSchemas/{document_schema_id}
      name: `projects/${projectId}/locations/${location}/documentSchemas/${documentSchemaId}`,
    };

    // Make Request
    const response = await serviceClient.deleteDocumentSchema(request);

    // Print out response
    console.log(`Document Schema Deleted: ${JSON.stringify(response)}`);
  }

  // [END contentwarehouse_delete_document_schema]
  await deleteDocumentSchema();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
