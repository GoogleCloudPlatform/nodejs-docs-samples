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
const {v4: uuidv4} = require('uuid');

const {ParameterManagerClient} = require('@google-cloud/parametermanager');
const client = new ParameterManagerClient();

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const options = {};
options.apiEndpoint = `parametermanager.${locationId}.rep.googleapis.com`;

const regionalClient = new ParameterManagerClient(options);

const parameterId = `test-parameter-${uuidv4()}`;
const regionalParameterId = `test-regional-${uuidv4()}`;
const parameterVersionId = 'v1';

let parameter;
let regionalParameter;

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
    parametersToDelete.push(parameter.name);

    // Create a test regional parameter
    [regionalParameter] = await regionalClient.createParameter({
      parent: `projects/${projectId}/locations/${locationId}`,
      parameterId: regionalParameterId,
      parameter: {
        format: 'JSON',
      },
    });
    regionalParametersToDelete.push(regionalParameter.name);

    // Create a version for the global parameter
    await client.createParameterVersion({
      parent: parameter.name,
      parameterVersionId: parameterVersionId,
      parameterVersion: {
        payload: {
          data: Buffer.from(JSON.stringify({key: 'global_value'}), 'utf-8'),
        },
      },
    });

    // Create a version for the regional parameter
    await regionalClient.createParameterVersion({
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
    const sample = require('../quickstart');
    const parameterVersion = await sample.main(
      projectId,
      parameterId + '-quickstart',
      parameterVersionId
    );
    parametersToDelete.push(
      `projects/${projectId}/locations/global/parameters/${parameterId}-quickstart`
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}-quickstart/versions/${parameterVersionId}`
    );
  });

  it('should runs the regional quickstart', async () => {
    const sample = require('../regional_samples/regionalQuickstart');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId + '-quickstart',
      parameterVersionId
    );
    regionalParametersToDelete.push(
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-quickstart`
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-quickstart/versions/${parameterVersionId}`
    );
  });

  it('should disable a parameter version', async () => {
    const sample = require('../disableParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      parameterId,
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}/versions/${parameterVersionId}`
    );
  });

  it('should disable a regional parameter version', async () => {
    const sample = require('../regional_samples/disableRegionalParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId,
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}/versions/${parameterVersionId}`
    );
  });

  it('should enable a parameter version', async () => {
    const sample = require('../enableParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      parameterId,
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}/versions/${parameterVersionId}`
    );
  });

  it('should enable a regional parameter version', async () => {
    const sample = require('../regional_samples/enableRegionalParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId,
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}/versions/${parameterVersionId}`
    );
  });

  it('should delete a parameter version', async () => {
    const sample = require('../deleteParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      parameterId,
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion,
      `projects/${projectId}/locations/global/parameters/${parameterId}/versions/${parameterVersionId}`
    );
  });

  it('should delete a regional parameter version', async () => {
    const sample = require('../regional_samples/deleteRegionalParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId,
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}/versions/${parameterVersionId}`
    );
  });

  it('should delete a parameter', async () => {
    const sample = require('../deleteParam');
    const parameterVersion = await sample.main(projectId, parameterId);
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion,
      `projects/${projectId}/locations/global/parameters/${parameterId}`
    );
  });

  it('should delete a regional parameter', async () => {
    const sample = require('../regional_samples/deleteRegionalParam');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}`
    );
  });
});
