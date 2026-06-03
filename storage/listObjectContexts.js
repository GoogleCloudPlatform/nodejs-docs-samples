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

// sample-metadata:
//   title: List Objects with Context Filter
//   description: Lists objects in a bucket that match specific custom contexts.
//   usage: node listObjectContexts.js <BUCKET_NAME>

/**
 * This application demonstrates how to list objects in a bucket while filtering
 * by their custom 'contexts' metadata.
 */

function main(bucketName = 'my-bucket') {
  // [START storage_list_object_contexts]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function listObjectContexts() {
    // Define the filter for contexts.
    const bucket = storage.bucket(bucketName);

    /**
     * List any object that has a context with the specified key and value.
     * Syntax: contexts."<key>"="<value>"
     */
    const filterByValue = 'contexts."priority"="high"';
    const [filesByValue] = await bucket.getFiles({
      filter: filterByValue,
    });

    console.log(`\nFiles matching filter [${filterByValue}]:`);
    filesByValue.forEach(file => console.log(` - ${file.name}`));

    /**
     * List any object that has a context with the specified key attached.
     * Syntax: contexts."<key>":*
     */
    const filterByExistence = 'contexts."team-owner":*';
    const [filesWithKey] = await bucket.getFiles({
      filter: filterByExistence,
    });

    console.log(
      `\nFiles with the "team-owner" context key [${filterByExistence}]:`
    );
    filesWithKey.forEach(file => console.log(` - ${file.name}`));

    /**
     * List any object that does not have a context with the specified key and value attached.
     * Syntax: -contexts."<key>"="<value>"
     */
    const absenceOfValuePair = '-contexts."priority"="high"';
    const [filesNoHighPriority] = await bucket.getFiles({
      filter: absenceOfValuePair,
    });

    console.log(
      `\nFiles matching absence of value pair [${absenceOfValuePair}]:`
    );
    filesNoHighPriority.forEach(file => console.log(` - ${file.name}`));

    /**
     * List any object that does not have a context with the specified key attached.
     * Syntax: -contexts."<key>":*
     */
    const absenceOfKey = '-contexts."team-owner":*';
    const [filesNoTeamOwner] = await bucket.getFiles({
      filter: absenceOfKey,
    });

    console.log(
      `\nFiles matching absence of key regardless of value [${absenceOfKey}]:`
    );
    filesNoTeamOwner.forEach(file => console.log(` - ${file.name}`));
  }

  listObjectContexts().catch(console.error);
  // [END storage_list_object_contexts]
}

main(...process.argv.slice(2));
