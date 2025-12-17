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
const fs = require('fs');
const path = require('path');
const {
  authenticateWithAwsCredentials,
} = require('../../../customcredentials/aws/customCredentialSupplierAws.js');

describe('Custom Credential Supplier AWS', () => {
  // Variables to hold the original environment to restore after tests
  const originalEnv = {};

  // The configuration we need to run the test
  let bucketName, audience, impersonationUrl;

  before(function () {
    const secretsPath = path.resolve(
      __dirname,
      '../../../customcredentials/aws/custom-credentials-aws-secrets.json'
    );

    if (fs.existsSync(secretsPath)) {
      try {
        const content = fs.readFileSync(secretsPath, 'utf8');
        const secrets = JSON.parse(content);

        // Helper to safely set env var if it exists in the JSON
        const setEnv = (envKey, jsonKey) => {
          if (secrets[jsonKey]) {
            // Save original value to restore later
            if (process.env[envKey] === undefined) {
              originalEnv[envKey] = undefined; // Mark that it was undefined
            } else if (
              !Object.prototype.hasOwnProperty.call(originalEnv, envKey)
            ) {
              originalEnv[envKey] = process.env[envKey];
            }
            process.env[envKey] = secrets[jsonKey];
          }
        };

        // Map JSON keys to Environment Variables
        setEnv('GCP_WORKLOAD_AUDIENCE', 'gcp_workload_audience');
        setEnv('GCS_BUCKET_NAME', 'gcs_bucket_name');
        setEnv(
          'GCP_SERVICE_ACCOUNT_IMPERSONATION_URL',
          'gcp_service_account_impersonation_url'
        );
        setEnv('AWS_ACCESS_KEY_ID', 'aws_access_key_id');
        setEnv('AWS_SECRET_ACCESS_KEY', 'aws_secret_access_key');
        setEnv('AWS_REGION', 'aws_region');
      } catch (err) {
        console.warn(
          'Failed to parse secrets file, relying on system env vars.',
          err
        );
      }
    }

    // Extract values from the Environment (whether from file or system)
    bucketName = process.env.GCS_BUCKET_NAME;
    audience = process.env.GCP_WORKLOAD_AUDIENCE;
    impersonationUrl = process.env.GCP_SERVICE_ACCOUNT_IMPERSONATION_URL;
    const awsKey = process.env.AWS_ACCESS_KEY_ID;
    const awsSecret = process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = process.env.AWS_REGION;

    // Skip test if requirements are missing (mimics Java assumeTrue)
    if (!bucketName || !audience || !awsKey || !awsSecret || !awsRegion) {
      console.log('Skipping AWS system test: Required configuration missing.');
      this.skip();
    }
  });

  after(() => {
    // Restore environment variables to their original state
    for (const key in originalEnv) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  it('should authenticate using AWS credentials', async () => {
    // Act
    const metadata = await authenticateWithAwsCredentials(
      bucketName,
      audience,
      impersonationUrl
    );

    // Assert
    assert.strictEqual(metadata.name, bucketName);
    assert.ok(metadata.location);
  });
});
