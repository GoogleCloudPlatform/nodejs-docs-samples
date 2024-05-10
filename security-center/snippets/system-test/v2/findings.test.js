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

const { SecurityCenterClient } = require('@google-cloud/security-center').v2;
const { assert } = require('chai');
const { execSync } = require('child_process');
const exec = cmd => execSync(cmd, { encoding: 'utf8' });
const { describe, it, before } = require('mocha');
const uuid = require('uuid');

const organizationId = process.env['GCLOUD_ORGANIZATION'];
const location = 'global';

describe('Client with SourcesAndFindings V2', async () => {
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
            findingName: finding.name,
            untouchedFindingName: untouchedFinding.name,
        };
        console.log('my data %j', data);
    });

    it('client can create source V2', () => {
        const output = exec(`node v2/createSource.js ${data.orgId}`);
        assert.match(output, new RegExp(data.orgId));
        assert.match(output, /New Source created/);
        assert.notMatch(output, /undefined/);
    });

    it('client can create a finding V2', () => {
        const output = exec(`node v2/createFinding.js ${data.orgId} ${data.sourceId}`);
        assert.match(output, new RegExp(data.sourceName));
        assert.match(output, /New finding created/);
        assert.notMatch(output, /undefined/);
    });

    it('client can list all findings V2', () => {
        const output = exec(`node v2/listAllFindings.js ${data.orgId}`);
        assert.match(output, new RegExp(data.findingName));
        assert.match(output, new RegExp(data.untouchedFindingName));
        assert.notMatch(output, /undefined/);
    });

    it('client can list only some findings V2', () => {
        const output = exec(`node v2/listFilteredFindings.js ${data.orgId}`);
        assert.match(output, new RegExp(data.findingName));
        assert.notMatch(output, new RegExp(data.untouchedFindingName));
        assert.notMatch(output, /undefined/);
    });

});
