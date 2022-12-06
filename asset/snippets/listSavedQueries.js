// Copyright 2022 Google LLC
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
//   title: List Saved Queries
//   description: List Saved Queries in the current project

async function main() {
  // [START asset_quickstart_list_saved_queries]
  const {AssetServiceClient} = require('@google-cloud/asset');

  const client = new AssetServiceClient();

  async function listSavedQueries() {
    const projectId = await client.getProjectId();

    const request = {
      parent: `projects/${projectId}`,
    };

    // Handle the operation using the promise pattern.
    const [queries] = await client.listSavedQueries(request);
    // Do things with with the response.
    for (const query of queries) {
      console.log('Query name:', query.name);
      console.log('Query description:', query.description);
      console.log('Created time:', query.createTime);
      console.log('Updated time:', query.lastUpdateTime);
      console.log('Query type:', query.content.queryContent);
      console.log('Query content:', JSON.stringify(query.content, null, 4));
    }
    console.log('Listed saved queries successfully.');
    // [END asset_quickstart_list_saved_queries]
  }
  await listSavedQueries();
}

exports.listSavedQueries = main;
