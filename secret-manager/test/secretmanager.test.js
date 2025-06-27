// Copyright 2019 Google LLC
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
const {v4} = require('uuid');

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const secretId = v4();
const payload = 'my super secret data';
const iamUser = 'user:sethvargo@google.com';
const labelKey = 'secretmanager';
const labelValue = 'rocks';
const labelKeyUpdated = 'gcp';
const labelValueUpdated = 'rock';
const annotationKey = 'annotationkey';
const annotationValue = 'annotationvalue';
const annotationKeyUpdated = 'updatedannotationekey';
const annotationValueUpdated = 'updatedannotationvalue';

let secret;
let regionalSecret;
let version;
let regionalVersion;

const options = {};
options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

// Instantiates a client
const regionalClient = new SecretManagerServiceClient(options);

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Secret Manager samples', () => {
  before(async () => {
    projectId = await client.getProjectId();

    [secret] = await client.createSecret({
      parent: `projects/${projectId}`,
      secretId: secretId,
      secret: {
        replication: {
          automatic: {},
        },
        labels: {
          [labelKey]: labelValue,
        },
        annotations: {
          [annotationKey]: annotationValue,
        },
      },
    });

    [regionalSecret] = await regionalClient.createSecret({
      parent: `projects/${projectId}/locations/${locationId}`,
      secretId: secretId,
      secret: {
        labels: {
          [labelKey]: labelValue,
        },
        annotations: {
          [annotationKey]: annotationValue,
        },
      },
    });

    [version] = await client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(payload),
      },
    });

    [regionalVersion] = await regionalClient.addSecretVersion({
      parent: regionalSecret.name,
      payload: {
        data: Buffer.from(payload),
      },
    });

    await regionalClient.createSecret({
      parent: `projects/${projectId}/locations/${locationId}`,
      secretId: `${secretId}-3`,
    });
  });

  after(async () => {
    try {
      await client.deleteSecret({
        name: secret.name,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: regionalSecret.name,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-quickstart`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-quickstart`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-2`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-2`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-3`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-4`,
      });

      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-3`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-6`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-4`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-5`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-6`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }
  });

  it('runs the quickstart', async () => {
    const stdout = execSync(
      `node quickstart.js projects/${projectId} ${secretId}-quickstart bar`
    );
    assert.match(stdout, new RegExp('Created secret'));
    assert.match(stdout, new RegExp('Added secret version'));
    assert.match(stdout, new RegExp('Payload: bar'));
  });

  it('runs the regional quickstart', async () => {
    const stdout = execSync(
      `node regional_samples/regionalQuickstart.js ${projectId} ${locationId} ${secretId}-quickstart bar`
    );
    assert.match(stdout, new RegExp('Created regional secret'));
    assert.match(stdout, new RegExp('Added regional secret version'));
    assert.match(stdout, new RegExp('Payload: bar'));
  });

  it('creates a secret with TTL', async () => {
    const ttl = '900s';
    const output = execSync(
      `node createSecret.js projects/${projectId} ${secretId}-2 ${ttl}`
    );
    assert.match(output, new RegExp('Created secret'));
    assert.match(output, new RegExp(`Secret TTL set to ${ttl}`));
  });

  it('creates a secret without TTL', async () => {
    const output = execSync(
      `node createSecret.js projects/${projectId} ${secretId}-7`
    );
    assert.match(output, new RegExp('Created secret'));
    assert.notMatch(output, new RegExp('Secret TTL set to'));
  });

  it('creates a regional secret', async () => {
    const output = execSync(
      `node regional_samples/createRegionalSecret.js ${projectId} ${locationId} ${secretId}-2`
    );
    assert.match(output, new RegExp('Created regional secret'));
  });

  it('creates a secret with userManaged replication', async () => {
    const output = execSync(
      `node createUmmrSecret.js projects/${projectId} ${secretId}-3 us-east1 us-east4`
    );
    assert.match(output, new RegExp('Created secret'));
  });

  it('creates a secret with labels', async () => {
    const output = execSync(
      `node createSecretWithLabels.js projects/${projectId} ${secretId}-4 ${labelKey} ${labelValue}`
    );
    assert.match(output, new RegExp('Created secret'));
  });

  it('creates a regional secret with labels', async () => {
    const output = execSync(
      `node regional_samples/createRegionalSecretWithLabels.js ${projectId} ${locationId} ${secretId}-5 ${labelKey} ${labelValue}`
    );
    assert.match(output, new RegExp('Created secret'));
  });

  it('creates a secret with annotations', async () => {
    const output = execSync(
      `node createSecretWithAnnotations.js projects/${projectId} ${secretId}-6 ${annotationKey} ${annotationValue}`
    );
    assert.match(output, new RegExp('Created secret'));
  });

  it('creates a regional secret with annotations', async () => {
    const output = execSync(
      `node regional_samples/createRegionalSecretWithAnnotations.js ${projectId} ${locationId} ${secretId}-6 ${annotationKey} ${annotationValue}`
    );
    assert.match(output, new RegExp('Created secret'));
  });

  it('lists secrets', async () => {
    const output = execSync(`node listSecrets.js projects/${projectId}`);
    assert.match(output, new RegExp(`${secret.name}`));
  });

  it('lists regional secrets', async () => {
    const output = execSync(
      `node regional_samples/listRegionalSecrets.js ${projectId} ${locationId}`
    );
    assert.match(output, new RegExp(`${regionalSecret.name}`));
  });

  it('gets metadata about a secret', async () => {
    const output = execSync(`node getSecret.js ${projectId} ${secretId}`);
    assert.match(output, new RegExp(`Found secret ${secret.name}`));
  });

  it('view a secret labels', async () => {
    const output = execSync(`node viewSecretLabels.js ${secret.name}`);
    assert.match(output, new RegExp(`${labelKey}`));
  });

  it('view a regional secret labels', async () => {
    const output = execSync(
      `node regional_samples/viewRegionalSecretLabels.js ${projectId} ${locationId} ${secretId}`
    );

    assert.match(output, new RegExp(`${labelKey}`));
  });

  it('view a secret annotations', async () => {
    const output = execSync(`node viewSecretAnnotations.js ${secret.name}`);
    assert.match(output, new RegExp(`${annotationKey}`));
  });

  it('view a regional secret annotations', async () => {
    const output = execSync(
      `node regional_samples/viewRegionalSecretAnnotations.js ${projectId} ${locationId} ${secretId}`
    );

    assert.match(output, new RegExp(`${annotationKey}`));
  });

  it('gets a regional secret', async () => {
    const output = execSync(
      `node regional_samples/getRegionalSecret.js ${projectId} ${locationId} ${secretId}`
    );
    assert.match(output, new RegExp(`Found secret ${regionalSecret.name}`));
  });

  it('updates a secret', async () => {
    const output = execSync(`node updateSecret.js ${secret.name}`);
    assert.match(output, new RegExp(`Updated secret ${secret.name}`));
  });

  it('updates a regional secret', async () => {
    const output = execSync(
      `node regional_samples/updateRegionalSecret.js ${projectId} ${locationId} ${secretId}`
    );
    assert.match(output, new RegExp(`Updated secret ${regionalSecret.name}`));
  });

  it('updates a secret with an alias', async () => {
    const output = execSync(`node updateSecretWithAlias.js ${secret.name}`);
    assert.match(output, new RegExp(`Updated secret ${secret.name}`));
  });

  it('create or updates a secret labels', async () => {
    const output = execSync(
      `node createUpdateSecretLabel.js ${secret.name} ${labelKeyUpdated} ${labelValueUpdated}`
    );
    assert.match(output, new RegExp(`Updated secret ${secret.name}`));
  });

  it('create or updates a regional secret labels', async () => {
    const output = execSync(
      `node regional_samples/editRegionalSecretLabel.js ${projectId} ${locationId} ${secretId} ${labelKeyUpdated} ${labelValueUpdated}`
    );
    assert.match(output, new RegExp(`Updated secret ${regionalSecret.name}`));
  });

  it('edits a secret annotation', async () => {
    const output = execSync(
      `node editSecretAnnotations.js ${secret.name} ${annotationKeyUpdated} ${annotationValueUpdated}`
    );
    assert.match(output, new RegExp(`Updated secret ${secret.name}`));
  });

  it('updates a regional secret with an alias', async () => {
    const output = execSync(
      `node regional_samples/updateRegionalSecretWithAlias.js ${projectId} ${locationId} ${secretId}`
    );
    assert.match(output, new RegExp(`Updated secret ${regionalSecret.name}`));
  });

  it('edits a regional secret annotations', async () => {
    const output = execSync(
      `node regional_samples/editRegionalSecretAnnotations.js ${projectId} ${locationId} ${secretId} ${annotationKeyUpdated} ${annotationValueUpdated}`
    );
    assert.match(output, new RegExp(`Updated secret ${regionalSecret.name}`));
  });

  it('deletes a secret', async () => {
    const output = execSync(
      `node deleteSecret.js projects/${projectId}/secrets/${secretId}-2`
    );
    assert.match(output, new RegExp('Deleted secret'));
  });

  it('deletes a secret label', async () => {
    const output = execSync(
      `node deleteSecretLabel.js ${secret.name} ${labelKey}`
    );
    assert.match(output, new RegExp(`Updated secret ${secret.name}`));
  });

  it('deletes a regional secret label', async () => {
    const output = execSync(
      `node regional_samples/deleteRegionalSecretLabel.js ${projectId} ${locationId} ${secretId} ${labelKey}`
    );
    assert.match(output, new RegExp(`Updated secret ${regionalSecret.name}`));
  });

  it('deletes a regional secret', async () => {
    const output = execSync(
      `node regional_samples/deleteRegionalSecret.js ${projectId} ${locationId} ${secretId}-3`
    );
    assert.match(output, new RegExp('Deleted regional secret'));
  });

  it('accesses secret versions', async () => {
    const output = execSync(`node accessSecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(payload));
  });

  it('accesses regional secret versions', async () => {
    const output = execSync(
      `node regional_samples/accessRegionalSecretVersion.js ${projectId} ${locationId} ${secretId} 1`
    );
    assert.match(output, new RegExp(payload));
  });

  it('adds secret versions', async () => {
    const output = execSync(`node addSecretVersion.js ${secret.name}`);
    assert.match(output, new RegExp('Added secret version'));
  });

  it('adds regional secret versions', async () => {
    const output = execSync(
      `node regional_samples/addRegionalSecretVersion.js ${projectId} ${locationId} ${secretId}`
    );
    assert.match(output, new RegExp('Added regional secret version'));
  });

  it('list secret versions', async () => {
    const output = execSync(`node listSecretVersions.js ${secret.name}`);
    assert.match(output, new RegExp(`${version.name}`));
  });

  it('list regional secret versions', async () => {
    const output = execSync(
      `node regional_samples/listRegionalSecretVersions.js ${projectId} ${locationId} ${secretId}`
    );
    assert.match(output, new RegExp(`${regionalVersion.name}`));
  });

  it('gets secret versions', async () => {
    const output = execSync(`node iamGrantAccess.js ${secret.name} ${iamUser}`);
    assert.match(output, new RegExp('Updated IAM policy'));
  });

  it('grants access to regional secret', async () => {
    const output = execSync(
      `node regional_samples/iamGrantAccessWithRegionalSecret.js ${projectId} ${locationId} ${secretId} ${iamUser}`
    );
    assert.match(output, new RegExp('Updated IAM policy'));
  });

  it('revokes access permissions', async () => {
    const output = execSync(
      `node iamRevokeAccess.js ${secret.name} ${iamUser}`
    );
    assert.match(output, new RegExp('Updated IAM policy'));
  });

  it('revokes access permissions for regional secret', async () => {
    const output = execSync(
      `node regional_samples/iamRevokeAccessWithRegionalSecret.js ${projectId} ${locationId} ${secretId} ${iamUser}`
    );
    assert.match(output, new RegExp('Updated IAM policy'));
  });

  it('grants access permissions', async () => {
    const output = execSync(`node getSecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(`Found secret ${version.name}`));
  });

  it('gets regional secret version', async () => {
    const output = execSync(
      `node regional_samples/getRegionalSecretVersion.js ${projectId} ${locationId} ${secretId} 1`
    );
    assert.match(output, new RegExp(`Found secret ${regionalVersion.name}`));
  });

  it('disables secret versions', async () => {
    const output = execSync(`node disableSecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(`Disabled ${version.name}`));
  });

  it('disables regional secret versions', async () => {
    const output = execSync(
      `node regional_samples/disableRegionalSecretVersion.js ${projectId} ${locationId} ${secretId} 1`
    );
    assert.match(output, new RegExp(`Disabled ${regionalVersion.name}`));
  });

  it('enables secret versions', async () => {
    const output = execSync(`node enableSecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(`Enabled ${version.name}`));
  });

  it('enables regional secret versions', async () => {
    const output = execSync(
      `node regional_samples/enableRegionalSecretVersion.js ${projectId} ${locationId} ${secretId} 1`
    );
    assert.match(output, new RegExp(`Enabled ${regionalVersion.name}`));
  });

  it('destroys secret versions', async () => {
    const output = execSync(`node destroySecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(`Destroyed ${version.name}`));
  });

  it('destroys regional secret versions', async () => {
    const output = execSync(
      `node regional_samples/destroyRegionalSecretVersion.js ${projectId} ${locationId} ${secretId} 1`
    );
    assert.match(output, new RegExp(`Destroyed ${regionalVersion.name}`));
  });
});
