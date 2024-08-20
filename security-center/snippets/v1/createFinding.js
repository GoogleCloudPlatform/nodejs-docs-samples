/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Demonstrates how to create a new security finding in CSCC.
 */
async function main(sourceName = 'FULL_PATH_TO_SOURCE_FOR_FINDING') {
  // [START securitycenter_create_finding]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();
  // sourceName is the full resource name of the source the finding should
  // be associated with.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const sourceName = "organizations/111122222444/sources/1234";

  // Use now as the eventTime for the security finding.
  const eventTime = new Date();
  async function createFinding() {
    const [newFinding] = await client.createFinding({
      parent: sourceName,
      findingId: 'samplefindingid',
      finding: {
        state: 'ACTIVE',
        // Resource the finding is associated with.  This is an
        // example any resource identifier can be used.
        resourceName:
          '//cloudresourcemanager.googleapis.com/organizations/11232',
        // A free-form category.
        category: 'MEDIUM_RISK_ONE',
        // The time associated with discovering the issue.
        eventTime: {
          seconds: Math.floor(eventTime.getTime() / 1000),
          nanos: (eventTime.getTime() % 1000) * 1e6,
        },
      },
    });
    console.log('New finding created: %j', newFinding);
  }
  await createFinding();
  // [END securitycenter_create_finding]
}

main(process.argv.slice(2)[0]).catch(err => {
  console.log(err);
  process.exitCode = 1;
});
