// Copyright 2022 Google LLC
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
const uuid = require('uuid');
const cp = require('child_process');
const {describe, it} = require('mocha');
const {PoliciesClient} = require('@google-cloud/iam').v2;
const iamClient = new PoliciesClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('IAM deny samples', () => {
  const projectId = process.env.PROJECT_ID;
  const policyId = `gcloud-test-policy-${uuid.v4().split('-')[0]}`;
  const policyName = `policies/cloudresourcemanager.googleapis.com%2Fprojects%2F949737848314/denypolicies/${policyId}`;

  it('should create IAM policy', async () => {
    const output = execSync(`node createDenyPolicy ${projectId} ${policyId}`);

    assert.include(output, `Created the deny policy: ${policyName}`);
  });

  it('should list IAM policies', async () => {
    const output = execSync(`node listDenyPolicies ${projectId}`);

    assert.include(output, `- ${policyName}`);
  });

  it('should get IAM policies', async () => {
    const output = execSync(`node getDenyPolicy ${projectId} ${policyId}`);

    assert.include(output, `Retrieved the deny policy: ${policyName}`);
  });

  it('should update IAM policy', async () => {
    const [policy] = await iamClient.getPolicy({
      name: policyName,
    });
    const output = execSync(
      `node updateDenyPolicy ${projectId} ${policyId} ${policy.etag}`
    );

    assert.include(output, `Updated the deny policy: ${policyName}`);
  });

  it('should delete IAM policy', async () => {
    const output = execSync(`node deleteDenyPolicy ${projectId} ${policyId}`);

    assert.include(output, `Deleted the deny policy: ${policyName}`);
  });
});
