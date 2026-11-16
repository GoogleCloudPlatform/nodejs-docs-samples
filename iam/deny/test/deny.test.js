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

/* eslint-disable prefer-arrow-callback */

'use strict';

const {assert} = require('chai');
const uuid = require('uuid');
const cp = require('child_process');
const {describe, it, before, beforeEach} = require('mocha');
const {PoliciesClient} = require('@google-cloud/iam').v2;
const {handlePermissionError} = require('./utils');

const iamClient = new PoliciesClient();
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('IAM deny samples', function () {
  let projectId;
  let policyCreated = false;
  const policyId = `gcloud-test-policy-${uuid.v4().split('-')[0]}`;
  const policyName = `policies/cloudresourcemanager.googleapis.com%2Fprojects%2F949737848314/denypolicies/${policyId}`;

  before(async function () {
    try {
      projectId = await iamClient.getProjectId();
    } catch (err) {
      handlePermissionError.call(
        this,
        err,
        'Error retrieving project ID. Skipping suite.'
      );
    }
  });

  it('should create IAM policy', function () {
    try {
      const output = execSync(`node createDenyPolicy ${projectId} ${policyId}`);
      assert.include(output, `Created the deny policy: ${policyName}`);
      policyCreated = true;
    } catch (err) {
      handlePermissionError.call(
        this,
        err,
        'Permission denied creating deny policy. Skipping test.'
      );
    }
  });

  describe('when policy is created', function () {
    beforeEach(function () {
      if (!policyCreated) {
        this.skip();
      }
    });

    it('should list IAM policies', function () {
      try {
        const output = execSync(`node listDenyPolicies ${projectId}`);
        assert.include(output, `- ${policyName}`);
      } catch (err) {
        handlePermissionError.call(
          this,
          err,
          'Permission denied listing deny policies. Skipping test.'
        );
      }
    });

    it('should get IAM policies', function () {
      try {
        const output = execSync(`node getDenyPolicy ${projectId} ${policyId}`);
        assert.include(output, `Retrieved the deny policy: ${policyName}`);
      } catch (err) {
        handlePermissionError.call(
          this,
          err,
          'Permission denied retrieving deny policy. Skipping test.'
        );
      }
    });

    it('should update IAM policy', async function () {
      try {
        const [policy] = await iamClient.getPolicy({
          name: policyName,
        });
        const output = execSync(
          `node updateDenyPolicy ${projectId} ${policyId} ${policy.etag}`
        );

        assert.include(output, `Updated the deny policy: ${policyName}`);
      } catch (err) {
        handlePermissionError.call(
          this,
          err,
          'Permission denied updating deny policy. Skipping test.'
        );
      }
    });

    it('should delete IAM policy', function () {
      try {
        const output = execSync(
          `node deleteDenyPolicy ${projectId} ${policyId}`
        );
        assert.include(output, `Deleted the deny policy: ${policyName}`);
      } catch (err) {
        handlePermissionError.call(
          this,
          err,
          'Permission denied deleting deny policy. Skipping test.'
        );
      }
    });
  });
});
