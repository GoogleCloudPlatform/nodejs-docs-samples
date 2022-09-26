// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');
const path = require('path');
const cp = require('child_process');
const {auth} = require('google-auth-library');
const {describe, it} = require('mocha');

const cwd = path.join(__dirname, '..');
const cmd = 'node auth.js';

const BUCKET_NAME = 'long-door-651';
const GOOGLE_CLOUD_PROJECT = 'long-door-651';
const TARGET_AUDIENCE = 'iap.googleapis.com';
const ZONE = 'us-central1-a';

const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const execSync = (command, opts) => {
  return cp.execSync(command, Object.assign({encoding: 'utf-8'}, opts));
};

describe('auth samples', () => {
  it('should load credentials implicitly', async () => {
    const output = execSync(`${cmd} auth-cloud-implicit`, {cwd, shell: true});
    assert.strictEqual(output.includes(BUCKET_NAME), true);
  });

  it('should load credentials explicitly', async () => {
    const project = process.env.GOOGLE_CLOUD_PROJECT || GOOGLE_CLOUD_PROJECT;
    const keyfile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    console.log(`${cmd} auth-cloud-explicit -p ${project} -k ${keyfile}`);
    const output = execSync(
      `${cmd} auth-cloud-explicit -p ${project} -k ${keyfile}`,
      {cwd, shell: true}
    );
    assert.strictEqual(output.includes(BUCKET_NAME), true);
  });

  it('should authenticate explicitly', async () => {
    const output = execSync('node authenticateExplicit');

    assert.match(output, /Listed all storage buckets./);
  });

  it('should authenticate implicitly with adc', async () => {
    const projectId = await auth.getProjectId();

    const output = execSync(
      `node authenticateImplicitWithAdc ${projectId} ${ZONE}`
    );

    assert.match(output, /Listed all storage buckets./);
  });

  it('should get id token from metadata server', async () => {
    const output = execSync(
      'node idTokenFromMetadataServer https://www.google.com'
    );

    assert.match(output, /Generated ID token./);
  });

  it('should get id token from service account', async () => {
    const output = execSync(
      `node idTokenFromServiceAccount ${TARGET_AUDIENCE} ${keyFile}`
    );

    assert.match(output, /Generated ID token./);
  });

  it('should verify google id token', async () => {
    const jsonConfig = require(keyFile);
    const client = auth.fromJSON(jsonConfig);

    const idToken = await client.fetchIdToken(TARGET_AUDIENCE);

    const output = execSync(
      `node verifyGoogleIdToken ${idToken} ${TARGET_AUDIENCE} https://www.googleapis.com/oauth2/v3/certs`
    );

    assert.match(output, /ID token verified./);
  });
});
