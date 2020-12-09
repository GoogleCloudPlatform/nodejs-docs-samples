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
 * This application demonstrates how to create a Entry Group with the
 * Cloud Data Catalog API.

 * For more information, see the README.md under /datacatalog and the
 * documentation at https://cloud.google.com/data-catalog/docs.
 */
const main = async (
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  entryGroupId
) => {
  // [START datacatalog_create_entry_group_tag]
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

  // Create an Entry Group.
  // Construct the EntryGroup for the EntryGroup request.
  const entryGroup = {
    displayName: 'My Fileset Entry Group',
    description: 'This Entry Group consists of ....',
  };

  // Construct the EntryGroup request to be sent by the client.
  const entryGroupRequest = {
    parent: datacatalog.locationPath(projectId, location),
    entryGroupId,
    entryGroup,
  };

  // Use the client to send the API request.
  const [response] = await datacatalog.createEntryGroup(entryGroupRequest);

  console.log(response);
  // [END datacatalog_create_entry_group_tag]
};

// node createEntryGroup.js <projectId> <entryGroupId>
main(...process.argv.slice(2));
