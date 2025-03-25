/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {SecurityCenterClient} = require('@google-cloud/security-center').v2;
const {assert} = require('chai');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});
const {describe, it, before} = require('mocha');

// TODO(developers): update for your own environment
const organizationId = '1081635000895';
const location = 'global';

describe('Client with mute rule V2', async () => {
  let data;
  before(async () => {
    // Creates a new client.
    const client = new SecurityCenterClient();

    // Build the create mute rule request.
    const muteId = 'muteid-' + Math.floor(Math.random() * 10000);
    const createMuteRuleRequest = {
      parent: `organizations/${organizationId}/locations/${location}`,
      muteConfigId: muteId,
      muteConfig: {
        name: `organizations/${organizationId}/locations/${location}/muteConfigs/${muteId}`,
        description: "Mute low-medium IAM grants excluding 'compute' resources",
        filter:
          'severity="LOW" OR severity="MEDIUM" AND ' +
          'category="Persistence: IAM Anomalous Grant" AND ' +
          '-resource.type:"compute"',
        type: 'STATIC',
      },
    };

    const [muteConfigResponse] = await client
      .createMuteConfig(createMuteRuleRequest)
      .catch(error => console.error(error));

    const muteConfigId = muteConfigResponse.name.split('/')[5];

    data = {
      orgId: organizationId,
      muteConfigId: muteConfigId,
      muteConfigName: muteConfigResponse.name,
      untouchedMuteConfigName: '',
    };
    console.log('My data muteConfig:: %j', data);
  });

  it('client can create mute rule V2', done => {
    const output = exec(`node v2/createMuteRule.js ${data.orgId}`);
    assert(output.includes(data.orgId));
    assert.match(output, /New mute rule config created/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('client can list all mute rules V2', done => {
    const output = exec(`node v2/listAllMuteRules.js ${data.orgId}`);
    assert(output.includes(data.orgId));
    assert(output.includes(data.untouchedMuteConfigName));
    assert.notMatch(output, /undefined/);
    done();
  });

  it('client can get a mute rule V2', done => {
    const output = exec(
      `node v2/getMuteRule.js ${data.orgId} ${data.muteConfigId}`
    );
    assert(output.includes(data.muteConfigName));
    assert.match(output, /Get mute rule config/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('client can update a mute rule V2', done => {
    const output = exec(
      `node v2/updateMuteRule.js ${data.orgId} ${data.muteConfigId}`
    );
    assert.match(output, /Update mute rule config/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('client can delete a mute rule V2', done => {
    const output = exec(
      `node v2/deleteMuteRule.js ${data.orgId} ${data.muteConfigId}`
    );
    assert.match(output, /Delete mute rule config/);
    assert.notMatch(output, /undefined/);
    done();
  });
});
