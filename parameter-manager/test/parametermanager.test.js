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

const regionalClient = new ParameterManagerClient(options);

const secretOptions = {};
secretOptions.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

const regionalSecretClient = new SecretManagerServiceClient(secretOptions);

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const secretId = `test-secret-${uuidv4()}`;
const parameterId = `test-parameter-${uuidv4()}`;
const regionalParameterId = `test-regional-${uuidv4()}`;
const parameterVersionId = 'v1';

let parameter;
let regionalParameter;
let parameterVersion;
let regionalParameterVersion;
let secret;
let secretVersion;
let regionalSecret;
let regionalSecretVersion;

describe('Parameter Manager samples', () => {
  const parametersToDelete = [];
  const regionalParametersToDelete = [];

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

    // Create a regional secret
    [regionalSecret] = await regionalSecretClient.createSecret({
      parent: `projects/${projectId}/locations/${locationId}`,
      secretId: secretId,
    });

    // Create a secret version
    [secretVersion] = await secretClient.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from('my super secret data', 'utf-8'),
      },
    });

    // Create a regional secret version
    [regionalSecretVersion] = await regionalSecretClient.addSecretVersion({
      parent: regionalSecret.name,
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
    await secretClient.deleteSecret({
      name: secret.name,
    });
    await regionalSecretClient.deleteSecret({
      name: regionalSecret.name,
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

  it('should create parameter version with secret references', async () => {
    const output = execSync(
      `node createParamVersionWithSecret.js ${projectId} ${parameterId} ${parameterVersionId}2 ${secretVersion.name}`
    );
    assert.include(
      output,
      `Created parameter version with secret references: projects/${projectId}/locations/global/parameters/${parameterId}/versions/${parameterVersionId}2`
    );
  });

  it('should create regional parameter version with secret references', async () => {
    const output = execSync(
      `node regional_samples/createRegionalParamVersionWithSecret.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}2 ${regionalSecretVersion.name}`
    );
    assert.include(
      output,
      `Created regional parameter version with secret: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}/versions/${parameterVersionId}2`
    );
  });

  it('should create a structured parameter', async () => {
    const output = execSync(
      `node createStructuredParam.js ${projectId} ${parameterId}-2`
    );
    parametersToDelete.push(`${parameterId}-2`);
    assert.include(
      output,
      `Created parameter projects/${projectId}/locations/global/parameters/${parameterId}-2 with format JSON`
    );
  });

  it('should create a regional structured parameter', async () => {
    const output = execSync(
      `node regional_samples/createStructuredRegionalParam.js ${projectId} ${locationId} ${regionalParameterId}-2`
    );
    regionalParametersToDelete.push(`${regionalParameterId}-2`);
    assert.include(
      output,
      `Created regional parameter projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-2 with format JSON`
    );
  });

  it('should create a unstructured parameter', async () => {
    const output = execSync(
      `node createParam.js ${projectId} ${parameterId}-3`
    );
    parametersToDelete.push(`${parameterId}-3`);
    assert.include(
      output,
      `Created parameter: projects/${projectId}/locations/global/parameters/${parameterId}-3`
    );
  });

  it('should create a regional unstructured parameter', async () => {
    const output = execSync(
      `node regional_samples/createRegionalParam.js ${projectId} ${locationId} ${regionalParameterId}-3`
    );
    regionalParametersToDelete.push(`${regionalParameterId}-3`);
    assert.include(
      output,
      `Created regional parameter: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-3`
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

  it('should create a regional structured parameter version', async () => {
    const output = execSync(
      `node regional_samples/createStructuredRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId}-2 ${parameterVersionId}`
    );
    assert.include(
      output,
      `Created regional parameter version: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-2/versions/${parameterVersionId}`
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

  it('should create a regional unstructured parameter version', async () => {
    const output = execSync(
      `node regional_samples/createRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId}-3 ${parameterVersionId}`
    );
    assert.include(
      output,
      `Created regional parameter version: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-3/versions/${parameterVersionId}`
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

  it('should list regional parameters', async () => {
    const output = execSync(
      `node regional_samples/listRegionalParams.js ${projectId} ${locationId}`
    );
    assert.include(
      output,
      `Found regional parameter ${regionalParameter.name} with format ${regionalParameter.format}`
    );
    assert.include(
      output,
      `Found regional parameter projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-2 with format JSON`
    );
    assert.include(
      output,
      `Found regional parameter projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-3 with format UNFORMATTED`
    );
  });

  it('should get a parameter', async () => {
    const output = execSync(`node getParam.js ${projectId} ${parameterId}`);
    assert.include(
      output,
      `Found parameter ${parameter.name} with format ${parameter.format}`
    );
  });

  it('should get a regional parameter', async () => {
    const output = execSync(
      `node regional_samples/getRegionalParam.js ${projectId} ${locationId} ${regionalParameterId}`
    );
    assert.include(
      output,
      `Found regional parameter ${regionalParameter.name} with format ${regionalParameter.format}`
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

  it('should list parameter versions', async () => {
    const output = execSync(
      `node listParamVersions.js ${projectId} ${parameterId}`
    );
    assert.include(
      output,
      `Found parameter version ${parameterVersion.name} with state disabled`
    );
    assert.include(
      output,
      `Found parameter version ${parameterVersion.name}2 with state enabled`
    );
  });

  it('should list regional parameter versions', async () => {
    const output = execSync(
      `node regional_samples/listRegionalParamVersions.js ${projectId} ${locationId} ${regionalParameterId}`
    );
    assert.include(
      output,
      `Found regional parameter version ${regionalParameterVersion.name} with state disabled`
    );
    assert.include(
      output,
      `Found regional parameter version ${regionalParameterVersion.name}2 with state enabled`
    );
  });

  it('should get a parameter version', async () => {
    let output = execSync(
      `node getParamVersion.js ${projectId} ${parameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Found parameter version ${parameterVersion.name} with state disabled`
    );

    output = execSync(
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

  it('should get a regional parameter version', async () => {
    let output = execSync(
      `node regional_samples/getRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Found regional parameter version ${regionalParameterVersion.name} with state disabled`
    );

    output = execSync(
      `node regional_samples/getRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}2`
    );
    assert.include(
      output,
      `Found regional parameter version ${regionalParameterVersion.name}2 with state enabled`
    );
    assert.include(
      output,
      `Payload: {"db_user":"test_user","db_password":"__REF__(\\"//secretmanager.googleapis.com/${regionalSecretVersion.name}\\")"}`
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

    const output = execSync(
      `node regional_samples/renderRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}2`
    );
    assert.include(output, 'Rendered regional parameter version:');
    assert.include(
      output,
      `/parameters/${regionalParameterId}/versions/${parameterVersionId}2`
    );
    assert.include(output, 'Rendered payload:');
    assert.include(
      output,
      '{"db_user":"test_user","db_password":"my super secret data"}'
    );
  });

  it('should delete a parameter version', async () => {
    let output = execSync(
      `node deleteParamVersion.js ${projectId} ${parameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Deleted parameter version: ${parameterVersion.name}`
    );
    output = execSync(
      `node deleteParamVersion.js ${projectId} ${parameterId} ${parameterVersionId}2`
    );
    assert.include(
      output,
      `Deleted parameter version: ${parameterVersion.name}2`
    );
  });

  it('should delete a regional parameter version', async () => {
    let output = execSync(
      `node regional_samples/deleteRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Deleted regional parameter version: ${regionalParameterVersion.name}`
    );

    output = execSync(
      `node regional_samples/deleteRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}2`
    );
    assert.include(
      output,
      `Deleted regional parameter version: ${regionalParameterVersion.name}2`
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
