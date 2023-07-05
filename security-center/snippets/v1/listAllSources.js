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

/** Prints all sources in an organization. */
function main(organizationId = 'YOUR_NUMERIC_ORG_ID') {
  // [START securitycenter_list_sources]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();
  //  organizationId is the numeric ID of the organization.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // parent: must be in one of the following formats:
  //    `organizations/${organization_id}`
  //    `projects/${project_id}`
  //    `folders/${folder_id}`
  const parent = `organizations/${organizationId}`;
  // Call the API with automatic pagination.
  async function listSources() {
    const [response] = await client.listSources({parent: parent});
    let count = 0;
    console.log('Sources:');
    Array.from(response).forEach(source =>
      console.log('%d %j', ++count, source)
    );
  }

  listSources();
  // [END securitycenter_list_sources]
}

main(...process.argv.slice(2));
