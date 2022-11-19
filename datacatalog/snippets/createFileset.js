// Copyright 2020 Google LLC
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

async function main(projectId, entryGroupId, entryId) {
  // [START data_catalog_create_fileset]
  // Import the Google Cloud client library.
  const {DataCatalogClient} = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  async function createFileset() {
    // Create a fileset within an entry group.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'my_project';
    // const entryGroupId = 'my_entry_group';
    // const entryId = 'my_entry';

    // Currently, Data Catalog stores metadata in the us-central1 region.
    const location = 'us-central1';

    // Delete any pre-existing Entry with the same name that will be used
    // when creating the new Entry.
    try {
      const formattedName = datacatalog.entryPath(
        projectId,
        location,
        entryGroupId,
        entryId
      );
      await datacatalog.deleteEntry({name: formattedName});
    } catch (err) {
      console.log('Entry does not exist.');
    }

    // Delete any pre-existing Entry Group with the same name
    // that will be used to create the new Entry Group.
    try {
      const formattedName = datacatalog.entryGroupPath(
        projectId,
        location,
        entryGroupId
      );
      await datacatalog.deleteEntryGroup({name: formattedName});
    } catch (err) {
      console.log('Entry Group does not exist.');
    }

    // Construct the Entry Group for the Entry Group request.
    const entryGroup = {
      displayName: 'My Fileset Entry Group',
      description: 'This Entry Group consists of ....',
    };

    // Construct the Entry Group request to be sent by the client.
    const entryGroupRequest = {
      parent: datacatalog.locationPath(projectId, location),
      entryGroupId: entryGroupId,
      entryGroup: entryGroup,
    };

    // Use the client to send the API request.
    await datacatalog.createEntryGroup(entryGroupRequest);

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
      entryId: entryId,
      entry: entry,
    };

    // Use the client to send the API request.
    const [response] = await datacatalog.createEntry(request);

    console.log(`Name: ${response.name}`);
    console.log(`Display name: ${response.displayName}`);
    console.log(`Type: ${response.type}`);
  }
  createFileset();
  // [END data_catalog_create_fileset]
}
main(...process.argv.slice(2));
