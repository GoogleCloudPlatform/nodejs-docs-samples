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

// sample-metadata:
//   title: Update Saved Query
//   description: Update Saved Query.
//   usage: node updateSavedQuery <FULL-QUERY-NAME> <QUERY-DESCRIPTION>

async function main(fullQueryName, description) {
  // [START asset_quickstart_update_feed]
  const util = require('util');
  const {AssetServiceClient} = require('@google-cloud/asset');

  const client = new AssetServiceClient();
  async function updateSavedQuery() {
    const request = {
      savedQuery: {
        name: fullQueryName,
        description: `${description}`,
      },
      updateMask: {
        paths: ['description'],
      },
    };

    // Handle the operation using the promise pattern.
    const result = await client.updateSavedQuery(request);
    // Do things with with the response.
    console.log(util.inspect(result, {depth: null}));
    // [END asset_quickstart_update_feed]
  }
  updateSavedQuery();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
