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
 * updateSource demonstrates how to update fields on a security findings
 * source.
 */
function main(sourceName = 'FULL_PATH_TO_SOURCE') {
  // [START securitycenter_update_source]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();
  // sourceName is the full resource path to the update target.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const sourceName = "organizations/111122222444/sources/1234";
  async function updateSource() {
    const [source] = await client.updateSource({
      source: {
        name: sourceName,
        displayName: 'New Display Name',
      },
      // Only update the display name field (if not set all mutable
      // fields of the source will be updated.
      updateMask: {paths: ['display_name']},
    });
    console.log('Updated source: %j', source);
  }

  updateSource();
  // [END securitycenter_update_source]
}

main(...process.argv.slice(2));
