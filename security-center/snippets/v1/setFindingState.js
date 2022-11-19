/*
 * Copyright 2019, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Demonstrates how to update a security finding's state in
 * CSCC.
 */
function main(findingName = 'FULL_FINDING_PATH') {
  // [START securitycenter_update_finding_state]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();

  // findingName is the full resource name of the source the finding should
  // be associated with.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const findingName =
  // "organizations/111122222444/sources/1234/findings/findingid";
  async function setFindingState() {
    const eventTime = new Date();
    const [updatedFinding] = await client.setFindingState({
      name: findingName,
      state: 'INACTIVE',
      // use now as the time when the new state takes effect.
      startTime: {
        seconds: Math.floor(eventTime.getTime() / 1000),
        nanos: (eventTime.getTime() % 1000) * 1e6,
      },
    });
    console.log('Updated Finding: %j', updatedFinding);
  }
  setFindingState();
  // [END securitycenter_update_finding_state]
}

main(...process.argv.slice(2));
