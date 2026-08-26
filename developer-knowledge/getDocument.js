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

// [START developerknowledge_get_document]
const {DeveloperKnowledgeClient} = require('@google/developer-knowledge');

/**
 * Retrieves a single developer documentation page by its resource name.
 *
 * @param {string} name The resource name in format 'documents/{uri_without_scheme}'.
 */
async function getDocument(
  name = 'documents/docs.cloud.google.com/storage/docs/creating-buckets'
) {
  const client = new DeveloperKnowledgeClient();

  const request = {
    name,
  };

  const [document] = await client.getDocument(request);

  console.log(`Title: ${document.title}`);
  console.log(`URI: ${document.uri}`);
  console.log(`Data Source: ${document.dataSource}`);
  console.log(`Content Length: ${document.contentLengthBytes} bytes`);
  console.log(`Content Preview: ${document.content.substring(0, 150)}...\n`);

  return document;
}
// [END developerknowledge_get_document]

module.exports = {getDocument};

if (require.main === module) {
  getDocument(...process.argv.slice(2)).catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}
