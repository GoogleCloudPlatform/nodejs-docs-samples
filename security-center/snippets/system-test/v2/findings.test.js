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

const {SecurityCenterClient} = require('@google-cloud/security-center').v2;
const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

const organizationId = process.env['GCLOUD_ORGANIZATION'];

describe('Client with SourcesAndFindings', async () => {
  let data;
  before(async () => {
    // Creates a new client.
    const client = new SecurityCenterClient();
    const [source] = await client
      .createSource({
        source: {
          displayName: 'Customized Display Name',
          description: 'A new custom source that does X',
        },
        parent: client.organizationPath(organizationId),
      })
      .catch(error => console.error(error));
    const eventTime = new Date();
    const createFindingTemplate = {
      parent: source.name,
      findingId: 'somefinding',
      finding: {
        state: 'ACTIVE',
        // Resource the finding is associated with.  This is an
        // example any resource identifier can be used.
        resourceName:
          '//cloudresourcemanager.googleapis.com/organizations/11232',
        // A free-form category.
        category: 'MEDIUM_RISK_ONE',
        // The time associated with discovering the issue.
        eventTime: {
          seconds: Math.floor(eventTime.getTime() / 1000),
          nanos: (eventTime.getTime() % 1000) * 1e6,
        },
      },
    };
    const [finding] = await client.createFinding(createFindingTemplate);
    createFindingTemplate.findingId = 'untouchedFindingId';
    createFindingTemplate.finding.category = 'XSS';
    const [untouchedFinding] = await client
      .createFinding(createFindingTemplate)
      .catch(error => console.error(error));
    data = {
      orgId: organizationId,
      sourceName: source.name,
      findingName: finding.name,
      untouchedFindingName: untouchedFinding.name,
    };
    console.log('my data %j', data);
  });

  it('client can add security marks to finding', () => {
    const output = exec(
      `node v2/addFindingSecurityMarks.js ${data.findingName}`
    );
    assert.match(output, new RegExp(data.findingName));
    assert.match(output, /key_a/);
    assert.match(output, /value_a/);
    assert.match(output, /key_b/);
    assert.match(output, /value_b/);
    assert.notMatch(output, /undefined/);
  });

  it('client can list findings with security marks', () => {
    // Ensure marks are set.
    exec(`node v2/addFindingSecurityMarks.js ${data.findingName}`);
    const output = exec(
      `node v2/listFindingsWithSecurityMarks.js ${data.sourceName}`
    );
    assert.notMatch(output, new RegExp(data.findingName));
    assert.match(output, new RegExp(data.untouchedFindingName));
    assert.notMatch(output, /undefined/);
  });

  it('client can delete and update findings with security marks', () => {
    // Ensure marks are set.
    exec(`node v2/addFindingSecurityMarks.js ${data.findingName}`);
    const output = exec(
      `node v2/deleteAndUpdateSecurityMarks.js ${data.findingName}`
    );
    assert.match(output, new RegExp(data.findingName));
    assert.match(output, /key_a/);
    assert.match(output, /new_value_for_a/);
    assert.notMatch(output, /key_b/);
    assert.notMatch(output, /value_b/);
    assert.notMatch(output, /undefined/);
  });

  it('client can delete and update findings with security marks', () => {
    // Ensure marks are set.
    exec(`node v2/addFindingSecurityMarks.js ${data.findingName}`);
    const output = exec(`node v2/deleteSecurityMarks.js ${data.findingName}`);
    assert.match(output, new RegExp(data.findingName));
    assert.notMatch(output, /key_a/);
    assert.notMatch(output, /value_a/);
    assert.notMatch(output, /key_b/);
    assert.notMatch(output, /value_b/);
    assert.notMatch(output, /undefined/);
  });
});
