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
const secretClient = new SecretManagerServiceClient();

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const options = {};
options.apiEndpoint = `parametermanager.${locationId}.rep.googleapis.com`;

const secretOptions = {};
secretOptions.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

const secretId = `test-secret-${uuidv4()}`;
const parameterId = `test-parameter-${uuidv4()}`;
const parameterVersionId = 'v1';

let parameter;
let secret;
let secretVersion;

describe('Parameter Manager samples', () => {
  const parametersToDelete = [];

  before(async () => {
    projectId = await client.getProjectId();

    // Create a secret
    [secret] = await secretClient.createSecret({
      parent: `projects/${projectId}`,
      secretId: secretId,
      secret: {
        replication: {
          automatic: {},
        },
      },
    });

    // Create a secret version
    [secretVersion] = await secretClient.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from('my super secret data', 'utf-8'),
      },
    });

    // Create a test global parameter
    [parameter] = await client.createParameter({
      parent: `projects/${projectId}/locations/global`,
      parameterId: parameterId,
      parameter: {
        format: 'JSON',
      },
    });
    parametersToDelete.push(parameter.name);
  });

  after(async () => {
    // Clean up
    parametersToDelete.forEach(async parameterName => {
      await client.deleteParameterVersion({
        name: `${parameterName}/versions/v1`,
      });
      if (parameterName === parameter.name) {
        await client.deleteParameterVersion({
          name: `${parameterName}/versions/v12`,
        });
      }
      await client.deleteParameter({name: parameterName});
    });
    await secretClient.deleteSecret({
      name: secret.name,
    });
  });

  it('should create parameter version with secret references', async () => {
    const sample = require('../createParamVersionWithSecret');
    const parameterVersion = await sample.main(
      projectId,
      parameterId,
      parameterVersionId + '2',
      secretVersion.name
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}/versions/${parameterVersionId}2`
    );
  });

  it('should create a structured parameter', async () => {
    const sample = require('../createStructuredParam');
    const parameter = await sample.main(projectId, parameterId + '-2');
    parametersToDelete.push(
      client.parameterPath(projectId, 'global', `${parameterId}-2`)
    );
    assert.exists(parameter);
    assert.equal(
      parameter.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}-2`
    );
  });

  it('should create a unstructured parameter', async () => {
    const sample = require('../createParam');
    const parameter = await sample.main(projectId, parameterId + '-3');
    parametersToDelete.push(
      client.parameterPath(projectId, 'global', `${parameterId}-3`)
    );
    assert.exists(parameter);
    assert.equal(
      parameter.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}-3`
    );
  });

  it('should create a structured parameter version', async () => {
    const sample = require('../createStructuredParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      parameterId + '-2',
      parameterVersionId
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}-2/versions/${parameterVersionId}`
    );
  });

  it('should create a unstructured parameter version', async () => {
    const sample = require('../createParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      parameterId + '-3',
      parameterVersionId
    );
    assert.exists(parameterVersion);
  });

  it('should list parameters', async () => {
    const sample = require('../listParams');
    const parameters = await sample.main(projectId);
    assert.exists(parameters);
  });

  it('should get a parameter', async () => {
    const sample = require('../getParam');
    const parameter = await sample.main(projectId, parameterId);
    assert.exists(parameter);
    assert.equal(
      parameter.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}`
    );
  });

  it('should list parameter versions', async () => {
    const sample = require('../listParamVersions');
    const parameterVersions = await sample.main(projectId, parameterId);
    assert.exists(parameterVersions);
  });

  it('should get a parameter version', async () => {
    const sample = require('../getParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      parameterId,
      parameterVersionId + '2'
    );
    assert.exists(parameterVersion);
    assert.equal(
      parameterVersion.name,
      `projects/${projectId}/locations/global/parameters/${parameterId}/versions/${parameterVersionId}2`
    );
  });

  it('should render parameter version', async () => {
    // Get the current IAM policy.
    const [policy] = await secretClient.getIamPolicy({
      resource: secret.name,
    });

    // Add the user with accessor permissions to the bindings list.
    policy.bindings.push({
      role: 'roles/secretmanager.secretAccessor',
      members: [parameter.policyMember.iamPolicyUidPrincipal],
    });

    // Save the updated IAM policy.
    await secretClient.setIamPolicy({
      resource: secret.name,
      policy: policy,
    });

    const sample = require('../renderParamVersion');
    const parameterVersion = await sample.main(
      projectId,
      parameterId,
      parameterVersionId + '2'
    );
    assert.exists(parameterVersion);
  });
});
