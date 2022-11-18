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

function main(parent) {
  // [START data_catalog_ptm_create_policytag]
  // Create a policy tag resource under a given parent taxonomy.

  // Import the Google Cloud client library.
  const {PolicyTagManagerClient} = require('@google-cloud/datacatalog').v1;
  const policyClient = new PolicyTagManagerClient();

  async function createPolicyTag() {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'my_project'; // Google Cloud Platform project
    // const location = 'us';
    // const taxonomy = 'my_existing_taxonomy';
    // const parent = `projects/${projectId}/locations/${location}/taxonomies/${taxonomy}`;

    const request = {
      parent,
      policyTag: {
        displayName: 'nodejs_samples_tag',
        //   // It optionally accepts a parent ID, which can be used to create a hierarchical
        //   // relationship between tags.
        //   parentPolicyTag: `projects/${projectId}/locations/${location}/taxonomies/${taxonomy}/policyTags/my_existing_policy_tag`
      },
    };

    try {
      const [metadata] = await policyClient.createPolicyTag(request);
      console.log(`Created policy tag: ${metadata.name}`);
    } catch (e) {
      console.error(e);
      process.exitCode = 1;
    }
  }
  // [END data_catalog_ptm_create_policytag]
  createPolicyTag();
}
main(...process.argv.slice(2));
