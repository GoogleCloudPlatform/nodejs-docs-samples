// Copyright 2024 Google LLC
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

const organizationId = process.env.GCLOUD_ORGANIZATION;

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
        parent: `organizations/${organizationId}`,
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
        resourceName: `//cloudresourcemanager.googleapis.com/organizations/${organizationId}`,
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
    const sourceId = source.name.split('/')[3];
    const findingId = finding.name.split('/')[7];

    data = {
      orgId: organizationId,
      sourceName: source.name,
      findingName: finding.name,
      untouchedFindingName: untouchedFinding.name,
      sourceId: sourceId,
      findingId: findingId,
    };
    console.log('My data security marks %j', data);
  });

  it('client can add security marks to finding v2', done => {
    const output = exec(
      `node v2/addFindingSecurityMarks.js ${data.orgId} ${data.sourceId}`
    );
    assert(output.includes(data.orgId));
    assert(output.includes(data.sourceId));
    assert.match(output, /key_a/);
    assert.match(output, /value_a/);
    assert.match(output, /key_b/);
    assert.match(output, /value_b/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('client can list findings with security marks v2', done => {
    // Ensure marks are set.
    exec(`node v2/addFindingSecurityMarks.js ${data.orgId} ${data.sourceId}`);
    const output = exec(
      `node v2/listFindingsWithSecurityMarks.js ${data.orgId} ${data.sourceId}`
    );
    assert(!output.includes(data.findingName));
    assert(output.includes(data.untouchedFindingName));
    assert.notMatch(output, /undefined/);
    done();
  });

  it('client can delete and update findings with security marks v2', done => {
    // Ensure marks are set.
    exec(`node v2/addFindingSecurityMarks.js ${data.orgId} ${data.sourceId}`);
    const output = exec(
      `node v2/deleteAndUpdateSecurityMarks.js ${data.orgId} ${data.sourceId}`
    );
    assert(output.includes(data.orgId));
    assert.match(output, /key_a/);
    assert.match(output, /new_value_for_a/);
    assert.notMatch(output, /key_b/);
    assert.notMatch(output, /value_b/);
    assert.notMatch(output, /undefined/);
    done();
  });

  it('client can delete and update findings with security marks v2', done => {
    // Ensure marks are set.
    exec(`node v2/addFindingSecurityMarks.js ${data.orgId} ${data.sourceId}`);
    const output = exec(
      `node v2/deleteSecurityMarks.js ${data.orgId} ${data.sourceId}`
    );
    assert(output.includes(data.orgId));
    assert.notMatch(output, /key_a/);
    assert.notMatch(output, /value_a/);
    assert.notMatch(output, /key_b/);
    assert.notMatch(output, /value_b/);
    assert.notMatch(output, /undefined/);
    done();
  });
});
