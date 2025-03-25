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

/**  Prints all findings across all sources. */
async function main(organizationId = 'YOUR_NUMERIC_ORG_ID') {
  // [START securitycenter_list_all_findings]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();
  //  organizationId is the numeric ID of the organization.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const organizationId = "1234567777";

  async function listAllFindings() {
    const [response] = await client.listFindings({
      // List findings across all sources.
      // parent: must be in one of the following formats:
      //    `organizations/${organization_id}/sources/-`
      //    `projects/${project_id}/sources/-`
      //    `folders/${folder_id}/sources/-`
      parent: `organizations/${organizationId}/sources/-`,
    });
    let count = 0;
    Array.from(response).forEach(result =>
      console.log(
        `${++count} ${result.finding.name} ${result.finding.resourceName}`
      )
    );
  }
  await listAllFindings();
  // [END securitycenter_list_all_findings]
}

main(process.argv.slice(2)[0]).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
