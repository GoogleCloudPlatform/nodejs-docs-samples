// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {viewDatasetAccessPolicy} = require('./src/viewDatasetAccessPolicy');
const {
  viewTableOrViewAccessPolicy,
} = require('./src/viewTableOrViewAccessPolicy');

async function main() {
  try {
    // Example usage of dataset access policy viewer
    await viewDatasetAccessPolicy();

    // Example usage of table/view access policy viewer
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    await viewTableOrViewAccessPolicy({
      projectId,
      datasetId: 'my_new_dataset',
      resourceName: 'my_table',
    });
  } catch (error) {
    console.error('Error:', error);
    process.exitCode = 1;
  }
}

// Run the samples if this file is run directly
if (require.main === module) {
  main();
}

module.export = {viewDatasetAccessPolicy, viewTableOrViewAccessPolicy};
