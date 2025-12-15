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

// [START auth_custom_credential_supplier_okta]
const {IdentityPoolClient} = require('google-auth-library');
const {Storage} = require('@google-cloud/storage');
const {Gaxios} = require('gaxios');
const fs = require('fs');
const path = require('path');

/**
 * A custom SubjectTokenSupplier that authenticates with Okta using the
 * Client Credentials grant flow.
 */
class OktaClientCredentialsSupplier {
  constructor(domain, clientId, clientSecret) {
    // Ensure domain URL is clean
    const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
    this.oktaTokenUrl = `${cleanDomain}/oauth2/default/v1/token`;

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.expiryTime = 0;
    this.gaxios = new Gaxios();
  }

  /**
   * Main method called by the auth library. It will fetch a new token if one
   * is not already cached.
   * @returns {Promise<string>} A promise that resolves with the Okta Access token.
   */
  async getSubjectToken() {
    // Check if the current token is still valid (with a 60-second buffer).
    const isTokenValid =
      this.accessToken && Date.now() < this.expiryTime - 60 * 1000;

    if (isTokenValid) {
      return this.accessToken;
    }

    const {accessToken, expiresIn} = await this.fetchOktaAccessToken();
    this.accessToken = accessToken;
    this.expiryTime = Date.now() + expiresIn * 1000;
    return this.accessToken;
  }

  /**
   * Performs the Client Credentials grant flow with Okta.
   */
  async fetchOktaAccessToken() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'gcp.test.read');

    const authHeader =
      'Basic ' +
      Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await this.gaxios.request({
        url: this.oktaTokenUrl,
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: params.toString(),
      });

      const {access_token, expires_in} = response.data;
      if (access_token && expires_in) {
        return {accessToken: access_token, expiresIn: expires_in};
      } else {
        throw new Error(
          'Access token or expires_in not found in Okta response.'
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to authenticate with Okta: ${error.response?.data || error.message}`
      );
    }
  }
}

/**
 * Authenticates with Google Cloud using Okta credentials and retrieves bucket metadata.
 *
 * @param {string} bucketName The name of the bucket to retrieve.
 * @param {string} audience The Workload Identity Pool audience.
 * @param {string} domain The Okta domain.
 * @param {string} clientId The Okta client ID.
 * @param {string} clientSecret The Okta client secret.
 * @param {string} [impersonationUrl] Optional Service Account impersonation URL.
 */
async function authenticateWithOktaCredentials(
  bucketName,
  audience,
  domain,
  clientId,
  clientSecret,
  impersonationUrl
) {
  const oktaSupplier = new OktaClientCredentialsSupplier(
    domain,
    clientId,
    clientSecret
  );

  const authClient = new IdentityPoolClient({
    audience: audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    subject_token_supplier: oktaSupplier,
    service_account_impersonation_url: impersonationUrl,
  });

  const storage = new Storage({
    authClient: authClient,
  });

  const [metadata] = await storage.bucket(bucketName).getMetadata();
  return metadata;
}
// [END auth_custom_credential_supplier_okta]

/**
 * If a local secrets file is present, load it into the process environment.
 * This is a "just-in-time" configuration for local development. These
 * variables are only set for the current process.
 */
function loadConfigFromFile() {
  const secretsFile = 'custom-credentials-okta-secrets.json';
  const secretsPath = path.resolve(__dirname, secretsFile);

  if (!fs.existsSync(secretsPath)) {
    return;
  }

  try {
    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

    if (!secrets) {
      return;
    }

    // Map JSON keys (snake_case) to Environment Variables (UPPER_CASE)
    if (secrets.gcp_workload_audience) {
      process.env.GCP_WORKLOAD_AUDIENCE = secrets.gcp_workload_audience;
    }
    if (secrets.gcs_bucket_name) {
      process.env.GCS_BUCKET_NAME = secrets.gcs_bucket_name;
    }
    if (secrets.gcp_service_account_impersonation_url) {
      process.env.GCP_SERVICE_ACCOUNT_IMPERSONATION_URL =
        secrets.gcp_service_account_impersonation_url;
    }
    if (secrets.okta_domain) {
      process.env.OKTA_DOMAIN = secrets.okta_domain;
    }
    if (secrets.okta_client_id) {
      process.env.OKTA_CLIENT_ID = secrets.okta_client_id;
    }
    if (secrets.okta_client_secret) {
      process.env.OKTA_CLIENT_SECRET = secrets.okta_client_secret;
    }
  } catch (error) {
    console.error(`Error reading secrets file: ${error.message}`);
  }
}

// Load the configuration from the file when the module is loaded.
loadConfigFromFile();

async function main() {
  const gcpAudience = process.env.GCP_WORKLOAD_AUDIENCE;
  const saImpersonationUrl = process.env.GCP_SERVICE_ACCOUNT_IMPERSONATION_URL;
  const gcsBucketName = process.env.GCS_BUCKET_NAME;
  const oktaDomain = process.env.OKTA_DOMAIN;
  const oktaClientId = process.env.OKTA_CLIENT_ID;
  const oktaClientSecret = process.env.OKTA_CLIENT_SECRET;

  if (
    !gcpAudience ||
    !gcsBucketName ||
    !oktaDomain ||
    !oktaClientId ||
    !oktaClientSecret
  ) {
    throw new Error(
      'Missing required configuration. Please provide it in a ' +
        'secrets.json file or as environment variables.'
    );
  }

  try {
    console.log(`Retrieving metadata for bucket: ${gcsBucketName}...`);
    const bucketMetadata = await authenticateWithOktaCredentials(
      gcsBucketName,
      gcpAudience,
      oktaDomain,
      oktaClientId,
      oktaClientSecret,
      saImpersonationUrl
    );
    console.log('\n--- SUCCESS! ---');
    console.log('Bucket Metadata:', JSON.stringify(bucketMetadata, null, 2));
  } catch (error) {
    console.error('\n--- FAILED ---');
    console.error(error.message || error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

exports.authenticateWithOktaCredentials = authenticateWithOktaCredentials;
