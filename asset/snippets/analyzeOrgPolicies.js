// Copyright 2023 Google LLC
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
//   title: Analyze Org Policies
//   description: Analyzes accessible Org policies that match a request.
//   usage: node analyzeOrgPolicies

async function main(scope, constraint) {
  // [START asset_quickstart_analyze_org_policies]
  const util = require('util');
  const {AssetServiceClient} = require('@google-cloud/asset');

  const client = new AssetServiceClient();

  async function analyzeOrgPolicies() {
    const request = {
      scope: scope,
      constraint: constraint,
    };

    // Handle the operation using the promise pattern.
    const result = await client.analyzeOrgPolicies(request);
    // Do things with with the response.
    console.log(util.inspect(result, {depth: null}));
  }
  // [END asset_quickstart_analyze_org_policies]
  analyzeOrgPolicies();
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
