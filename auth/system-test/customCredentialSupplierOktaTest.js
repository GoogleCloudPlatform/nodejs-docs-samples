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
  authenticateWithOktaCredentials,
} = require('../custom-credential-supplier-okta');

describe('Custom Credential Supplier Okta', () => {
  const audience = process.env.GCP_WORKLOAD_AUDIENCE;
  const bucketName = process.env.GCS_BUCKET_NAME;
  const impersonationUrl = process.env.GCP_SERVICE_ACCOUNT_IMPERSONATION_URL;

  it('should authenticate using Okta credentials', async function () {
    // Skip system tests if required environment variables are missing
    if (
      !process.env.OKTA_DOMAIN ||
      !process.env.OKTA_CLIENT_ID ||
      !process.env.OKTA_CLIENT_SECRET ||
      !audience ||
      !bucketName
    ) {
      this.skip();
    }

    const metadata = await authenticateWithOktaCredentials(
      bucketName,
      audience,
      process.env.OKTA_DOMAIN,
      process.env.OKTA_CLIENT_ID,
      process.env.OKTA_CLIENT_SECRET,
      impersonationUrl,
    );

    assert.strictEqual(metadata.name, bucketName);
    assert.ok(metadata.location);
  });
});
