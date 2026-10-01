// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START developerknowledge_batch_get_documents]
const {DeveloperKnowledgeClient} = require('@google/developer-knowledge');

/**
 * Retrieves multiple developer documentation pages in a single request.
 *
 * @param {string[]} names Array of resource names in format 'documents/{uri_without_scheme}'.
 */
async function batchGetDocuments(
  names = [
    'documents/docs.cloud.google.com/storage/docs/creating-buckets',
    'documents/docs.cloud.google.com/storage/docs/deleting-buckets',
  ]
) {
  const client = new DeveloperKnowledgeClient();

  const request = {
    names,
  };

  const [response] = await client.batchGetDocuments(request);

  if (response.documents) {
    for (const doc of response.documents) {
      console.log(`Title: ${doc.title}`);
      console.log(`URI: ${doc.uri}`);
      console.log(`Content Length: ${doc.contentLengthBytes} bytes\n`);
    }
  }

  return response;
}
// [END developerknowledge_batch_get_documents]

module.exports = {batchGetDocuments};

if (require.main === module) {
  batchGetDocuments().catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}
