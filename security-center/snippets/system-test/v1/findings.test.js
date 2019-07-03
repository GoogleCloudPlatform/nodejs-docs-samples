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

describe('Client with SourcesAndFindings', async () => {
  let data;
  before(async () => {
    const {SecurityCenterClient} = require('@google-cloud/security-center');

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
  it('client can create source', async () => {
    const output = await exec(`node v1/createSource.js ${data.orgId}`);
    assert.match(output, new RegExp(data.orgId));
    assert.match(output, /New Source/);
    assert.notMatch(output, /undefined/);
  });
  it('client can get source', async () => {
    const output = await exec(`node v1/getSource.js ${data.sourceName}`);
    assert.match(output, new RegExp(data.sourceName));
    assert.match(output, /Source/);
    assert.match(output, /"description":"A new custom source that does X"/);
    assert.notMatch(output, /undefined/);
  });
  it('client can list all sources', async () => {
    const output = await exec(`node v1/listAllSources.js ${data.orgId}`);
    assert.match(output, new RegExp(data.sourceName));
    assert.match(output, /Sources/);
    assert.notMatch(output, /undefined/);
  });
  it('client can update a source', async () => {
    const output = await exec(`node v1/updateSource.js ${data.sourceName}`);
    assert.match(output, new RegExp(data.sourceName));
    assert.match(output, /New Display Name/);
    assert.match(output, /source that does X/);
    assert.notMatch(output, /undefined/);
  });
  it('client can create a finding', async () => {
    const output = await exec(`node v1/createFinding.js ${data.sourceName}`);
    assert.match(output, new RegExp(data.sourceName));
    assert.match(output, /New finding created/);
    assert.notMatch(output, /undefined/);
  });
  it('client can create a finding with source properties', async () => {
    const output = await exec(
      `node v1/createFindingSourceProperties.js ${data.sourceName}`
    );
    assert.match(output, new RegExp(data.sourceName));
    assert.match(output, /New finding created/);
    assert.match(output, /n_value/);
    assert.notMatch(output, /undefined/);
  });
  it('client can update a findings source properties', async () => {
    const output = await exec(
      `node v1/updateFindingSourceProperties.js ${data.findingName}`
    );
    assert.match(output, new RegExp(data.findingName));
    assert.match(output, /Updated Finding/);
    assert.match(output, /new_string_example/);
    assert.notMatch(output, /undefined/);
  });
  it('client can set finding state', async () => {
    const output = await exec(`node v1/setFindingState.js ${data.findingName}`);
    assert.match(output, new RegExp(data.findingName));
    assert.match(output, /INACTIVE/);
    assert.notMatch(output, /undefined/);
  });
  it('client can test IAM privileges', async () => {
    const output = await exec(`node v1/testIam.js ${data.sourceName}`);
    assert.equal(
      (output.match(/true/g) || []).length,
      2,
      `${output} contains true twice`
    );
    assert.notMatch(output, /undefined/);
  });
  it('client can list all findings', async () => {
    const output = await exec(`node v1/listAllFindings.js ${data.orgId}`);
    assert.match(output, new RegExp(data.findingName));
    assert.match(output, new RegExp(data.untouchedFindingName));
    assert.notMatch(output, /undefined/);
  });
  it('client can list only some findings', async () => {
    const output = await exec(
      `node v1/listFilteredFindings.js ${data.sourceName}`
    );
    assert.match(output, new RegExp(data.findingName));
    assert.notMatch(output, new RegExp(data.untouchedFindingName));
    assert.notMatch(output, /undefined/);
  });
  it('client can list findings at a time.', async () => {
    const output = await exec(
      `node v1/listFindingsAtTime.js ${data.sourceName}`
    );
    // Nothing was created for the source more then a few minutes ago, so
    // days ago should return nothing.
    assert.equal(output, '');
  });
  it('client can add security marks to finding', async () => {
    const output = await exec(
      `node v1/addFindingSecurityMarks.js ${data.findingName}`
    );
    assert.match(output, new RegExp(data.findingName));
    assert.match(output, /key_a/);
    assert.match(output, /value_a/);
    assert.match(output, /key_b/);
    assert.match(output, /value_b/);
    assert.notMatch(output, /undefined/);
  });
  it('client can list findings withe security marks', async () => {
    // Ensure marks are set.
    await exec(`node v1/addFindingSecurityMarks.js ${data.findingName}`);

    const output = await exec(
      `node v1/listFindingsWithSecurityMarks.js ${data.sourceName}`
    );
    assert.notMatch(output, new RegExp(data.findingName));
    assert.match(output, new RegExp(data.untouchedFindingName));
    assert.notMatch(output, /undefined/);
  });
  it('client can get a sources policy', async () => {
    const output = await exec(`node v1/getSourceIam.js ${data.sourceName}`);
    assert.match(output, /Current policy/);
    assert.notMatch(output, /undefined/);
  });
  it('client set a sources policy', async () => {
    const user = 'csccclienttest@gmail.com';
    const output = await exec(
      `node v1/setSourceIam.js ${data.sourceName} ${user}`
    );
    assert.match(output, /Updated policy/);
    assert.match(output, new RegExp(user));
    assert.notMatch(output, /undefined/);
  });
});
