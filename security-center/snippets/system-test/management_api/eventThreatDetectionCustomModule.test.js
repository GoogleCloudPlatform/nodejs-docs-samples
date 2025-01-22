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

const {SecurityCenterManagementClient} =
  require('@google-cloud/securitycentermanagement').v1;
const {assert} = require('chai');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});
const {describe, it, before, after} = require('mocha');
const uuid = require('uuid').v4;

// TODO(developer): update for your own environment
const organizationId = process.env.GCLOUD_ORGANIZATION;
const location = 'global';
const customModuleDisplayName = `node_sample_etd_custom_module_test_${uuid()}`;
// Creates a new client.
const client = new SecurityCenterManagementClient();

// cleanupExistingCustomModules clean up all the existing custom module
async function cleanupExistingCustomModules() {
  const [modules] = await client.listEventThreatDetectionCustomModules({
    parent: `organizations/${organizationId}/locations/${location}`,
  });
  // Iterate over the modules response and delete custom module one by one which start with
  // node_sample_etd_custom_module
  for (const module of modules) {
    try {
      if (module.displayName.startsWith('node_sample_etd_custom_module')) {
        console.log('Deleting custom module: ', module.name);
        // extracts the custom module ID from the full name
        const customModuleId = module.name.split('/')[5];
        await deleteCustomModule(customModuleId);
      }
    } catch (error) {
      console.error('Error deleting EventThreatDetectionCustomModule:', error);
    }
  }
}

// deleteCustomModule method is for deleting the custom module
async function deleteCustomModule(customModuleId) {
  const name = `organizations/${organizationId}/locations/${location}/eventThreatDetectionCustomModules/${customModuleId}`;
  const deleteEventThreatDetectionCustomModuleRequest = {
    name: name,
  };
  await client.deleteEventThreatDetectionCustomModule(
    deleteEventThreatDetectionCustomModuleRequest
  );
}

describe('Event Threat Detection Custom module', async () => {
  let data;
  before(async () => {
    const parent = `organizations/${organizationId}/locations/${location}`;

    // define the metadata and other config parameters severity, description,
    // recommendation and ips below
    const config = {
      fields: {
        metadata: {
          structValue: {
            fields: {
              severity: {stringValue: 'MEDIUM'},
              description: {stringValue: 'add your description here'},
              recommendation: {stringValue: 'add your recommendation'},
            },
          },
        },
        ips: {
          listValue: {
            values: [{stringValue: '0.0.0.0'}],
          },
        },
      },
    };

    // define the Event Threat Detection custom module configuration, update the EnablementState
    // below
    const eventThreatDetectionCustomModule = {
      displayName: customModuleDisplayName,
      enablementState: 'ENABLED',
      type: 'CONFIGURABLE_BAD_IP',
      config: config,
    };

    // Build the request.
    const createEventThreatDetectionCustomModuleRequest = {
      parent: parent,
      eventThreatDetectionCustomModule: eventThreatDetectionCustomModule,
    };

    try {
      const [response] = await client.createEventThreatDetectionCustomModule(
        createEventThreatDetectionCustomModuleRequest
      );
      // extracts the custom module ID from the full name
      const customModuleId = response.name.split('/')[5];
      data = {
        orgId: organizationId,
        customModuleId: customModuleId,
        customModuleName: response.displayName,
      };
      console.log('EventThreatDetectionCustomModule created : %j', response);
    } catch (error) {
      console.error('Error creating EventThreatDetectionCustomModule:', error);
    }
  });

  after(async () => {
    // Perform cleanup after running tests
    await cleanupExistingCustomModules();
  });

  it('should create the event threat detection custom module', done => {
    const output = exec(
      `node management_api/createEventThreatDetectionCustomModule.js ${data.orgId} ${data.customModuleName}`
    );
    assert(output.includes(data.orgId));
    assert(output.includes(data.customModuleName));
    assert.match(output, /EventThreatDetectionCustomModule created/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('should get the event threat detection custom module', done => {
    const output = exec(
      `node management_api/getEventThreatDetectionCustomModule.js ${data.orgId} ${data.customModuleId}`
    );
    assert(output.includes(data.orgId));
    assert(output.includes(data.customModuleId));
    assert.match(output, /Retrieved EventThreatDetectionCustomModule/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('should list all the event threat detection custom module', done => {
    const output = exec(
      `node management_api/listEventThreatDetectionCustomModules.js ${data.orgId}`
    );
    assert(output.includes(data.orgId));
    assert(output.includes(data.customModuleId));
    assert.notMatch(output, /undefined/);
    done();
  });

  it('should update the event threat detection custom module', done => {
    const output = exec(
      `node management_api/updateEventThreatDetectionCustomModule.js ${data.orgId} ${data.customModuleId}`
    );
    assert(output.includes(data.customModuleId));
    assert(output.includes(data.customModuleName));
    assert.match(output, /Updated EventThreatDetectionCustomModule/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('should delete the event threat detection custom module', done => {
    const output = exec(
      `node management_api/deleteEventThreatDetectionCustomModule.js ${data.orgId} ${data.customModuleId}`
    );
    assert.match(
      output,
      /EventThreatDetectionCustomModule deleted successfully/
    );
    assert.notMatch(output, /undefined/);
    done();
  });
});
