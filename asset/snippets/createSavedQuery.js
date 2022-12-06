// Copyright 2021 Google LLC
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
//   title: Create SavedQuery
//   description: Create SavedQuery.

async function main(queryId, description) {
  // [START asset_quickstart_create_saved_query]
  const {AssetServiceClient} = require('@google-cloud/asset');

  const client = new AssetServiceClient();

  // example inputs:
  // const queryId = 'my-query-id';
  // const description = 'description';
  async function createSavedQuery() {
    const projectId = await client.getProjectId();
    const parent = `projects/${projectId}`;
    const request = {
      parent: parent,
      savedQueryId: queryId,
      savedQuery: {
        content: {
          iamPolicyAnalysisQuery: {
            scope: parent,
            accessSelector: {
              permissions: ['iam.serviceAccounts.actAs'],
            },
          },
        },
        description: description,
      },
    };
    const [query] = await client.createSavedQuery(request);
    // Handle the operation using the promise pattern.
    console.log('Query name:', query.name);
    console.log('Query description:', query.description);
    console.log('Created time:', query.createTime);
    console.log('Updated time:', query.lastUpdateTime);
    console.log('Query type:', query.content.queryContent);
    console.log('Query content:', JSON.stringify(query.content, null, 4));
    // [END asset_quickstart_create_saved_query]
  }
  await createSavedQuery();
}

exports.createSavedQuery = main;
