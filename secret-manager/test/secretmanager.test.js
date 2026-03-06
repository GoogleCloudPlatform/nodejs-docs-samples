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
const client = new SecretManagerServiceClient();
const resourcemanagerTagKeyClient = new TagKeysClient();
const resourcemanagerTagValueClient = new TagValuesClient();

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const kmsKeyName = process.env.GOOGLE_CLOUD_KMS_KEY_NAME;
const regionalKmsKeyName = process.env.GOOGLE_CLOUD_REGIONAL_KMS_KEY_NAME;
const topicName = process.env.GOOGLE_CLOUD_TOPIC_NAME;
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

    try {
      await client.deleteSecret({
        name: `${secret.name}-ummr`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-cmek`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-regional-cmek`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-expiry`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-regional-expiry`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-rotation`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-regional-rotation`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await client.deleteSecret({
        name: `${secret.name}-topic`,
      });
    } catch (err) {
      if (!err.message.includes('NOT_FOUND')) {
        throw err;
      }
    }

    try {
      await regionalClient.deleteSecret({
        name: `${regionalSecret.name}-regional-topic`,
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
    await client.createSecret({
      parent: `projects/${projectId}`,
      secretId: `${secretId}-delayedDestroy`,
      secret: {
        replication: {
          automatic: {},
        },
        version_destroy_ttl: {
          seconds: 24 * 60 * 60,
        },
      },
    });

    const output = execSync(
      `node disableSecretDelayedDestroy.js ${secret.name}-delayedDestroy`
    );
    assert.match(output, new RegExp('Disabled delayed destroy'));

    await client.deleteSecret({
      name: `${secret.name}-delayedDestroy`,
    });
  });

  it('updates a secret delayed destroy', async () => {
    const updatedTimeToLive = 24 * 60 * 60 * 2;
    await client.createSecret({
      parent: `projects/${projectId}`,
      secretId: `${secretId}-delayedDestroy`,
      secret: {
        replication: {
          automatic: {},
        },
        version_destroy_ttl: {
          seconds: 24 * 60 * 60,
        },
      },
    });

    const output = execSync(
      `node updateSecretWithDelayedDestroy.js ${secret.name}-delayedDestroy ${updatedTimeToLive}`
    );
    assert.match(output, new RegExp('Updated secret'));
    await client.deleteSecret({
      name: `${secret.name}-delayedDestroy`,
    });
  });

  it('creates a regional secret with delayed destroy', async () => {
    const timeToLive = 24 * 60 * 60;
    const output = execSync(
      `node regional_samples/createRegionalSecretWithDelayedDestroy.js ${projectId} ${locationId} ${secretId}-2-dd ${timeToLive}`
    );
    assert.match(output, new RegExp('Created regional secret'));
  });

  it('disables a regional secret delayed destroy', async () => {
    await regionalClient.createSecret({
      parent: `projects/${projectId}/locations/${locationId}`,
      secretId: `${secretId}-delayedDestroy`,
      secret: {
        version_destroy_ttl: {
          seconds: 24 * 60 * 60,
        },
      },
    });

    const output = execSync(
      `node regional_samples/disableRegionalSecretDelayedDestroy.js ${projectId} ${locationId} ${secretId}-delayedDestroy`
    );
    assert.match(output, new RegExp('Disabled delayed destroy'));

    await regionalClient.deleteSecret({
      name: `projects/${projectId}/locations/${locationId}/secrets/${secretId}-delayedDestroy`,
    });
  });

  it('updates a regional secret delayed destroy', async () => {
    const updatedTimeToLive = 24 * 60 * 60 * 2;
    await regionalClient.createSecret({
      parent: `projects/${projectId}/locations/${locationId}`,
      secretId: `${secretId}-delayedDestroy`,
      secret: {
        version_destroy_ttl: {
          seconds: 24 * 60 * 60,
        },
      },
    });

    const output = execSync(
      `node regional_samples/updateRegionalSecretWithDelayedDestroy.js ${projectId} ${locationId} ${secretId}-delayedDestroy ${updatedTimeToLive}`
    );
    assert.match(output, new RegExp('Updated regional secret'));
    await regionalClient.deleteSecret({
      name: `projects/${projectId}/locations/${locationId}/secrets/${secretId}-delayedDestroy`,
    });
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

  it('lists secrets with filter', async () => {
    const output = execSync(`node listSecretsWithFilter.js ${projectId}`);
    assert.match(output, new RegExp(`Found secret: ${secret.name}`));
  });

  it('lists regional secrets with filter', async () => {
    const output = execSync(
      `node regional_samples/listRegionalSecretsWithFilter.js ${projectId} ${locationId}`
    );
    assert.match(output, new RegExp(`Found secret: ${regionalSecret.name}`));
  });

  it('list secret versions with filter', async () => {
    const [versionForFilter] = await client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(payload),
      },
    });

    await client.disableSecretVersion({
      name: versionForFilter.name,
    });
    const output = execSync(
      `node listSecretVersionsWithFilter.js ${secret.name}`
    );
    assert.match(output, new RegExp(`Found version: ${versionForFilter.name}`));
  });

  it('list regional secret versions with filter', async () => {
    const [regionalVersionForFilter] = await regionalClient.addSecretVersion({
      parent: regionalSecret.name,
      payload: {
        data: Buffer.from(payload),
      },
    });
    await regionalClient.disableSecretVersion({
      name: regionalVersionForFilter.name,
    });
    const output = execSync(
      `node regional_samples/listRegionalSecretVersionsWithFilter.js ${projectId} ${locationId} ${secretId}`
    );
    assert.match(
      output,
      new RegExp(`Found version: ${regionalVersionForFilter.name}`)
    );
  });

  it('lists tag bindings', async () => {
    await client.createSecret({
      parent: `projects/${projectId}`,
      secretId: `${secretId}-tag-binding`,
      secret: {
        replication: {
          automatic: {},
        },
        tags: {
          [tagKey]: tagValue,
        },
      },
    });
    const output = execSync(
      `node listTagBindings.js ${secret.name}-tag-binding`
    );
    assert.match(
      output,
      new RegExp(`Tag bindings for ${secret.name}-tag-binding:`)
    );
    assert.match(output, new RegExp(`- Tag Value: ${tagValue}`));
    await client.deleteSecret({
      name: `${secret.name}-tag-binding`,
    });
  });

  it('lists regional tag bindings', async () => {
    const parent = `projects/${projectId}/locations/${locationId}`;
    await regionalClient.createSecret({
      parent: parent,
      secretId: `${secretId}-regional-tag-binding`,
      secret: {
        tags: {
          [tagKey]: tagValue,
        },
      },
    });
    const output = execSync(
      `node regional_samples/listRegionalTagBindings.js ${projectId} ${locationId} ${secretId}-regional-tag-binding`
    );
    assert.match(
      output,
      new RegExp(
        `Tag bindings for ${parent}/secrets/${secretId}-regional-tag-binding:`
      )
    );
    assert.match(output, new RegExp(`- Tag Value: ${tagValue}`));
    await regionalClient.deleteSecret({
      name: `${parent}/secrets/${secretId}-regional-tag-binding`,
    });
  });

  it('detach tag bindings', async () => {
    await client.createSecret({
      parent: `projects/${projectId}`,
      secretId: `${secretId}-detach-tag-binding`,
      secret: {
        replication: {
          automatic: {},
        },
        tags: {
          [tagKey]: tagValue,
        },
      },
    });
    const output = execSync(
      `node detachTagBinding.js ${secret.name}-detach-tag-binding ${tagValue}`
    );
    assert.match(
      output,
      new RegExp(
        `Detached tag value ${tagValue} from ${secret.name}-detach-tag-binding`
      )
    );
    await client.deleteSecret({
      name: `${secret.name}-detach-tag-binding`,
    });
  });

  it('detach tags from regional secrets', async () => {
    const parent = `projects/${projectId}/locations/${locationId}`;
    await regionalClient.createSecret({
      parent: parent,
      secretId: `${secretId}-detach-regional-tag-binding`,
      secret: {
        tags: {
          [tagKey]: tagValue,
        },
      },
    });
    const output = execSync(
      `node regional_samples/detachRegionalTag.js ${projectId} ${locationId} ${secretId}-detach-regional-tag-binding ${tagValue}`
    );
    assert.match(
      output,
      new RegExp(
        `Detached tag value ${tagValue} from ${parent}/secrets/${secretId}-detach-regional-tag-binding`
      )
    );
    await regionalClient.deleteSecret({
      name: `${parent}/secrets/${secretId}-detach-regional-tag-binding`,
    });
  });

  it('create secret with user managed replication policy', async () => {
    const parent = `projects/${projectId}`;
    const locations = ['us-east1', 'us-east5'];
    const ttl = 900;
    const output = execSync(
      `node createSecretWithUserManagedReplicationPolicy.js ${parent} ${secretId}-ummr ${locations} ${ttl}`
    );
    assert.match(output, new RegExp(`Created secret: ${secret.name}-ummr`));
  });

  it('create secret with customer managed enc key', async () => {
    const parent = `projects/${projectId}`;
    const output = execSync(
      `node createSecretWithCmek.js ${parent} ${secretId}-cmek ${kmsKeyName}`
    );
    assert.match(
      output,
      new RegExp(
        `Created secret ${secret.name}-cmek with CMEK key ${kmsKeyName}`
      )
    );
  });

  it('create regional secret with customer managed enc key', async () => {
    const output = execSync(
      `node regional_samples/createRegionalSecretWithCmek.js ${projectId} ${locationId} ${secretId}-regional-cmek ${regionalKmsKeyName}`
    );
    assert.match(
      output,
      new RegExp(
        `Created secret ${regionalSecret.name}-regional-cmek with CMEK key ${regionalKmsKeyName}`
      )
    );
  });

  it('create secret with expiry time set', async () => {
    const parent = `projects/${projectId}`;
    const output = execSync(
      `node createSecretWithExpiration.js ${parent} ${secretId}-expiry`
    );
    assert.match(output, new RegExp(`Created secret ${secret.name}-expiry`));
  });

  it('create regional secret with expiry time set', async () => {
    const output = execSync(
      `node regional_samples/createRegionalSecretWithExpiration.js ${projectId} ${locationId} ${secretId}-regional-expiry`
    );
    assert.match(
      output,
      new RegExp(`Created secret ${regionalSecret.name}-regional-expiry`)
    );
  });

  it('update secret with new expiry time', async () => {
    const parent = `projects/${projectId}`;
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    await client.createSecret({
      parent: parent,
      secretId: `${secretId}-update-expiry`,
      secret: {
        replication: {
          automatic: {},
        },
        expireTime: {
          seconds: Math.floor(expireTime.getTime() / 1000),
          nanos: (expireTime.getTime() % 1000) * 1000000,
        },
      },
    });
    const output = execSync(
      `node updateSecretExpiration.js ${parent}/secrets/${secretId}-update-expiry`
    );
    assert.match(
      output,
      new RegExp(`Updated secret ${secret.name}-update-expiry`)
    );
    await client.deleteSecret({
      name: `${secret.name}-update-expiry`,
    });
  });

  it('update regional secret with new expiry time', async () => {
    const parent = `projects/${projectId}/locations/${locationId}`;
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    await regionalClient.createSecret({
      parent: parent,
      secretId: `${secretId}-regional-update-expiry`,
      secret: {
        expireTime: {
          seconds: Math.floor(expireTime.getTime() / 1000),
          nanos: (expireTime.getTime() % 1000) * 1000000,
        },
      },
    });
    const output = execSync(
      `node regional_samples/updateRegionalSecretExpiration.js ${projectId} ${secretId}-regional-update-expiry ${locationId}`
    );
    assert.match(
      output,
      new RegExp(`Updated secret ${regionalSecret.name}-regional-update-expiry`)
    );
    await regionalClient.deleteSecret({
      name: `${regionalSecret.name}-regional-update-expiry`,
    });
  });

  it('delete secret expiry time', async () => {
    const parent = `projects/${projectId}`;
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    await client.createSecret({
      parent: parent,
      secretId: `${secretId}-delete-expiry`,
      secret: {
        replication: {
          automatic: {},
        },
        expireTime: {
          seconds: Math.floor(expireTime.getTime() / 1000),
          nanos: (expireTime.getTime() % 1000) * 1000000,
        },
      },
    });
    const output = execSync(
      `node deleteSecretExpiration.js ${parent}/secrets/${secretId}-delete-expiry`
    );
    assert.match(
      output,
      new RegExp(`Removed expiration from secret ${secret.name}`)
    );
    await client.deleteSecret({
      name: `${secret.name}-delete-expiry`,
    });
  });

  it('delete regional secret expiry time', async () => {
    const parent = `projects/${projectId}/locations/${locationId}`;
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    await regionalClient.createSecret({
      parent: parent,
      secretId: `${secretId}-regional-delete-expiry`,
      secret: {
        expireTime: {
          seconds: Math.floor(expireTime.getTime() / 1000),
          nanos: (expireTime.getTime() % 1000) * 1000000,
        },
      },
    });
    const output = execSync(
      `node regional_samples/deleteRegionalSecretExpiration.js ${projectId} ${secretId}-regional-delete-expiry ${locationId}`
    );
    assert.match(
      output,
      new RegExp(
        `Removed expiration from secret ${regionalSecret.name}-regional-delete-expiry`
      )
    );
    await regionalClient.deleteSecret({
      name: `${regionalSecret.name}-regional-delete-expiry`,
    });
  });

  it('create secret with rotation time set', async () => {
    const parent = `projects/${projectId}`;
    const output = execSync(
      `node createSecretWithRotation.js ${parent} ${secretId}-rotation ${topicName}`
    );
    assert.match(output, new RegExp(`Created secret ${secret.name}-rotation`));
  });

  it('create regional secret with rotation time set', async () => {
    const output = execSync(
      `node regional_samples/createRegionalSecretWithRotation.js ${projectId} ${secretId}-regional-rotation ${locationId} ${topicName}`
    );
    assert.match(
      output,
      new RegExp(`Created secret ${regionalSecret.name}-regional-rotation`)
    );
  });

  it('update secret with new rotation time', async () => {
    const parent = `projects/${projectId}`;
    const rotationPeriodHours = 24;
    const nextRotationTime = new Date();
    nextRotationTime.setHours(nextRotationTime.getHours() + 24);
    await client.createSecret({
      parent: parent,
      secretId: `${secretId}-update-rotation`,
      secret: {
        replication: {
          automatic: {},
        },
        topics: [
          {
            name: topicName,
          },
        ],
        rotation: {
          nextRotationTime: {
            seconds: Math.floor(nextRotationTime.getTime() / 1000),
            nanos: (nextRotationTime.getTime() % 1000) * 1000000,
          },
          rotationPeriod: {
            seconds: rotationPeriodHours * 3600,
            nanos: 0,
          },
        },
      },
    });
    const output = execSync(
      `node updateSecretRotation.js ${parent}/secrets/${secretId}-update-rotation`
    );
    assert.match(
      output,
      new RegExp(`Updated secret ${secret.name}-update-rotation`)
    );
    await client.deleteSecret({
      name: `${secret.name}-update-rotation`,
    });
  });

  it('update regional secret with new rotation time', async () => {
    const parent = `projects/${projectId}/locations/${locationId}`;
    const rotationPeriodHours = 24;
    const nextRotationTime = new Date();
    nextRotationTime.setHours(nextRotationTime.getHours() + 24);

    await regionalClient.createSecret({
      parent: parent,
      secretId: `${secretId}-regional-update-rotation`,
      secret: {
        topics: [
          {
            name: topicName,
          },
        ],
        rotation: {
          nextRotationTime: {
            seconds: Math.floor(nextRotationTime.getTime() / 1000),
            nanos: (nextRotationTime.getTime() % 1000) * 1000000,
          },
          rotationPeriod: {
            seconds: rotationPeriodHours * 3600, // Convert hours to seconds
            nanos: 0,
          },
        },
      },
    });
    const output = execSync(
      `node regional_samples/updateRegionalSecretRotation.js ${projectId} ${secretId}-regional-update-rotation ${locationId}`
    );
    assert.match(
      output,
      new RegExp(
        `Updated secret ${regionalSecret.name}-regional-update-rotation`
      )
    );
    await regionalClient.deleteSecret({
      name: `${regionalSecret.name}-regional-update-rotation`,
    });
  });

  it('delete secret rotation time', async () => {
    const parent = `projects/${projectId}`;
    const rotationPeriodHours = 24;
    const nextRotationTime = new Date();
    nextRotationTime.setHours(nextRotationTime.getHours() + 24);
    await client.createSecret({
      parent: parent,
      secretId: `${secretId}-delete-rotation`,
      secret: {
        replication: {
          automatic: {},
        },
        topics: [
          {
            name: topicName,
          },
        ],
        rotation: {
          nextRotationTime: {
            seconds: Math.floor(nextRotationTime.getTime() / 1000),
            nanos: (nextRotationTime.getTime() % 1000) * 1000000,
          },
          rotationPeriod: {
            seconds: rotationPeriodHours * 3600,
            nanos: 0,
          },
        },
      },
    });
    const output = execSync(
      `node deleteSecretRotation.js ${parent}/secrets/${secretId}-delete-rotation`
    );
    assert.match(
      output,
      new RegExp(`Removed rotation from secret ${secret.name}`)
    );
    await client.deleteSecret({
      name: `${secret.name}-delete-rotation`,
    });
  });

  it('delete regional secret rotation time', async () => {
    const parent = `projects/${projectId}/locations/${locationId}`;
    const rotationPeriodHours = 24;
    const nextRotationTime = new Date();
    nextRotationTime.setHours(nextRotationTime.getHours() + 24);

    await regionalClient.createSecret({
      parent: parent,
      secretId: `${secretId}-regional-delete-rotation`,
      secret: {
        topics: [
          {
            name: topicName,
          },
        ],
        rotation: {
          nextRotationTime: {
            seconds: Math.floor(nextRotationTime.getTime() / 1000),
            nanos: (nextRotationTime.getTime() % 1000) * 1000000,
          },
          rotationPeriod: {
            seconds: rotationPeriodHours * 3600, // Convert hours to seconds
            nanos: 0,
          },
        },
      },
    });
    const output = execSync(
      `node regional_samples/deleteRegionalSecretRotation.js ${projectId} ${secretId}-regional-delete-rotation ${locationId}`
    );
    assert.match(
      output,
      new RegExp(
        `Removed rotation from secret ${regionalSecret.name}-regional-delete-rotation`
      )
    );
    await regionalClient.deleteSecret({
      name: `${regionalSecret.name}-regional-delete-rotation`,
    });
  });

  it('create secret with topic set', async () => {
    const parent = `projects/${projectId}`;
    const output = execSync(
      `node createSecretWithTopic.js ${parent} ${secretId}-topic ${topicName}`
    );
    assert.match(output, new RegExp(`Created secret ${secret.name}-topic`));
  });

  it('create regional secret with topic set', async () => {
    const output = execSync(
      `node regional_samples/createRegionalSecretWithTopic.js ${projectId} ${secretId}-regional-topic ${locationId} ${topicName}`
    );
    assert.match(
      output,
      new RegExp(`Created secret ${regionalSecret.name}-regional-topic`)
    );
  });
});
