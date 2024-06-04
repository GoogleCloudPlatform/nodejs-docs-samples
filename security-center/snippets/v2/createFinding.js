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
 * Demonstrates how to create a new security finding in CSCC.
 */
function main(organizationId, sourceId, location = 'global', category = 'LOW_RISK_ONE') {
  // [START securitycenter_create_finding_v2]
  // Imports the Google Cloud client library.
  const { SecurityCenterClient } = require('@google-cloud/security-center').v2;
  const uuid = require('uuid');

  // Create a Security Center client
  const client = new SecurityCenterClient();

  /**
   *  Required. Resource name of the new finding's parent. The following list
   *  shows some examples of the format:
   *  `organizations/[organization_id]/sources/[source_id]`
   *  `organizations/[organization_id]/sources/[source_id]/locations/[location_id]`
   */
  const parent = `organizations/${organizationId}/sources/${sourceId}/locations/${location}`;

  // The resource this finding applies to. The Cloud Security Command Center UI can link the
  // findings for a resource to the corresponding asset of a resource if there are matches.
  const resourceName = `//cloudresourcemanager.googleapis.com/organizations/${organizationId}`;

  /**
   *  Required. Unique identifier provided by the client within the parent scope.
   *  It must be alphanumeric and less than or equal to 32 characters and
   *  greater than 0 characters in length.
   */
  const findingId = uuid.v4().replace(/-/g, '');

  // Get the current timestamp.
  const eventTime = new Date();

  // Build the finding object.
  const finding = {
    parent: parent,
    state: 'ACTIVE',
    severity: 'LOW',
    mute: 'UNMUTED',
    findingClass: 'OBSERVATION',
    resourceName: resourceName,
    eventTime: {
      seconds: Math.floor(eventTime.getTime() / 1000),
      nanos: (eventTime.getTime() % 1000) * 1e6,
    },
    category,
  };

  // Build the create finding request.
  const createFindingRequest = {
    parent,
    findingId,
    finding,
  };

  async function createFinding() {

    // Call the API.
    const [finding] = await client.createFinding(createFindingRequest);
    console.log('New finding created: %j', finding);
  }
  
  createFinding();
  // [END securitycenter_create_finding_v2]
}

main(...process.argv.slice(2));