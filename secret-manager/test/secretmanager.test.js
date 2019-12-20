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
const uuidv4 = require('uuid/v4');

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

const projectId = process.env.GCLOUD_PROJECT;
const secretId = uuidv4();
const payload = `my super secret data`;

let secret;
let version;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe(`Secret Manager samples`, () => {
  before(async () => {
    [secret] = await client.createSecret({
      parent: `projects/${projectId}`,
      secretId: secretId,
      secret: {
        replication: {
          automatic: {},
        },
      },
    });

    [version] = await client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(payload),
      },
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
      await client.deleteSecret({
        name: `${secret.name}-quickstart`,
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
  });

  it(`runs the quickstart`, async () => {
    const stdout = execSync(
      `node quickstart.js projects/${projectId} ${secretId}-quickstart bar`
    );
    assert.match(stdout, new RegExp(`Created secret`));
    assert.match(stdout, new RegExp(`Added secret version`));
    assert.match(stdout, new RegExp(`Payload: bar`));
  });

  it(`creates a secret`, async () => {
    const output = execSync(
      `node createSecret.js projects/${projectId} ${secretId}-2`
    );
    assert.match(output, new RegExp(`Created secret`));
  });

  it(`lists secrets`, async () => {
    const output = execSync(`node listSecrets.js projects/${projectId}`);
    assert.match(output, new RegExp(`${secret.name}`));
  });

  it(`gets a secret`, async () => {
    const output = execSync(`node getSecret.js ${secret.name}`);
    assert.match(output, new RegExp(`Found secret ${secret.name}`));
  });

  it(`updates a secret`, async () => {
    const output = execSync(`node updateSecret.js ${secret.name}`);
    assert.match(output, new RegExp(`Updated secret ${secret.name}`));
  });

  it(`deletes a secret`, async () => {
    const output = execSync(
      `node deleteSecret.js projects/${projectId}/secrets/${secretId}-2`
    );
    assert.match(output, new RegExp(`Deleted secret`));
  });

  it(`accesses secret versions`, async () => {
    const output = execSync(`node accessSecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(payload));
  });

  it(`adds secret versions`, async () => {
    const output = execSync(`node addSecretVersion.js ${secret.name}`);
    assert.match(output, new RegExp(`Added secret version`));
  });

  it(`list secret versions`, async () => {
    const output = execSync(`node listSecretVersions.js ${secret.name}`);
    assert.match(output, new RegExp(`${version.name}`));
  });

  it(`gets secret versions`, async () => {
    const output = execSync(`node getSecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(`Found secret ${version.name}`));
  });

  it(`disables secret versions`, async () => {
    const output = execSync(`node disableSecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(`Disabled ${version.name}`));
  });

  it(`enables secret versions`, async () => {
    const output = execSync(`node enableSecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(`Enabled ${version.name}`));
  });

  it(`destroys secret versions`, async () => {
    const output = execSync(`node destroySecretVersion.js ${version.name}`);
    assert.match(output, new RegExp(`Destroyed ${version.name}`));
  });
});
