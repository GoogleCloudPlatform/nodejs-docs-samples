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
const parameterVersionId = `test-version-${uuidv4()}`;

let parameter;
let regionalParameter;
let parameterVersion;
let regionalParameterVersion;

describe('Parameter Manager samples', () => {
  const parametersToDelete = [];
  const regionalParametersToDelete = [];
  const regionalParameterVersionsToDelete = [];
  const parameterVersionsToDelete = [];

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
    [parameterVersion] = await client.createParameterVersion({
      parent: parameter.name,
      parameterVersionId: parameterVersionId,
      parameterVersion: {
        payload: {
          data: Buffer.from(JSON.stringify({key: 'global_value'}), 'utf-8'),
        },
      },
    });
    parameterVersionsToDelete.push(parameterVersion.name);

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
    regionalParameterVersionsToDelete.push(regionalParameterVersion.name);
  });

  after(async () => {
    // Delete all parameter versions first
    await Promise.all(
      regionalParameterVersionsToDelete.map(
        async regionalParameterVersionName => {
          try {
            await regionalClient.deleteParameterVersion({
              name: regionalParameterVersionName,
            });
          } catch (err) {
            if (!err.message.includes('NOT_FOUND')) {
              throw err;
            }
          }
        }
      )
    );

    await Promise.all(
      parameterVersionsToDelete.map(async parameterVersionName => {
        try {
          await client.deleteParameterVersion({
            name: parameterVersionName,
          });
        } catch (err) {
          if (!err.message.includes('NOT_FOUND')) {
            throw err;
          }
        }
      })
    );

    // Delete all parameters
    await Promise.all(
      parametersToDelete.map(async parameterName => {
        try {
          await client.deleteParameter({
            name: parameterName,
          });
        } catch (err) {
          if (!err.message.includes('NOT_FOUND')) {
            throw err;
          }
        }
      })
    );

    await Promise.all(
      regionalParametersToDelete.map(async regionalParameterName => {
        try {
          await regionalClient.deleteParameter({name: regionalParameterName});
        } catch (err) {
          if (!err.message.includes('NOT_FOUND')) {
            throw err;
          }
        }
      })
    );
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
    parameterVersionsToDelete.push(parameterVersion.name);
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
    regionalParameterVersionsToDelete.push(parameterVersion.name);
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
