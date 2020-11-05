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
 * This application demonstrates how to delete a fileset Entry and an
 * Entry Group with the Cloud Data Catalog API.

 * For more information, see the README.md under /datacatalog and the
 * documentation at https://cloud.google.com/data-catalog/docs.
 */
const main = async (
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  entryGroupId,
  entryId
) => {
  // [START datacatalog_delete_fileset_quickstart_tag]
  // -------------------------------
  // Import required modules.
  // -------------------------------
  const {DataCatalogClient} = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  // -------------------------------
  // Currently, Data Catalog stores metadata in the
  // us-central1 region.
  // -------------------------------
  const location = 'us-central1';

  // TODO(developer): Uncomment the following lines before running the sample.
  // const projectId = 'my-project'
  // const entryGroupId = 'my-entry-group'
  // const entryId = 'my-entry'

  // -------------------------------
  // 1. Delete a Fileset Entry.
  // -------------------------------
  const formattedName = datacatalog.entryPath(
    projectId,
    location,
    entryGroupId,
    entryId
  );
  await datacatalog.deleteEntry({name: formattedName});
  console.log(`Deleted entry ${formattedName}`);

  // -------------------------------
  // 2. Delete an Entry Group.
  // -------------------------------
  try {
    const formattedName = datacatalog.entryGroupPath(
      projectId,
      location,
      entryGroupId
    );
    await datacatalog.deleteEntryGroup({name: formattedName});
    console.log(`Deleted entry group ${formattedName}`);
  } catch (err) {
    console.log('Entry Group does not exist or is not empty.');
  }
};
// [END datacatalog_delete_fileset_quickstart_tag]

// node deleteFilesetEntry.js <projectId> <entryGroupId> <entryId>
main(...process.argv.slice(2));
