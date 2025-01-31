// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {
  SecurityCenterManagementClient,
  protos,
} = require('@google-cloud/securitycentermanagement');
const uuidv1 = require('uuid').v1;
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

// TODO(developer): update for your own environment
const organizationId = '1081635000895';
const locationId = 'global';
const customModuleDisplayName =
  'node_security_health_analytics_test' + uuidv1().replace(/-/g, '_');

describe('security health analytics custom module', async () => {
  let data;
  const sharedModuleIds = [];

  before(async () => {
    const client = new SecurityCenterManagementClient();
    const EnablementState =
      protos.google.cloud.securitycentermanagement.v1
        .SecurityHealthAnalyticsCustomModule.EnablementState;
    const Severity =
      protos.google.cloud.securitycentermanagement.v1.CustomConfig.Severity;
    const parent = `organizations/${organizationId}/locations/${locationId}`;
    const name = `organizations/${organizationId}/locations/${locationId}/securityHealthAnalyticsCustomModules/custom_module`;
    const expr = {
      expression: `has(resource.rotationPeriod) && (resource.rotationPeriod > duration('2592000s'))`,
    };
    const resourceSelector = {
      resourceTypes: ['cloudkms.googleapis.com/CryptoKey'],
    };
    const customConfig = {
      predicate: expr,
      resourceSelector: resourceSelector,
      severity: Severity.MEDIUM,
      description: 'add your description here',
      recommendation: 'add your recommendation here',
    };
    const securityHealthAnalyticsCustomModule = {
      name: name,
      displayName: customModuleDisplayName,
      enablementState: EnablementState.ENABLED,
      customConfig: customConfig,
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const [createResponse] =
        await client.createSecurityHealthAnalyticsCustomModule({
          parent: parent,
          securityHealthAnalyticsCustomModule:
            securityHealthAnalyticsCustomModule,
        });
      // extracts the custom module ID from the full name
      const customModuleId = createResponse.name.split('/').pop();
      data = {
        orgId: organizationId,
        customModuleId: customModuleId,
        customModuleName: createResponse.displayName,
      };
      sharedModuleIds.push(customModuleId);
      console.log(
        'SecurityHealthAnalyticsCustomModule created : %j',
        createResponse
      );
    } catch (error) {
      console.error(
        'Error creating SecurityHealthAnalyticsCustomModule:',
        error
      );
    }
  });

  after(async () => {
    const client = new SecurityCenterManagementClient();

    if (sharedModuleIds.length > 0) {
      for (const moduleId of sharedModuleIds) {
        const name = `organizations/${organizationId}/locations/${locationId}/securityHealthAnalyticsCustomModules/${moduleId}`;

        try {
          await client.deleteSecurityHealthAnalyticsCustomModule({
            name: name,
          });
          console.log(
            `SecurityHealthAnalyticsCustomModule ${moduleId} deleted successfully.`
          );
        } catch (error) {
          console.error(
            'Error deleting SecurityHealthAnalyticsCustomModule:',
            error
          );
        }
      }
    }
  });

  it('create security health analytics custom module', done => {
    const output = exec(
      `node management_api/createSecurityHealthAnalyticsCustomModule.js ${data.orgId} ${data.customModuleName} ${locationId}`
    );

    const name = output.match(/name:\s*['"]([^'"]+)['"]/)[1];
    sharedModuleIds.push(name.split('/').pop());

    assert.include(output, data.customModuleName);
    assert.match(
      output,
      /Security Health Analytics Custom Module creation succeeded/
    );
    assert.notMatch(output, /undefined/);
    done();
  });

  it('update security health analytics custom module', done => {
    const output = exec(
      `node management_api/updateSecurityHealthAnalyticsCustomModule.js ${data.orgId} ${data.customModuleId} ${locationId}`
    );
    assert.include(output, 'DISABLED');
    assert.match(
      output,
      /Security Health Analytics Custom Module update succeeded/
    );
    assert.notMatch(output, /undefined/);
    done();
  });

  it('get security health analytics custom module', done => {
    const output = exec(
      `node management_api/getSecurityHealthAnalyticsCustomModule.js ${data.orgId} ${data.customModuleId} ${locationId}`
    );
    assert.include(output, data.customModuleName);
    assert.match(
      output,
      /Security Health Analytics Custom Module get succeeded/
    );
    assert.notMatch(output, /undefined/);
    done();
  });

  it('get effective security health analytics custom module', done => {
    const output = exec(
      `node management_api/getEffectiveSecurityHealthAnalyticsCustomModule.js ${data.orgId} ${data.customModuleId} ${locationId}`
    );
    assert.include(output, data.customModuleName);
    assert.match(
      output,
      /Security Health Analytics Custom Module get effective succeeded/
    );
    assert.notMatch(output, /undefined/);
    done();
  });
});
