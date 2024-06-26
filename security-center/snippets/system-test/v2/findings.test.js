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
const uuid = require('uuid');

const organizationId = process.env['GCLOUD_ORGANIZATION'];
const [projectId] = process.env['GOOGLE_CLOUD_PROJECT'];
const location = 'global';

describe('Client with sources and findings V2', async () => {
  let data;
  before(async () => {
    // Creates a new client.
    const client = new SecurityCenterClient();

    const [source] = await client
      .createSource({
        source: {
          displayName: 'Customized Display Name V2',
          description: 'A new custom source that does X',
        },
        parent: client.organizationPath(organizationId),
      })
      .catch(error => console.error(error));

    const sourceId = source.name.split('/')[3];
    const parent = `organizations/${organizationId}/sources/${sourceId}/locations/${location}`;
    const resourceName = `//cloudresourcemanager.googleapis.com/organizations/${organizationId}`;
    const findingId = uuid.v4().replace(/-/g, '');

    const eventTime = new Date();
    const createFindingTemplate = {
      parent: parent,
      findingId: findingId,
      finding: {
        state: 'ACTIVE',
        // Resource the finding is associated with.  This is an
        // example any resource identifier can be used.
        resourceName: resourceName,
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
      sourceId: sourceId,
      sourceName: source.name,
      findingId: findingId,
      projectId: projectId,
      findingName: finding.name,
      untouchedFindingName: untouchedFinding.name,
    };
    console.log('my data findings %j', data);
  });

  it('client can create source V2', () => {
    const output = exec(`node v2/createSource.js ${data.orgId}`);
    assert(output.includes(data.orgId));
    assert.match(output, /New Source created/);
    assert.notMatch(output, /undefined/);
  });

  it('client can create a finding V2', () => {
    const output = exec(
      `node v2/createFinding.js ${data.orgId} ${data.sourceId}`
    );
    assert(output.includes(data.sourceName));
    assert.match(output, /New finding created/);
    assert.notMatch(output, /undefined/);
  });

  it('client can list all findings V2', () => {
    const output = exec(`node v2/listAllFindings.js ${data.orgId}`);
    assert(output.includes(data.findingName));
    assert(output.includes(data.untouchedFindingName));
    assert.notMatch(output, /undefined/);
  });

  it('client can list only some findings V2', () => {
    const output = exec(`node v2/listFilteredFindings.js ${data.orgId}`);
    assert(output.includes(data.findingName));
    assert.match(output, /Findings/);
    assert.notMatch(output, /undefined/);
  });

  it('client can mute a findings V2', () => {
    const output = exec(
      `node v2/setMuteFinding.js ${data.orgId} ${data.sourceId} ${data.findingId}`
    );
    assert(output.includes('MUTED'));
    assert.match(output, /Mute value for the finding/);
    assert.notMatch(output, /undefined/);
  });

  it('client can un mute a findings V2', () => {
    const output = exec(
      `node v2/setUnmuteFinding.js ${data.orgId} ${data.sourceId} ${data.findingId}`
    );
    assert(output.includes('UNMUTED'));
    assert.match(output, /Unmute a finding/);
    assert.notMatch(output, /undefined/);
  });

  it('client can group all findings V2', () => {
    const output = exec(
      `node v2/groupFindings.js ${data.orgId} ${data.sourceId}`
    );
    assert.isAtLeast(4, output.match(/\n/g).length + 1);
    assert.notMatch(output, /undefined/);
  });

  it('client group filtered findings V2', () => {
    const output = exec(
      `node v2/groupFindingsWithFilter.js ${data.orgId} ${data.sourceId}`
    );
    assert.isAtLeast(4, output.match(/\n/g).length + 1);
    assert.notMatch(output, /undefined/);
  });

  it('client can bulk a mute a findings V2', () => {
    const output = exec(
      `node v2/bulkMuteFindings.js ${data.orgId} ${data.projectId}`
    );
    assert.match(output, /Bulk mute findings completed successfully/);
    assert.notMatch(output, /undefined/);
  });

  it('client can get IAM policy V2', () => {
    const output = exec(
      `node v2/getIamPolicy.js ${data.orgId} ${data.sourceId}`
    );
    assert.match(output, /IAM policies for a source/);
    assert.notMatch(output, /undefined/);
  });

  it('client can retrieve IAM policies V2', () => {
    const permission = 'securitycenter.findings.update';
    const output = exec(
      `node v2/testIam.js ${data.orgId} ${data.sourceId} ${permission}`
    );
    assert.match(output, /IAM permission to test/);
    assert.notMatch(output, /undefined/);
  });

  it('client can sets the access control policy on the specified Source V2', () => {
    const userEmail = 'csccclienttest@gmail.com';
    const role = 'roles/securitycenter.findingsEditor';
    const output = exec(
      `node v2/setIamPolicy.js ${data.orgId} ${data.sourceId} ${userEmail} ${role}`
    );
    assert.match(output, /Updated policy/);
    assert.notMatch(output, /undefined/);
  });

  it('client can update a finding state V2', () => {
    const output = exec(
      `node v2/setFindingState.js ${data.orgId} ${data.sourceId} ${data.findingId}`
    );
    assert(output.includes('INACTIVE'));
    assert.match(output, /Set finding state/);
    assert.notMatch(output, /undefined/);
  });

  it('client can creates or updates a finding source V2', () => {
    const output = exec(
      `node v2/updateFindingSource.js ${data.orgId} ${data.sourceId} ${data.findingId}`
    );
    assert(output.includes(data.findingName));
    assert.match(output, /Updated finding source/);
    assert.notMatch(output, /undefined/);
  });

  it('client can list all security sources in an organization V2', () => {
    const output = exec(`node v2/listAllSources.js ${data.orgId}`);
    assert(output.includes(data.sourceName));
    assert.match(output, /Sources/);
    assert.notMatch(output, /undefined/);
  });

  it('client can creates or updates a source V2', () => {
    const output = exec(
      `node v2/updateSource.js ${data.orgId} ${data.sourceId}`
    );
    assert(output.includes(data.sourceName));
    assert.match(output, /New Display Name/);
    assert.match(output, /Updated Source/);
    assert.notMatch(output, /undefined/);
  });

  it('client can retrieve a specific source V2', () => {
    const output = exec(`node v2/getSource.js ${data.orgId} ${data.sourceId}`);
    assert(output.includes(data.sourceName));
    assert.match(output, /Source/);
    assert.match(output, /"description":"A new custom source that does X"/);
    assert.notMatch(output, /undefined/);
  });
});
