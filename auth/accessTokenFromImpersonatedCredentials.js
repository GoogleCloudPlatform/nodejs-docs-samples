// Copyright 2023 Google LLC
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

/**
 * Uses a service account (SA1) to impersonate another service account (SA2) to obtain an id token for the impersonated account.
 * To obtain a token for SA2, SA1 should have the "roles/iam.serviceAccountTokenCreator" permission on SA2.
 *
 * @param {string} scope - The scope that you might need to request to access Google APIs,
 *   depending on the level of access you need. For this example, we use the cloud-wide scope
 *   and use IAM to narrow the permissions: https://cloud.google.com/docs/authentication#authorization_for_services.
 *   For more information, see: https://developers.google.com/identity/protocols/oauth2/scopes.
 * @param {string} impersonatedServiceAccount - The name of the privilege-bearing service account for whom
 *  the credential is created.
 */
function main(impersonatedServiceAccount, scope) {
  // [START auth_cloud_accesstoken_impersonated_credentials]
  /**
   * TODO(developer):
   *  Uncomment and replace these variables before running the sample.
   */
  // const impersonatedServiceAccount = 'name@project.service.gserviceaccount.com';
  // const scope = 'https://www.googleapis.com/auth/cloud-platform';

  const {GoogleAuth, Impersonated} = require('google-auth-library');

  async function getAccessTokenFromImpersonatedCredentials() {
    const googleAuth = new GoogleAuth({
      scopes: scope,
    });
    // Construct the GoogleCredentials object which obtains the default configuration from your
    // working environment.
    const {credential} = await googleAuth.getApplicationDefault();

    // delegates: The chained list of delegates required to grant the final accessToken.
    // For more information, see:
    // https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#sa-credentials-permissions
    // Delegate is NOT USED here.
    const delegates = [];

    // Create the impersonated credential.
    const impersonatedCredentials = new Impersonated({
      sourceClient: credential,
      delegates,
      targetPrincipal: impersonatedServiceAccount,
      targetScopes: [scope],
      lifetime: 300,
    });

    // Get the OAuth2 token.
    // Once you've obtained the OAuth2 token, you can use it to make an authenticated call
    // to the target audience.
    const resp = await impersonatedCredentials.getAccessToken();
    // Token is in resp.token.
    console.log('Generated OAuth2 token with length %s', resp.token.length);
  }

  getAccessTokenFromImpersonatedCredentials();
  // [END auth_cloud_accesstoken_impersonated_credentials]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
