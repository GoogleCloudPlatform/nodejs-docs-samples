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
//   usage: node createSavedQuery savedQueryId description

async function main(savedQueryId, description) {
  const util = require('util');
  const {AssetServiceClient} = require('@google-cloud/asset');

  const client = new AssetServiceClient();

  async function createSavedQuery() {
    const projectId = await client.getProjectId();
    const parent = `projects/${projectId}`;
    const request = {
      parent: `${parent}`,
      savedQueryId: `${savedQueryId}`,
      savedQuery: {
        content: {
          iamPolicyAnalysisQuery: {
            scope: `${parent}`,
            accessSelector: {
              permissions:["iam.serviceAccounts.actAs"]
            }
          }
        },
        description: `${description}`
      }
    };


    // Handle the operation using the promise pattern.
    const result = await client.createSavedQuery(request);
    // Do things with with the response.
    console.log(util.inspect(result, {depth: null}));
    // [END asset_quickstart_create_saved_query]
  }
  createSavedQuery();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
