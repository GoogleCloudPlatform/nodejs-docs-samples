// Copyright 2024 Google LLC
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
 * Demonstrates adding/updating at the same time as deleting security
 * marks from an asset.
 */
function main(assetName = 'full asset path to add marks to') {
  // [START securitycenter_add_delete_security_marks_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();

  async function addDeleteSecurityMarks() {
    // assetName is the full resource path for the asset to update.
    // Specify the value of 'assetName' in one of the following formats:
    //    `organizations/${org-id}/assets/${asset-id}`;
    //    `projects/${project-id}/assets/${asset-id}`;
    //    `folders/${folder-id}/assets/${asset-id}`;
    const [newMarks] = await client.updateSecurityMarks({
      securityMarks: {
        name: `${assetName}/securityMarks`,
        marks: {key_a: 'new_value_a'},
      },
      // Only update the enableAssetDiscovery field.
      updateMask: {paths: ['marks.key_a', 'marks.key_b']},
    });

    console.log('New marks: %j', newMarks);
  }
  addDeleteSecurityMarks();
  // [END securitycenter_add_delete_security_marks_v2]
}

main(...process.argv.slice(2));
