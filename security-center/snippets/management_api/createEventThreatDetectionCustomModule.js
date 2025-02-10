/*
 * Copyright 2025 Google LLC
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
 * Demonstrates how to create a new event threat detection custom module
 */
function main(organizationId, customModuleDisplayName, location = 'global') {
  // [START securitycenter_create_event_threat_detection_custom_module]
  // Imports the Google cloud client library.
  const {SecurityCenterManagementClient} =
    require('@google-cloud/securitycentermanagement').v1;

  // Create a Security Center Management client
  const client = new SecurityCenterManagementClient();

  /**
   *  Required. The name of the parent resource of the create event threat detection module. Its
   *  format is "organizations/[organization_id]/locations/[location_id]",
   *  "folders/[folder_id]/locations/[location_id]", or
   *  "projects/[project_id]/locations/[location_id]".
   */
  //TODO(developer): Update the following references for your own environment before running the sample.
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  const parent = `organizations/${organizationId}/locations/${location}`;

  // define the event threat detection custom module configuration, update the EnablementState
  // below
  const eventThreatDetectionCustomModule = {
    displayName: customModuleDisplayName,
    enablementState: 'ENABLED',
    type: 'CONFIGURABLE_BAD_IP',
    config: prepareConfigDetails(),
  };

  // Build the request.
  const createEventThreatDetectionCustomModuleRequest = {
    parent: parent,
    eventThreatDetectionCustomModule: eventThreatDetectionCustomModule,
  };

  async function createEventThreatDetectionCustomModule() {
    // Call the API.
    const [response] = await client.createEventThreatDetectionCustomModule(
      createEventThreatDetectionCustomModuleRequest
    );
    console.log('EventThreatDetectionCustomModule created : %j', response);
  }

  function prepareConfigDetails() {
    // define the metadata and other config parameters severity, description,
    // recommendation and ips below
    const config = {
      fields: {
        metadata: {
          structValue: {
            fields: {
              severity: {stringValue: 'LOW'},
              description: {stringValue: 'Flagged by Cymbal as malicious'},
              recommendation: {
                stringValue: 'Contact the owner of the relevant project.',
              },
            },
          },
        },
        ips: {
          listValue: {
            values: [{stringValue: '192.0.2.1'}, {stringValue: '192.0.2.0/24'}],
          },
        },
      },
    };
    return config;
  }

  createEventThreatDetectionCustomModule();
  // [END securitycenter_create_event_threat_detection_custom_module]
}

main(...process.argv.slice(2));
