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

/** Demonstrates listing findings by filtering on security marks. */
function main(organizationId, sourceId) {
  // [START securitycenter_list_findings_with_security_marks_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();
  //  Build the full resource path for the source to search for findings.

  // The source path supports mutliple formats:
  // - `${parent}/sources/${sourceId}` without a location
  // - `${parent}/sources/${sourceId}/locations/${location}` with a location
  // where parent must be in one of the following formats:
  // - `organizations/${organization_id}`
  // - `folders/${folder_id}`
  // - `projects/${project_id}`

  /*
   * TODO(developer): Update the following references for your own environment before running the sample.
   */
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const sourceId = 'SOURCE_ID';

  const sourceName = `organizations/${organizationId}/sources/${sourceId}`;

  // Construct the request to be sent by the client.
  const listFindingsRequest = {
    // List findings across all sources.
    parent: sourceName,
    filter: 'NOT security_marks.marks.key_a="value_a"',
  };

  async function listFindingsWithSecurityMarks() {
    const [response] = await client.listFindings(listFindingsRequest);
    let count = 0;
    Array.from(response).forEach(result =>
      console.log(
        `${++count} ${result.finding.name} ${result.finding.resourceName}`
      )
    );
  }
  listFindingsWithSecurityMarks();
  // [END securitycenter_list_findings_with_security_marks_v2]
}

main(...process.argv.slice(2));
