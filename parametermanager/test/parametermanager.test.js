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

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const options = {};
options.apiEndpoint = `parametermanager.${locationId}.rep.googleapis.com`;

const regionalClient = new ParameterManagerClient(options);

const secretOptions = {};
secretOptions.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

const regionalSecretClient = new SecretManagerServiceClient(secretOptions);

const secretId = `test-secret-${uuidv4()}`;
const regionalParameterId = `test-regional-${uuidv4()}`;
const parameterVersionId = 'v1';

let regionalParameter;
let regionalSecret;
let regionalSecretVersion;

describe('Parameter Manager samples', () => {
  const regionalParametersToDelete = [];

  before(async () => {
    projectId = await client.getProjectId();

    // Create a regional secret
    [regionalSecret] = await regionalSecretClient.createSecret({
      parent: `projects/${projectId}/locations/${locationId}`,
      secretId: secretId,
    });

    // Create a regional secret version
    [regionalSecretVersion] = await regionalSecretClient.addSecretVersion({
      parent: regionalSecret.name,
      payload: {
        data: Buffer.from('my super secret data', 'utf-8'),
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
    regionalParametersToDelete.push(regionalParameter.name);
  });

  after(async () => {
    // Clean up
    regionalParametersToDelete.forEach(async regionalParameterName => {
      await regionalClient.deleteParameterVersion({
        name: `${regionalParameterName}/versions/v1`,
      });
      if (regionalParameterName === regionalParameter.name) {
        await regionalClient.deleteParameterVersion({
          name: `${regionalParameterName}/versions/v12`,
        });
      }
      await regionalClient.deleteParameter({name: regionalParameterName});
    });
    await regionalSecretClient.deleteSecret({
      name: regionalSecret.name,
    });
  });

  it('should create regional parameter version with secret references', async () => {
    const sample = require('../regional_samples/createRegionalParamVersionWithSecret');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId,
      parameterVersionId + '2',
      regionalSecretVersion.name
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}/versions/${parameterVersionId}2`
    );
  });

  it('should create a regional structured parameter', async () => {
    const sample = require('../regional_samples/createStructuredRegionalParam');
    const parameter = await sample.main(
      projectId,
      locationId,
      regionalParameterId + '-2'
    );
    regionalParametersToDelete.push(
      client.parameterPath(projectId, locationId, `${regionalParameterId}-2`)
    );
    assert.exists(parameter);
    assert.equal(
      parameter.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-2`
    );
  });

  it('should create a regional unstructured parameter', async () => {
    const sample = require('../regional_samples/createRegionalParam');
    const parameter = await sample.main(
      projectId,
      locationId,
      regionalParameterId + '-3'
    );
    regionalParametersToDelete.push(
      client.parameterPath(projectId, locationId, `${regionalParameterId}-3`)
    );
    assert.exists(parameter);
    assert.equal(
      parameter.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-3`
    );
  });

  it('should create a regional structured parameter version', async () => {
    const sample = require('../regional_samples/createStructuredRegionalParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId + '-2',
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-2/versions/${parameterVersionId}`
    );
  });

  it('should create a regional unstructured parameter version', async () => {
    const sample = require('../regional_samples/createRegionalParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId + '-3',
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-3/versions/${parameterVersionId}`
    );
  });

  it('should list regional parameters', async () => {
    const sample = require('../regional_samples/listRegionalParams');
    const parameters = await sample.main(projectId, locationId);
    assert.exists(parameters);
  });

  it('should get a regional parameter', async () => {
    const sample = require('../regional_samples/getRegionalParam');
    const parameter = await sample.main(
      projectId,
      locationId,
      regionalParameterId + '-2'
    );
    assert.exists(parameter);
    assert.equal(
      parameter.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-2`
    );
  });

  it('should list regional parameter versions', async () => {
    const sample = require('../regional_samples/listRegionalParamVersions');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId
    );
    assert.exists(parameterVersion);
  });

  it('should get a regional parameter version', async () => {
    const sample = require('../regional_samples/getRegionalParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId,
      parameterVersionId + '2'
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}/versions/${parameterVersionId}2`
    );
  });

  it('should render regional parameter version', async () => {
    // Get the current IAM policy.
    const [policy] = await regionalSecretClient.getIamPolicy({
      resource: regionalSecret.name,
    });

    // Add the user with accessor permissions to the bindings list.
    policy.bindings.push({
      role: 'roles/secretmanager.secretAccessor',
      members: [regionalParameter.policyMember.iamPolicyUidPrincipal],
    });

    // Save the updated IAM policy.
    await regionalSecretClient.setIamPolicy({
      resource: regionalSecret.name,
      policy: policy,
    });

    await new Promise(resolve => setTimeout(resolve, 120000));

    const sample = require('../regional_samples/renderRegionalParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      locationId,
      regionalParameterId,
      parameterVersionId + '2'
    );
    assert.exists(parameterVersion);
  });
});
