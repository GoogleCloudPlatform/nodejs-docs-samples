// Copyright 2019 Google LLC
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

/**
 * This application demonstrates how to create a fileset Entry with the
 * Cloud Data Catalog API.

 * For more information, see the README.md under /datacatalog and the
 * documentation at https://cloud.google.com/data-catalog/docs.
 */
const main = async (
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  entryGroupId,
  entryId
) => {
  // [START datacatalog_create_fileset_tag]
  // -------------------------------
  // Import required modules.
  // -------------------------------
  const {DataCatalogClient} = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  // Currently, Data Catalog stores metadata in the
  // us-central1 region.
  const location = 'us-central1';

  // TODO(developer): Uncomment the following lines before running the sample.
  // const projectId = 'my-project'
  // const entryGroupId = 'my-entry-group'
  // const entryId = 'my-entry'

  // Create a Fileset Entry.
  // Construct the Entry for the Entry request.
  const FILESET_TYPE = 4;

  const entry = {
    displayName: 'My Fileset',
    description: 'This fileset consists of ....',
    gcsFilesetSpec: {filePatterns: ['gs://my_bucket/*']},
    schema: {
      columns: [
        {
          column: 'city',
          description: 'City',
          mode: 'NULLABLE',
          type: 'STRING',
        },
        {
          column: 'state',
          description: 'State',
          mode: 'NULLABLE',
          type: 'STRING',
        },
        {
          column: 'addresses',
          description: 'Addresses',
          mode: 'REPEATED',
          subcolumns: [
            {
              column: 'city',
              description: 'City',
              mode: 'NULLABLE',
              type: 'STRING',
            },
            {
              column: 'state',
              description: 'State',
              mode: 'NULLABLE',
              type: 'STRING',
            },
          ],
          type: 'RECORD',
        },
      ],
    },
    type: FILESET_TYPE,
  };

  // Construct the Entry request to be sent by the client.
  const request = {
    parent: datacatalog.entryGroupPath(projectId, location, entryGroupId),
    entryId,
    entry,
  };

  // Use the client to send the API request.
  const [response] = await datacatalog.createEntry(request);

  console.log(response);
  // [END datacatalog_create_fileset_tag]
};

// node createFilesetEntry.js <projectId> <entryGroupId> <entryId>
main(...process.argv.slice(2));
