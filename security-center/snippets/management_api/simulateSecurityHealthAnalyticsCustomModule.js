// Copyright 2025 Google LLC
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

/**
 *  Simulate security health analytics custom module
 */
function main(organizationId, locationId = 'global') {
  // [START securitycenter_simulate_security_health_analytics_custom_module]
  // npm install '@google-cloud/securitycentermanagement'
  const {
    SecurityCenterManagementClient,
    protos,
  } = require('@google-cloud/securitycentermanagement');

  const client = new SecurityCenterManagementClient();

  const Severity =
    protos.google.cloud.securitycentermanagement.v1.CustomConfig.Severity;

  /*
   * Required. The name of the parent resource of security health analytics module
   *     Its format is
   *    `organizations/[organization_id]/locations/[location_id]`
   *    `folders/[folder_id]/locations/[location_id]`
   *    `projects/[project_id]/locations/[location_id]`
   */
  const parent = `organizations/${organizationId}/locations/${locationId}`;

  // define the CEL expression here and this will scans for keys that have not been rotated in
  // the last 30 days, change it according to the your requirements
  const expr = {
    expression: `has(resource.rotationPeriod) && (resource.rotationPeriod > duration('2592000s'))`,
  };

  // define the resource selector
  const resourceSelector = {
    resourceTypes: ['cloudkms.googleapis.com/CryptoKey'],
  };

  // define the custom module configuration, update the severity, description,
  // recommendation below
  const customConfig = {
    predicate: expr,
    resourceSelector: resourceSelector,
    severity: Severity.MEDIUM,
    description: 'add your description here',
    recommendation: 'add your recommendation here',
  };

  // define the simulated resource data
  const resourceData = {
    fields: {
      resourceId: {stringValue: 'test-resource-id'},
      name: {stringValue: 'test-resource-name'},
    },
  };

  // define the policy
  const policy = {
    bindings: [
      {
        role: 'roles/owner',
        members: ['user:test-user@gmail.com'],
      },
    ],
  };

  // replace with the correct resource type
  const simulatedResource = {
    resourceType: 'cloudkms.googleapis.com/CryptoKey',
    resourceData: resourceData,
    iamPolicyData: policy,
  };

  async function simulateSecurityHealthAnalyticsCustomModule() {
    const [response] = await client.simulateSecurityHealthAnalyticsCustomModule(
      {
        parent: parent,
        customConfig: customConfig,
        resource: simulatedResource,
      }
    );
    console.log(
      'Security Health Analytics Custom Module simulate succeeded: ',
      response
    );
  }

  simulateSecurityHealthAnalyticsCustomModule();
  // [END securitycenter_simulate_security_health_analytics_custom_module]
}

main(...process.argv.slice(2));
