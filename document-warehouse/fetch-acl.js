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
  userId = 'user:xxxx@example.com',
  documentId = 'YOUR_DOCUMENT_ID'
) {
  // [START contentwarehouse_fetch_acl]

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   * const projectId = 'YOUR_PROJECT_ID';
   * const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
   * const documentId = 'YOUR_DOCUMENT_ID',
   * const userId = "user:xxxx@example.com" // Format is "user:xxxx@example.com"
   */

  // Import from google cloud
  const {DocumentServiceClient} = require('@google-cloud/contentwarehouse').v1;

  const apiEndpoint =
    location === 'us'
      ? 'contentwarehouse.googleapis.com'
      : `${location}-contentwarehouse.googleapis.com`;

  // Create service client
  const serviceClient = new DocumentServiceClient({apiEndpoint: apiEndpoint});

  // Fetches access control policies on project or document level.
  async function fetchACL() {
    // Initialize request argument(s)
    const request = {};
    if (documentId !== 'YOUR_DOCUMENT_ID') {
      // Full document resource name, e.g.:
      // projects/{project_id}/locations/{location}/documents/{document_id}
      request.resource = `projects/${projectId}/locations/${location}/documents/${documentId}`;
      request.requestMetadata = {userInfo: {id: userId}};
    } else {
      // Full document resource name, e.g.: projects/{project_id}
      request.resource = `projects/${projectId}`;
      request.projectOwner = true;
    }

    // Make Request
    const response = serviceClient.fetchAcl(request);

    // Print out response
    response.then(
      result => console.log(`Success! Response: \n${JSON.stringify(result)}`),
      error => console.log(`Failed! Response: \n${error}`)
    );
  }

  // [END contentwarehouse_fetch_acl]
  await fetchACL();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
