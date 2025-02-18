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

/** Demonstrates listing findings at a point in time. */
function main(sourceName = 'FULL RESOURCE PATH TO PARENT SOURCE') {
  // [START securitycenter_list_findings_at_time]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();
  // sourceName is the fully qualified source name to search for findings
  // under.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const sourceName = `${parent}/sources/${sourceId}`;
  // where,
  // parent: must be in one of the following formats:
  //    `organizations/${organization_id}`
  //    `projects/${project_id}`
  //    `folders/${folder_id}`
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  async function listFindingsAtTime() {
    const [response] = await client.listFindings({
      // List findings across all sources.
      parent: sourceName,
      //commented readTime as it is not supported, refer below link
      //https://cloud.google.com/security-command-center/docs/release-notes#April_15_2024
      // readTime: {
      //   seconds: Math.floor(fiveDaysAgo.getTime() / 1000),
      //   nanos: (fiveDaysAgo.getTime() % 1000) * 1e6,
      // },
    });
    let count = 0;
    Array.from(response).forEach(result =>
      console.log(
        `${++count} ${result.finding.name} ${result.finding.resourceName}`
      )
    );
  }
  listFindingsAtTime();
  // [END securitycenter_list_findings_at_time]
}

main(...process.argv.slice(2));
