// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');
const {
  authenticateWithAwsCredentials,
} = require('../custom-credential-supplier-aws');

describe('Custom Credential Supplier AWS', () => {
  const audience = process.env.GCP_WORKLOAD_AUDIENCE;
  const bucketName = process.env.GCS_BUCKET_NAME;
  const impersonationUrl = process.env.GCP_SERVICE_ACCOUNT_IMPERSONATION_URL;

  it('should authenticate using AWS credentials', async function () {
    // Skip system tests if required environment variables are missing
    if (
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.AWS_REGION ||
      !audience ||
      !bucketName
    ) {
      this.skip();
    }

    const metadata = await authenticateWithAwsCredentials(
      bucketName,
      audience,
      impersonationUrl,
    );

    assert.strictEqual(metadata.name, bucketName);
    assert.ok(metadata.location);
  });
});
