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
const execa = require('execa');
const exec = async cmd => (await execa.shell(cmd)).stdout;

const organizationId = process.env['GCLOUD_ORGANIZATION'];

describe('client with security marks for assets', async () => {
  let data;
  before(async () => {
    const {SecurityCenterClient} = require('@google-cloud/security-center');

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
  it('client can add security marks to asset.', async () => {
    const output = await exec(`node v1/addSecurityMarks.js ${data.assetName}`);
    assert.match(output, new RegExp(data.assetName));
    assert.match(output, /key_a/);
    assert.match(output, /value_a/);
    assert.match(output, /key_b/);
    assert.match(output, /value_b/);
    assert.notMatch(output, /undefined/);
  });

  it('client can add and delete security marks', async () => {
    // Ensure marks are set.
    await exec(`node v1/addSecurityMarks.js ${data.assetName}`);

    const output = await exec(
      `node v1/addDeleteSecurityMarks.js ${data.assetName}`
    );
    assert.match(output, /key_a/);
    assert.match(output, /new_value_a/);
    assert.notMatch(output, /key_b/);
    assert.notMatch(output, /undefined/);
  });

  it('client can delete security marks', async () => {
    // Ensure marks are set.
    await exec(`node v1/addSecurityMarks.js ${data.assetName}`);

    const output = await exec(
      `node v1/deleteSecurityMarks.js ${data.assetName}`
    );
    assert.notMatch(output, /key_a/);
    assert.notMatch(output, /value_a/);
    assert.notMatch(output, /key_b/);
    assert.notMatch(output, /value_b/);
    assert.match(output, new RegExp(data.assetName));
    assert.match(output, new RegExp(data.assetName));
    assert.notMatch(output, /undefined/);
  });

  it('client can list assets with security marks', async () => {
    // Ensure marks are set.
    await exec(`node v1/addSecurityMarks.js ${data.assetName}`);

    const output = await exec(
      `node v1/listAssetsWithSecurityMarks.js ${data.orgId}`
    );
    assert.match(output, new RegExp(data.assetName));
    assert.notMatch(output, /undefined/);
  });
});
