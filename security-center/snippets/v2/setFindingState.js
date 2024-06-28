/*
 * Copyright 2024 Google LLC
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
 * Demonstrates how to update a finding's state.
 */
function main(organizationId, sourceId, findingId, location = 'global') {
  // [START securitycenter_set_findings_by_state_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();

  /**
   *  Required. The name is the full resource name of the source the finding should be associated with.
   */
  const name = `organizations/${organizationId}/sources/${sourceId}/locations/${location}/findings/${findingId}`;

  // Build the request.
  const eventTime = new Date();

  const findingRequest = {
    name,
    state: 'INACTIVE',
    // use now as the time when the new state takes effect.
    startTime: {
      seconds: Math.floor(eventTime.getTime() / 1000),
      nanos: (eventTime.getTime() % 1000) * 1e6,
    },
  };

  async function setFindingState() {
    // Call the API.
    const [response] = await client.setFindingState(findingRequest);
    console.log('Set finding state: %j', response);
  }

  setFindingState();
  // [END securitycenter_set_findings_by_state_v2]
}

main(...process.argv.slice(2));
