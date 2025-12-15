'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  authenticateWithOktaCredentials,
} = require('../../../customcredentials/okta/customCredentialSupplierOkta.js');

describe('Custom Credential Supplier Okta', () => {
  const originalEnv = {};
  let bucketName,
    audience,
    impersonationUrl,
    oktaDomain,
    oktaClientId,
    oktaClientSecret;

  before(function () {
    const secretsPath = path.resolve(
      __dirname,
      '../../../customcredentials/okta/custom-credentials-okta-secrets.json'
    );

    if (fs.existsSync(secretsPath)) {
      try {
        const content = fs.readFileSync(secretsPath, 'utf8');
        const secrets = JSON.parse(content);

        const setEnv = (envKey, jsonKey) => {
          if (secrets[jsonKey]) {
            if (process.env[envKey] === undefined) {
              originalEnv[envKey] = undefined;
            } else if (
              !Object.prototype.hasOwnProperty.call(originalEnv, envKey)
            ) {
              originalEnv[envKey] = process.env[envKey];
            }
            process.env[envKey] = secrets[jsonKey];
          }
        };

        setEnv('GCP_WORKLOAD_AUDIENCE', 'gcp_workload_audience');
        setEnv('GCS_BUCKET_NAME', 'gcs_bucket_name');
        setEnv(
          'GCP_SERVICE_ACCOUNT_IMPERSONATION_URL',
          'gcp_service_account_impersonation_url'
        );
        setEnv('OKTA_DOMAIN', 'okta_domain');
        setEnv('OKTA_CLIENT_ID', 'okta_client_id');
        setEnv('OKTA_CLIENT_SECRET', 'okta_client_secret');
      } catch (err) {
        console.warn(
          'Failed to parse secrets file, relying on system env vars.',
          err
        );
      }
    }

    bucketName = process.env.GCS_BUCKET_NAME;
    audience = process.env.GCP_WORKLOAD_AUDIENCE;
    impersonationUrl = process.env.GCP_SERVICE_ACCOUNT_IMPERSONATION_URL;
    oktaDomain = process.env.OKTA_DOMAIN;
    oktaClientId = process.env.OKTA_CLIENT_ID;
    oktaClientSecret = process.env.OKTA_CLIENT_SECRET;

    if (
      !bucketName ||
      !audience ||
      !oktaDomain ||
      !oktaClientId ||
      !oktaClientSecret
    ) {
      console.log('Skipping Okta system test: Required configuration missing.');
      this.skip();
    }
  });

  after(() => {
    for (const key in originalEnv) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  it('should authenticate using Okta credentials', async () => {
    const metadata = await authenticateWithOktaCredentials(
      bucketName,
      audience,
      oktaDomain,
      oktaClientId,
      oktaClientSecret,
      impersonationUrl
    );

    assert.strictEqual(metadata.name, bucketName);
    assert.ok(metadata.location);
  });
});
