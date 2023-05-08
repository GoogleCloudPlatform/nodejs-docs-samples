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
//   title: Analyze Org Policy Governed Assets
//   description: Analyzes organization policies governed assets (Google Cloud
//   resources or policies) under a scope.
//   usage: node analyzeOrgPoliciesGovernedAssets

async function main(scope, constraint) {
  // [START asset_quickstart_analyze_org_policy_governed_assets]
  const util = require('util');
  const {AssetServiceClient} = require('@google-cloud/asset');

  const client = new AssetServiceClient();

  async function analyzeOrgPolicyGovernedAssets() {
    const request = {
      scope: scope,
      constraint: constraint,
    };

    // Handle the operation using the promise pattern.
    const result = await client.analyzeOrgPolicyGovernedAssets(request);
    // Do things with with the response.
    console.log(util.inspect(result, {depth: null}));
  }
  // [END asset_quickstart_analyze_org_policy_governed_assets]
  analyzeOrgPolicyGovernedAssets();
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
