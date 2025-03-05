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
const regionalParameterId = `test-regional-${uuidv4()}`;
const parameterVersionId = 'v1';

let regionalParameter;
let regionalParameterVersion;
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
    const output = execSync(
      `node regional_samples/createRegionalParamVersionWithSecret.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}2 ${regionalSecretVersion.name}`
    );
    assert.include(
      output,
      `Created regional parameter version with secret: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}/versions/${parameterVersionId}2`
    );
  });

  it('should create a regional structured parameter', async () => {
    const output = execSync(
      `node regional_samples/createStructuredRegionalParam.js ${projectId} ${locationId} ${regionalParameterId}-2`
    );
    regionalParametersToDelete.push(
      client.parameterPath(projectId, locationId, `${regionalParameterId}-2`)
    );
    assert.include(
      output,
      `Created regional parameter projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-2 with format JSON`
    );
  });

  it('should create a regional unstructured parameter', async () => {
    const output = execSync(
      `node regional_samples/createRegionalParam.js ${projectId} ${locationId} ${regionalParameterId}-3`
    );
    regionalParametersToDelete.push(
      client.parameterPath(projectId, locationId, `${regionalParameterId}-3`)
    );
    assert.include(
      output,
      `Created regional parameter: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-3`
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

  it('should create a regional unstructured parameter version', async () => {
    const output = execSync(
      `node regional_samples/createRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId}-3 ${parameterVersionId}`
    );
    assert.include(
      output,
      `Created regional parameter version: projects/${projectId}/locations/${locationId}/parameters/${regionalParameterId}-3/versions/${parameterVersionId}`
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

  it('should get a regional parameter', async () => {
    const output = execSync(
      `node regional_samples/getRegionalParam.js ${projectId} ${locationId} ${regionalParameterId}`
    );
    assert.include(
      output,
      `Found regional parameter ${regionalParameter.name} with format ${regionalParameter.format}`
    );
  });

  it('should list regional parameter versions', async () => {
    const output = execSync(
      `node regional_samples/listRegionalParamVersions.js ${projectId} ${locationId} ${regionalParameterId}`
    );
    assert.include(
      output,
      `Found regional parameter version ${regionalParameterVersion.name} with state enabled`
    );
    assert.include(
      output,
      `Found regional parameter version ${regionalParameterVersion.name}2 with state enabled`
    );
  });

  it('should get a regional parameter version', async () => {
    let output = execSync(
      `node regional_samples/getRegionalParamVersion.js ${projectId} ${locationId} ${regionalParameterId} ${parameterVersionId}`
    );
    assert.include(
      output,
      `Found regional parameter version ${regionalParameterVersion.name} with state enabled`
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
});
