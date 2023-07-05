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

/** Demonstrates listing findings by filtering on security marks. */
function main(sourceName = 'YOUR_NUMERIC_ORG_ID') {
  // [START securitycenter_list_findings_with_security_marks]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();
  //  sourceName is the full resource path of the source to search for
  //  findings.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const sourceName = `${parent}/sources/${sourceId}`;
  // where,
  // parent: must be in one of the following formats:
  //    `organizations/${organization_id}`
  //    `projects/${project_id}`
  //    `folders/${folder_id}`

  async function listFindingsWithSecurityMarks() {
    const [response] = await client.listFindings({
      // List findings across all sources.
      parent: sourceName,
      filter: 'NOT security_marks.marks.key_a="value_a"',
    });
    let count = 0;
    Array.from(response).forEach(result =>
      console.log(
        `${++count} ${result.finding.name} ${result.finding.resourceName}`
      )
    );
  }
  listFindingsWithSecurityMarks();
  // [END securitycenter_list_findings_with_security_marks]
}

main(...process.argv.slice(2));
