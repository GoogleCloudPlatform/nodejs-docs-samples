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
const {Gaxios} = require('gaxios');

/**
 * A custom SubjectTokenSupplier that authenticates with Okta using the
 * Client Credentials grant flow.
 */
class OktaClientCredentialsSupplier {
  constructor(domain, clientId, clientSecret) {
    this.oktaTokenUrl = `${domain}/oauth2/default/v1/token`;
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
  // 1. Instantiate the custom supplier.
  const oktaSupplier = new OktaClientCredentialsSupplier(
    domain,
    clientId,
    clientSecret
  );

  // 2. Instantiate an IdentityPoolClient with the required configuration.
  const client = new IdentityPoolClient({
    audience: audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    subject_token_supplier: oktaSupplier,
    service_account_impersonation_url: impersonationUrl,
  });

  // 3. Make an authenticated request.
  const bucketUrl = `https://storage.googleapis.com/storage/v1/b/${bucketName}`;
  const res = await client.request({url: bucketUrl});
  return res.data;
}
// [END auth_custom_credential_supplier_okta]

async function main() {
  require('dotenv').config();
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
    throw new Error('Missing required environment variables for Okta/GCP.');
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
    console.log('Bucket Name:', bucketMetadata.name);
    console.log('Bucket Location:', bucketMetadata.location);
  } catch (error) {
    console.error('\n--- FAILED ---');
    console.error(error.response?.data || error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

exports.authenticateWithOktaCredentials = authenticateWithOktaCredentials;
