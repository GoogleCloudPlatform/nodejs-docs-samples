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

const {assert} = require('chai');
const cp = require('child_process');
const {v4: uuidv4} = require('uuid');

const {ParameterManagerClient} = require('@google-cloud/parametermanager');
const client = new ParameterManagerClient();

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const options = {};
options.apiEndpoint = `parametermanager.${locationId}.rep.googleapis.com`;

const regionalClient = new ParameterManagerClient(options);

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const parameterId = `test-parameter-${uuidv4()}`;
const regionalParameterId = `test-regional-${uuidv4()}`;
const parameterVersionId = 'v1';

let parameter;
let regionalParameter;
let parameterVersion;
let regionalParameterVersion;

describe('Parameter Manager samples', () => {
  const parametersToDelete = [];
  const regionalParametersToDelete = [];

  before(async () => {
    projectId = await client.getProjectId();

    // Create a test global parameter
    [parameter] = await client.createParameter({
      parent: `projects/${projectId}/locations/global`,
      parameterId: parameterId,
      parameter: {
        format: 'JSON',
      },
    });

    // Create a test regional parameter
    [regionalParameter] = await regionalClient.createParameter({
      parent: `projects/${projectId}/locations/${locationId}`,
      parameterId: regionalParameterId,
      parameter: {
        format: 'JSON',
      },
    });

    // Create a version for the global parameter
    [parameterVersion] = await client.createParameterVersion({
      parent: parameter.name,
      parameterVersionId: parameterVersionId,
      parameterVersion: {
        payload: {
          data: Buffer.from(JSON.stringify({key: 'global_value'}), 'utf-8'),
        },
      },
    });

    // Create a version for the regional parameter
    [regionalParameterVersion] = await regionalClient.createParameterVersion({
      parent: regionalParameter.name,
      parameterVersionId: parameterVersionId,
      parameterVersion: {
        payload: {
          data: Buffer.from(JSON.stringify({key: 'regional_value'}), 'utf-8'),
        },
      },
    });
  });

  after(async () => {
    // Clean up
    parametersToDelete.forEach(async parameterName => {
      await client.deleteParameterVersion({
        name: `${parameterName}/versions/v1`,
      });
      await client.deleteParameter({name: parameterName});
    });
    regionalParametersToDelete.forEach(async regionalParameterName => {
      await regionalClient.deleteParameterVersion({
        name: `${regionalParameterName}/versions/v1`,
      });
      await regionalClient.deleteParameter({name: regionalParameterName});
    });
  });

  it('should runs the quickstart', async () => {
    const output = execSync(
      `node quickstart.js ${projectId} ${parameterId}-quickstart ${parameterVersionId}`
    );
    parametersToDelete.push(`${parameterId}-quickstart`);
    assert.include(
      output,
      `Created parameter projects/${projectId}/locations/global/parameters/${parameterId}-quickstart with format JSON`
    );
    assert.include(
      output,
      `Created parameter version: projects/${projectId}/locations/global/parameters/${parameterId}-quickstart/versions/v1`
    );
    assert.include(
      output,
      `Retrieved parameter version: projects/${projectId}/locations/global/parameters/${parameterId}-quickstart/versions/v1`
    );
    assert.include(
      output,
      'Payload: {"username":"test-user","host":"localhost"}'
    );
  });

  it('should runs the regional quickstart', async () => {
    const output = execSync(
      `node regional_samples/regionalQuickstart.js ${projectId} ${locationId} ${regionalParameterId}-quickstart ${parameterVersionId}`
    );
    regionalParametersToDelete.push(`${regionalParameterId}-quickstart`);
    assert.include(
      output,
      `Created regional parameter projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-quickstart with format JSON`
    );
    assert.include(
      output,
      `Created regional parameter version: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-quickstart/versions/v1`
    );
    assert.include(
      output,
      `Retrieved regional parameter version: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-quickstart/versions/v1`
    );
    assert.include(
      output,
      'Payload: {"username":"test-user","host":"localhost"}'
    );
  });

  it('should disable a parameter version', async () => {
    const output = execSync(
      `node disableParamVersion.js ${projectId} ${parameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Disabled parameter version ${parameterVersion.name} for parameter ${parameterId}`
    );
  });

  it('should disable a regional parameter version', async () => {
    const output = execSync(
      `node regional_samples/disableRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Disabled regional parameter version ${regionalParameterVersion.name} for parameter ${regionalParameterId}`
    );
  });

  it('should enable a parameter version', async () => {
    const output = execSync(
      `node enableParamVersion.js ${projectId} ${parameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Enabled parameter version ${parameterVersion.name} for parameter ${parameterId}`
    );
  });

  it('should enable a regional parameter version', async () => {
    const output = execSync(
      `node regional_samples/enableRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Enabled regional parameter version ${regionalParameterVersion.name} for parameter ${regionalParameterId}`
    );
  });

  it('should delete a parameter version', async () => {
    const output = execSync(
      `node deleteParamVersion.js ${projectId} ${parameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Deleted parameter version: ${parameterVersion.name}`
    );
  });

  it('should delete a regional parameter version', async () => {
    const output = execSync(
      `node regional_samples/deleteRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Deleted regional parameter version: ${regionalParameterVersion.name}`
    );
  });

  it('should delete a parameter', async () => {
    const output = execSync(`node deleteParam.js ${projectId} ${parameterId}`);
    assert.include(output, `Deleted parameter: ${parameter.name}`);
  });

  it('should delete a regional parameter', async () => {
    const output = execSync(
      `node regional_samples/deleteRegionalParam.js ${projectId} ${locationId} ${regionalParameterId}`
    );
    assert.include(
      output,
      `Deleted regional parameter: ${regionalParameter.name}`
    );
  });
});
