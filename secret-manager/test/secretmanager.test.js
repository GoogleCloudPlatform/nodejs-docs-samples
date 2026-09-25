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
const {TagKeysClient} = require('@google-cloud/resource-manager').v3;
const {TagValuesClient} = require('@google-cloud/resource-manager').v3;
const {ProjectsClient} = require('@google-cloud/resource-manager').v3;
const client = new SecretManagerServiceClient();
const resourcemanagerTagKeyClient = new TagKeysClient();
const resourcemanagerTagValueClient = new TagValuesClient();
const resourcemanagerProjectsClient = new ProjectsClient();

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

let tagKey;
let tagValue;

const options = {};
options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

// Instantiates a client
const regionalClient = new SecretManagerServiceClient(options);

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

// Role granted to a Cloud SQL DB credentials secret's built-in identity so
// that managed rotation can update the Cloud SQL user's password. This
// grant is per-secret (the member is the secret's own generated
// principal), so it has to be made fresh for the secret the managed
// rotation tests below create.
const CLOUD_SQL_ROLE = 'roles/cloudsql.admin';
const cloudSqlInstanceId = process.env.CLOUD_SQL_INSTANCE;
const cloudSqlUsername = process.env.CLOUD_SQL_USER;
let cloudSqlSecretPrincipal;

// Grants CLOUD_SQL_ROLE to member on the project. setIamPolicy replaces the
// whole policy, so this reads the current policy, adds member to the
// existing (or a new) binding for the role, and writes it back -- retrying
// the whole read-modify-write if another writer raced us (ABORTED, from an
// etag mismatch).
async function grantCloudSqlRole(member) {
  const resource = `projects/${projectId}`;
  for (let attempt = 0; ; attempt++) {
    const [policy] = await resourcemanagerProjectsClient.getIamPolicy({
      resource: resource,
    });
    policy.bindings = policy.bindings || [];
    let binding = policy.bindings.find(b => b.role === CLOUD_SQL_ROLE);
    if (binding) {
      if (!binding.members.includes(member)) {
        binding.members.push(member);
      }
    } else {
      binding = {role: CLOUD_SQL_ROLE, members: [member]};
      policy.bindings.push(binding);
    }

    try {
      await resourcemanagerProjectsClient.setIamPolicy({
        resource: resource,
        policy: policy,
      });
      return;
    } catch (err) {
      if (err.code === 10 && attempt < 5) {
        // ABORTED (etag conflict) -- retry the read-modify-write.
        continue;
      }
      throw err;
    }
  }
}

// Removes member from CLOUD_SQL_ROLE on the project, added by
// grantCloudSqlRole.
async function revokeCloudSqlRole(member) {
  const resource = `projects/${projectId}`;
  for (let attempt = 0; ; attempt++) {
    const [policy] = await resourcemanagerProjectsClient.getIamPolicy({
      resource: resource,
    });
    policy.bindings = policy.bindings || [];
    const binding = policy.bindings.find(b => b.role === CLOUD_SQL_ROLE);
    if (!binding || !binding.members.includes(member)) {
      return;
    }
    binding.members = binding.members.filter(m => m !== member);

    try {
      await resourcemanagerProjectsClient.setIamPolicy({
        resource: resource,
        policy: policy,
      });
      return;
    } catch (err) {
      if (err.code === 10 && attempt < 5) {
        continue;
      }
      throw err;
    }
  }
}

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

    // Create tag key
    const [keyOperation] = await resourcemanagerTagKeyClient.createTagKey({
      tagKey: {
        parent: `projects/${projectId}`,
        shortName: v4(),
      },
    });
    const [tagKeyResponse] = await keyOperation.promise();
    tagKey = tagKeyResponse.name;

    // Create tag value
    const [valueOperation] = await resourcemanagerTagValueClient.createTagValue(
      {
        tagValue: {
          parent: tagKey,
          shortName: v4(),
        },
      }
    );
    const [tagValueResponse] = await valueOperation.promise();
    tagValue = tagValueResponse.name;

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
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-7`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }
    try {
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

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-2-dd`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-with-tags`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-with-tags`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-bind-tags`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-bind-tags`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }
    // Wait for 20 seconds before deleting the tag value
    await new Promise(resolve => setTimeout(resolve, 20000));
    const [deleteValueOperation] =
      await resourcemanagerTagValueClient.deleteTagValue({
        name: tagValue,
      });
    try {
      await deleteValueOperation.promise();
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    const [deleteKeyOperation] = await resourcemanagerTagKeyClient.deleteTagKey(
      {
        name: tagKey,
      }
    );
    try {
      await deleteKeyOperation.promise();
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    if (cloudSqlSecretPrincipal) {
      await revokeCloudSqlRole(cloudSqlSecretPrincipal);
    }
    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-8`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-9`,
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

  it('deletes a secret annotation', async () => {
    const output = execSync(
      `node deleteSecretAnnotation.js ${secret.name} ${annotationKey}`
    );
    assert.match(output, new RegExp(`Updated secret ${secret.name}`));
  });

  it('deletes a regional secret annotation', async () => {
    const output = execSync(
      `node regional_samples/deleteRegionalSecretAnnotation.js ${projectId} ${locationId} ${secretId} ${annotationKey}`
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

  it('creates a secret with delayed destroy enabled', async () => {
    const timeToLive = 24 * 60 * 60;
    const output = execSync(
      `node createSecretWithDelayedDestroy.js projects/${projectId} ${secretId}-2 ${timeToLive}`
    );
    assert.match(output, new RegExp('Created secret'));
  });

  it('disables a secret delayed destroy', async () => {
    const customSecretId = `${secretId}-${v4()}`;
    const fullSecretName = `projects/${projectId}/secrets/${customSecretId}`;

    await client.createSecret({
      parent: `projects/${projectId}`,
      secretId: customSecretId,
      secret: {
        replication: {
          automatic: {},
        },
        version_destroy_ttl: {
          seconds: 24 * 60 * 60,
        },
      },
    });

    try {
      const output = execSync(
        `node disableSecretDelayedDestroy.js ${fullSecretName}`
      );
      assert.match(output, new RegExp('Disabled delayed destroy'));
    } finally {
      await client.deleteSecret({
        name: fullSecretName,
      });
    }
  });

  it('updates a secret delayed destroy', async () => {
    const customSecretId = `${secretId}-${v4()}`;
    const fullSecretName = `projects/${projectId}/secrets/${customSecretId}`;
    const updatedTimeToLive = 24 * 60 * 60 * 2;

    await client.createSecret({
      parent: `projects/${projectId}`,
      secretId: customSecretId,
      secret: {
        replication: {
          automatic: {},
        },
        version_destroy_ttl: {
          seconds: 24 * 60 * 60,
        },
      },
    });

    try {
      const output = execSync(
        `node updateSecretWithDelayedDestroy.js ${fullSecretName} ${updatedTimeToLive}`
      );
      assert.match(output, new RegExp('Updated secret'));
    } finally {
      await client.deleteSecret({
        name: fullSecretName,
      });
    }
  });

  it('creates a regional secret with delayed destroy', async () => {
    const timeToLive = 24 * 60 * 60;
    const output = execSync(
      `node regional_samples/createRegionalSecretWithDelayedDestroy.js ${projectId} ${locationId} ${secretId}-2-dd ${timeToLive}`
    );
    assert.match(output, new RegExp('Created regional secret'));
  });

  it('disables a regional secret delayed destroy', async () => {
    const customSecretId = `${secretId}-${v4()}`;
    const fullSecretName = `projects/${projectId}/locations/${locationId}/secrets/${customSecretId}`;

    await regionalClient.createSecret({
      parent: `projects/${projectId}/locations/${locationId}`,
      secretId: customSecretId,
      secret: {
        version_destroy_ttl: {
          seconds: 24 * 60 * 60,
        },
      },
    });

    try {
      const output = execSync(
        `node regional_samples/disableRegionalSecretDelayedDestroy.js ${projectId} ${locationId} ${customSecretId}`
      );
      assert.match(output, new RegExp('Disabled delayed destroy'));
    } finally {
      await regionalClient.deleteSecret({
        name: fullSecretName,
      });
    }
  });

  it('updates a regional secret delayed destroy', async () => {
    const customSecretId = `${secretId}-${v4()}`;
    const fullSecretName = `projects/${projectId}/locations/${locationId}/secrets/${customSecretId}`;

    const updatedTimeToLive = 24 * 60 * 60 * 2;
    await regionalClient.createSecret({
      parent: `projects/${projectId}/locations/${locationId}`,
      secretId: customSecretId,
      secret: {
        version_destroy_ttl: {
          seconds: 24 * 60 * 60,
        },
      },
    });

    try {
      const output = execSync(
        `node regional_samples/updateRegionalSecretWithDelayedDestroy.js ${projectId} ${locationId} ${customSecretId} ${updatedTimeToLive}`
      );
      assert.match(output, new RegExp('Updated regional secret'));
    } finally {
      await regionalClient.deleteSecret({
        name: fullSecretName,
      });
    }
  });

  it('creates secret with tags', async () => {
    const output = cp.execSync(
      `node createSecretWithTags.js ${projectId} ${secretId}-with-tags ${tagKey} ${tagValue}`
    );
    assert.match(output, new RegExp(`Created secret ${secret.name}-with-tags`));
  });

  it('creates regional secret with tags', async () => {
    const output = cp.execSync(
      `node regional_samples/createRegionalSecretWithTags.js ${projectId} ${locationId} ${secretId}-with-tags ${tagKey} ${tagValue}`
    );
    assert.match(
      output,
      new RegExp(`Created secret ${regionalSecret.name}-with-tags`)
    );
  });

  it('bind tags to secret', async () => {
    const output = cp.execSync(
      `node bindTagsToSecret.js ${projectId} ${secretId}-bind-tags ${tagValue}`
    );
    assert.match(output, new RegExp(`Created secret ${secret.name}-bind-tags`));
    assert.match(output, new RegExp('Created Tag Binding'));
  });

  it('bind tags to regional secret', async () => {
    const output = cp.execSync(
      `node regional_samples/bindTagsToRegionalSecret.js ${projectId} ${locationId} ${secretId}-bind-tags ${tagValue}`
    );
    assert.match(
      output,
      new RegExp(`Created secret ${regionalSecret.name}-bind-tags`)
    );
    assert.match(output, new RegExp('Created Tag Binding'));
  });

  it('creates a regional secret with Cloud SQL DB credentials', async () => {
    const output = execSync(
      `node regional_samples/createRegionalSecretWithCloudSqlCredentials.js ${projectId} ${locationId} ${secretId}-8`
    );
    assert.match(output, new RegExp(`Created secret ${regionalSecret.name}-8`));

    const principalMatch = output.match(
      /Grant this identity Cloud SQL IAM permissions to enable rotation: (\S+)/
    );
    assert.ok(
      principalMatch,
      'expected output to contain the identity to grant Cloud SQL IAM permissions to'
    );
    cloudSqlSecretPrincipal = principalMatch[1];

    // enableRegionalSecretManagedRotation needs this secret's own built-in
    // identity granted Cloud SQL IAM permissions first -- there's no
    // broader grant that covers a secret before it exists.
    await grantCloudSqlRole(cloudSqlSecretPrincipal);
    // IAM grants are eventually consistent; give it a moment before the
    // next test tries to use it for managed rotation.
    await new Promise(resolve => setTimeout(resolve, 10000));
  });

  it('enables managed rotation for a regional secret', async () => {
    const output = execSync(
      `node regional_samples/enableRegionalSecretManagedRotation.js ${projectId} ${locationId} ${secretId}-8 ${cloudSqlInstanceId} ${cloudSqlUsername}`
    );
    assert.match(
      output,
      new RegExp('Enabled managed rotation, created secret version:')
    );
  });

  it('rotates a regional secret', async () => {
    const output = execSync(
      `node regional_samples/rotateRegionalSecret.js ${projectId} ${locationId} ${secretId}-8`
    );
    assert.match(output, new RegExp('Rotated secret, created secret version:'));
  });

  it('configures a scheduled rotation for a regional secret', async () => {
    const output = execSync(
      `node regional_samples/updateRegionalSecretWithManagedRotationSchedule.js ${projectId} ${locationId} ${secretId}-8 86400`
    );
    assert.match(
      output,
      new RegExp('Updated regional secret rotation schedule:')
    );
  });

  it('creates a secret with type', async () => {
    const output = execSync(
      `node createSecretWithType.js projects/${projectId} ${secretId}-9 CERTIFICATE`
    );
    assert.match(output, new RegExp('Created secret with secret type:'));
  });

  it('gets secret type', async () => {
    const output = execSync(`node getSecretType.js ${secret.name}`);
    assert.match(output, new RegExp('with secret type'));
  });

  it('gets regional secret type', async () => {
    const output = execSync(
      `node regional_samples/getRegionalSecretType.js ${projectId} ${locationId} ${secretId}`
    );
    assert.match(output, new RegExp('with secret type'));
  });
});
