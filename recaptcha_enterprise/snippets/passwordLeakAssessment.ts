/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// sample-metadata:
//   title: Detect password leak with reCAPTCHA
//   description: Detect if the password credential has been compromised.
//   usage: node passwordLeakAssessment.ts [project-id] [sita-key] [token] [action]

const args = process.argv.slice(2);
const [projectId, siteKey, token, action, username, password] = args;

// [START recaptcha_enterprise_password_leak_verification]

import {google} from '@google-cloud/recaptcha-enterprise/build/protos/protos';
import {RecaptchaEnterpriseServiceClient} from '@google-cloud/recaptcha-enterprise';
import {PasswordCheckVerification} from 'recaptcha-password-check-helpers';

// TODO(developer): Uncomment and set the following variables
// Google Cloud Project ID.
// const projectId: string = "PROJECT_ID"

// Site key obtained by registering a domain/app to use recaptcha Enterprise.
// const siteKey: string = "RECAPTCHA_SITE_KEY"

// The token obtained from the client on passing the recaptchaSiteKey.
// To get the token, integrate the recaptchaSiteKey with frontend. See,
// https://cloud.google.com/recaptcha-enterprise/docs/instrument-web-pages#frontend_integration_score
// const token: string = "TOKEN"

// Action name corresponding to the token.
// const action: string = "ACTION"

// Username and password to be checked for credential breach.
// const username: string = "user123";
// const password: string = "1234@abcd";

// Create a client.
const client: RecaptchaEnterpriseServiceClient =
  new RecaptchaEnterpriseServiceClient();

/*
* Detect password leaks and breached credentials to prevent account takeovers
* (ATOs) and credential stuffing attacks.
* For more information, see:
* https://cloud.google.com/recaptcha-enterprise/docs/getting-started and
* https://security.googleblog.com/2019/02/protect-your-accounts-from-data.html

* Steps:
* 1. Use the 'create' method to hash and Encrypt the hashed username and
* password.
* 2. Send the hash prefix (2-byte) and the encrypted credentials to create
* the assessment.(Hash prefix is used to partition the database.)
* 3. Password leak assessment returns a database whose prefix matches the
* sent hash prefix.
* Create Assessment also sends back re-encrypted credentials.
* 4. The re-encrypted credential is then locally verified to see if there is
* a match in the database.
*
* To perform hashing, encryption and verification (steps 1, 2 and 4),
* reCAPTCHA Enterprise provides a helper library in Typescript.
* See, https://github.com/GoogleCloudPlatform/typescript-recaptcha-password-check-helpers

* If you want to extend this behavior to your own implementation/ languages,
* make sure to perform the following steps:
* 1. Hash the credentials (First 2 bytes of the result is the
* 'lookupHashPrefix')
* 2. Encrypt the hash (result = 'encryptedUserCredentialsHash')
* 3. Get back the PasswordLeak information from
* reCAPTCHA Enterprise Create Assessment.
* 4. Decrypt the obtained 'credentials.getReencryptedUserCredentialsHash()'
* with the same key you used for encryption.
* 5. Check if the decrypted credentials are present in
* 'credentials.getEncryptedLeakMatchPrefixesList()'.
* 6. If there is a match, that indicates a credential breach.
*/
async function checkPasswordLeak(
  projectId: string,
  recaptchaSiteKey: string,
  token: string,
  action: string,
  username: string,
  password: string
) {
  // Instantiate the recaptcha-password-check-helpers library to perform the
  // cryptographic functions.
  // Create the request to obtain the hash prefix and encrypted credentials.
  const verification: PasswordCheckVerification =
    await PasswordCheckVerification.create(username, password);

  const lookupHashPrefix: string = Buffer.from(
    verification.getLookupHashPrefix()
  ).toString('base64');
  const encryptedUserCredentialsHash: string = Buffer.from(
    verification.getEncryptedUserCredentialsHash()
  ).toString('base64');
  console.log('Hashes created.');

  // Pass the credentials to the createPasswordLeakAssessment() to get back
  // the matching database entry for the hash prefix.
  const credentials: google.cloud.recaptchaenterprise.v1.IPrivatePasswordLeakVerification =
    await createPasswordLeakAssessment(
      projectId,
      recaptchaSiteKey,
      token,
      action,
      lookupHashPrefix,
      encryptedUserCredentialsHash
    );

  // Convert to appropriate input format.
  const reencryptedUserCredentialsHash: Uint8Array = Buffer.from(
    credentials.reencryptedUserCredentialsHash!.toString(),
    'base64'
  );
  const encryptedLeakMatchPrefixes: Uint8Array[] =
    credentials.encryptedLeakMatchPrefixes!.map(prefix => {
      return Buffer.from(prefix.toString(), 'base64');
    });

  // Verify if the encrypted credentials are present in the obtained
  // match list to check if the credential is leaked.
  const isLeaked: boolean = verification
    .verify(reencryptedUserCredentialsHash, encryptedLeakMatchPrefixes)
    .areCredentialsLeaked();

  console.log(`Is Credential leaked: ${isLeaked}`);
}

// Create a reCAPTCHA Enterprise assessment.
// Returns: PrivatePasswordLeakVerification which contains
// reencryptedUserCredentialsHash and credential breach database whose prefix
// matches the lookupHashPrefix.
async function createPasswordLeakAssessment(
  projectId: string,
  recaptchaSiteKey: string,
  token: string,
  action: string,
  lookupHashPrefix: string,
  encryptedUserCredentialsHash: string
): Promise<google.cloud.recaptchaenterprise.v1.IPrivatePasswordLeakVerification> {
  // Build the assessment request.
  const createAssessmentRequest: google.cloud.recaptchaenterprise.v1.ICreateAssessmentRequest =
    {
      parent: `projects/${projectId}`,
      assessment: {
        // Set the properties of the event to be tracked.
        event: {
          siteKey: recaptchaSiteKey,
          token: token,
        },
        // Set the hashprefix and credentials hash.
        // Setting this will trigger the Password leak protection.
        privatePasswordLeakVerification: {
          lookupHashPrefix: lookupHashPrefix,
          encryptedUserCredentialsHash: encryptedUserCredentialsHash,
        },
      },
    };

  // Send the create assessment request.
  const [response] = await client.createAssessment(createAssessmentRequest);

  // Check validity and integrity of the response.
  await checkTokenIntegrity(response.tokenProperties!, action);
  // Get the reCAPTCHA Enterprise score.
  console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
  // Get the assessment name (id). Use this to annotate the assessment.
  console.log(`Assessment name: ${response.name}`);

  if (!response?.privatePasswordLeakVerification) {
    throw `Error in obtaining response from Private Password Leak Verification ${response}`;
  }

  return response.privatePasswordLeakVerification;
}

// Check for token validity and action integrity.
async function checkTokenIntegrity(
  tokenProperties: google.cloud.recaptchaenterprise.v1.ITokenProperties,
  action: string
) {
  if (!tokenProperties) {
    throw 'Token properties field is null or undefined.';
  }

  // Check if the token is valid.
  if (!tokenProperties.valid) {
    throw `The Password check call failed because the token was: 
    ${tokenProperties.invalidReason}`;
  }

  // Check if the expected action was executed.
  if (tokenProperties.action !== action) {
    throw `The action attribute in the reCAPTCHA tag 
    ${tokenProperties.action} does not match the action ${action} you 
    are expecting to score.`;
  }
}

checkPasswordLeak(projectId, siteKey, token, action, username, password).catch(
  err => {
    console.error(err.message);
    process.exitCode = 1;
  }
);
// [END recaptcha_enterprise_password_leak_verification]
