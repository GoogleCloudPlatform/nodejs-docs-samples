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

  }

  // [END contentwarehouse_search_documents]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});