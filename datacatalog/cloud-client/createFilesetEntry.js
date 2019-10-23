/* eslint-disable no-warning-comments */

/**
 * Copyright 2019 Google Inc. All Rights Reserved.
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

/**
 * This application demonstrates how to create a fileset Entry with the
 * Cloud Data Catalog API.

 * For more information, see the README.md under /datacatalog and the
 * documentation at https://cloud.google.com/data-catalog/docs.
 */
const main = async (
  projectId = process.env.GCLOUD_PROJECT,
  entryGroupId,
  entryId
) => {
  // [START datacatalog_create_fileset]
  // -------------------------------
  // Import required modules.
  // -------------------------------
  const {DataCatalogClient} = require('@google-cloud/datacatalog').v1beta1;
  const datacatalog = new DataCatalogClient();

  // Currently, Data Catalog stores metadata in the
  // us-central1 region.
  const location = 'us-central1';

  // TODO(developer): Uncomment the following lines before running the sample.
  // const entryGroupId = 'my-entry-group'
  // const entryId = 'my-entry'

  // 1. Create an Entry Group.
  // -------------------------------
  // Construct the EntryGroup for the EntryGroup request.
  const entryGroup = {
    displayName: 'My Fileset Entry Group',
    description: 'This Entry Group consists of ....',
  };

  // Construct the EntryGroup request to be sent by the client.
  const entryGroupRequest = {
    parent: datacatalog.locationPath(projectId, location),
    entryGroupId: entryGroupId,
    entryGroup: entryGroup,
  };

  // Use the client to send the API request.
  await datacatalog.createEntryGroup(entryGroupRequest);

  // -------------------------------
  // 2. Create a Fileset Entry.
  // -------------------------------
  // Construct the Entry for the Entry request.
  const FILESET_TYPE = 4;

  const entry = {
    displayName: 'My Fileset',
    description: 'This fileset consists of ....',
    gcsFilesetSpec: {filePatterns: ['gs://my_bucket/*']},
    schema: {
      columns: [
        {
          column: 'first_column',
          type: 'STRING',
          description: 'This columns consists of ....',
        },
        {
          column: 'second_column',
          type: 'STRING',
          description: 'This columns consists of ....',
        },
      ],
    },
    type: FILESET_TYPE,
  };

  // Construct the Entry request to be sent by the client.
  const request = {
    parent: datacatalog.entryGroupPath(projectId, location, entryGroupId),
    entryId: entryId,
    entry: entry,
  };

  // Use the client to send the API request.
  const [response] = await datacatalog.createEntry(request);

  console.log(response);
  // [END datacatalog_create_fileset]
};

// node createFilesetEntry.js <projectId> <entryGroupId> <entryId>
main(...process.argv.slice(2));
