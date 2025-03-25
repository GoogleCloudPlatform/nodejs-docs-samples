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

const {SecurityCenterClient} = require('@google-cloud/security-center');
const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

// TODO(developers): update for your own environment
const organizationId = '1081635000895';

describe('client with security marks for assets', async () => {
  let data;
  before(async () => {
    // Creates a new client.
    const client = new SecurityCenterClient();

    const [assetResults] = await client.listAssets({
      parent: client.organizationPath(organizationId),
    });
    const randomAsset =
      assetResults[Math.floor(Math.random() * assetResults.length)].asset;
    console.log('random %j', randomAsset);
    data = {
      orgId: organizationId,
      assetName: randomAsset.name,
    };
    console.log('data %j', data);
  });
  it('client can add security marks to asset.', () => {
    const output = exec(`node v1/addSecurityMarks.js ${data.assetName}`);
    assert.include(output, data.assetName);
    assert.match(output, /key_a/);
    assert.match(output, /value_a/);
    assert.match(output, /key_b/);
    assert.match(output, /value_b/);
    assert.notMatch(output, /undefined/);
  });

  it('client can add and delete security marks', () => {
    // Ensure marks are set.
    exec(`node v1/addSecurityMarks.js ${data.assetName}`);

    const output = exec(`node v1/addDeleteSecurityMarks.js ${data.assetName}`);
    assert.match(output, /key_a/);
    assert.match(output, /new_value_a/);
    assert.notMatch(output, /key_b/);
    assert.notMatch(output, /undefined/);
  });

  it('client can delete security marks', () => {
    // Ensure marks are set.
    exec(`node v1/addSecurityMarks.js ${data.assetName}`);

    const output = exec(`node v1/deleteSecurityMarks.js ${data.assetName}`);
    assert.notMatch(output, /key_a/);
    assert.notMatch(output, /value_a/);
    assert.notMatch(output, /key_b/);
    assert.notMatch(output, /value_b/);
    assert.include(output, data.assetName);
    assert.include(output, data.assetName);
    assert.notMatch(output, /undefined/);
  });

  it('client can list assets with security marks', () => {
    // Ensure marks are set.
    exec(`node v1/addSecurityMarks.js ${data.assetName}`);

    const output = exec(`node v1/listAssetsWithSecurityMarks.js ${data.orgId}`);
    assert.include(output, data.assetName);
    assert.notMatch(output, /undefined/);
  });
});
