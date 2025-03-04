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

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const secretClient = new SecretManagerServiceClient();

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const options = {};
options.apiEndpoint = `parametermanager.${locationId}.rep.googleapis.com`;

const secretOptions = {};
secretOptions.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const secretId = `test-secret-${uuidv4()}`;
const parameterId = `test-parameter-${uuidv4()}`;
const parameterVersionId = 'v1';

let parameter;
let parameterVersion;
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
    const output = execSync(
      `node createParamVersionWithSecret.js ${projectId} ${parameterId} ${parameterVersionId}2 ${secretVersion.name}`
    );
    assert.include(
      output,
      `Created parameter version with secret references: projects/${projectId}/locations/global/parameters/${parameterId}/versions/${parameterVersionId}2`
    );
  });

  it('should create a structured parameter', async () => {
    const output = execSync(
      `node createStructuredParam.js ${projectId} ${parameterId}-2`
    );
    parametersToDelete.push(
      client.parameterPath(projectId, 'global', `${parameterId}-2`)
    );
    assert.include(
      output,
      `Created parameter projects/${projectId}/locations/global/parameters/${parameterId}-2 with format JSON`
    );
  });

  it('should create a unstructured parameter', async () => {
    const output = execSync(
      `node createParam.js ${projectId} ${parameterId}-3`
    );
    parametersToDelete.push(
      client.parameterPath(projectId, 'global', `${parameterId}-3`)
    );
    assert.include(
      output,
      `Created parameter: projects/${projectId}/locations/global/parameters/${parameterId}-3`
    );
  });

  it('should create a structured parameter version', async () => {
    const output = execSync(
      `node createStructuredParamVersion.js ${projectId} ${parameterId}-2 ${parameterVersionId}`
    );
    assert.include(
      output,
      `Created parameter version: projects/${projectId}/locations/global/parameters/${parameterId}-2/versions/${parameterVersionId}`
    );
  });

  it('should create a unstructured parameter version', async () => {
    const output = execSync(
      `node createParamVersion.js ${projectId} ${parameterId}-3 ${parameterVersionId}`
    );
    assert.include(
      output,
      `Created parameter version: projects/${projectId}/locations/global/parameters/${parameterId}-3/versions/${parameterVersionId}`
    );
  });

  it('should list parameters', async () => {
    const output = execSync(`node listParams.js ${projectId}`);
    assert.include(
      output,
      `Found parameter ${parameter.name} with format ${parameter.format}`
    );
    assert.include(
      output,
      `Found parameter projects/${projectId}/locations/global/parameters/${parameterId}-2 with format JSON`
    );
    assert.include(
      output,
      `Found parameter projects/${projectId}/locations/global/parameters/${parameterId}-3 with format UNFORMATTED`
    );
  });

  it('should get a parameter', async () => {
    const output = execSync(`node getParam.js ${projectId} ${parameterId}`);
    assert.include(
      output,
      `Found parameter ${parameter.name} with format ${parameter.format}`
    );
  });

  it('should list parameter versions', async () => {
    const output = execSync(
      `node listParamVersions.js ${projectId} ${parameterId}`
    );
    assert.include(
      output,
      `Found parameter version ${parameterVersion.name} with state enabled`
    );
    assert.include(
      output,
      `Found parameter version ${parameterVersion.name}2 with state enabled`
    );
  });

  it('should get a parameter version', async () => {
    const output = execSync(
      `node getParamVersion.js ${projectId} ${parameterId} ${parameterVersionId}2`
    );
    assert.include(
      output,
      `Found parameter version ${parameterVersion.name}2 with state enabled`
    );
    assert.include(
      output,
      `Payload: {"db_user":"test_user","db_password":"__REF__(//secretmanager.googleapis.com/${secretVersion.name})"}`
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

    await new Promise(resolve => setTimeout(resolve, 120000));

    const output = execSync(
      `node renderParamVersion.js ${projectId} ${parameterId} ${parameterVersionId}2`
    );
    assert.include(output, 'Rendered parameter version:');
    assert.include(
      output,
      `/parameters/${parameterId}/versions/${parameterVersionId}2`
    );
    assert.include(output, 'Rendered payload:');
    assert.include(
      output,
      '{"db_user":"test_user","db_password":"my super secret data"}'
    );
  });
});
