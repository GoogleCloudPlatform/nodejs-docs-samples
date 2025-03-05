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

// This is a generated sample, using the typeless sample bot. Please
// look for the source TypeScript sample (.ts) for modifications.
'use strict';

// sample-metadata:
//   title: Detect password leak with reCAPTCHA Enterprise
//   description: Detect if the user credentials have been compromised as part of a data leak
//   usage: node passwordLeakAssessment.ts [project-id] [username] [password]

const args = process.argv.slice(2);
const [projectId, username, password] = args;

// [START recaptcha_enterprise_password_leak_verification]

import {RecaptchaEnterpriseServiceClient} from '@google-cloud/recaptcha-enterprise';
import {PasswordCheckVerification} from 'recaptcha-password-check-helpers';

// TODO(developer): Uncomment and set the following variables
// Google Cloud Project ID.
// const projectId: string = "PROJECT_ID"

// Username and password to be checked for credential breach.
// const username: string = "user123";
// const password: string = "1234@abcd";

// Create a client.
const client = new RecaptchaEnterpriseServiceClient();

/*
* Detect password leaks and breached credentials to prevent account takeovers
* (ATOs) and credential stuffing attacks.
* For more information, see:
* https://cloud.google.com/recaptcha-enterprise/docs/check-passwords and
* https://security.googleblog.com/2019/02/protect-your-accounts-from-data.html

* Steps:
* 1. Use the 'create' method to hash and Encrypt the hashed username and
* password.
* 2. Send the hash prefix (26-bit) and the encrypted credentials to create
* the assessment.(Hash prefix is used to partition the database.)
* 3. Password leak assessment returns a list of encrypted credential hashes to
* be compared with the decryption of the returned re-encrypted credentials.
* Create Assessment also sends back re-encrypted credentials.
* 4. The re-encrypted credential is then locally verified to see if there is
* a match in the database.
*
* To perform hashing, encryption and verification (steps 1, 2 and 4),
* reCAPTCHA Enterprise provides a helper library in Typescript.
* See, https://github.com/GoogleCloudPlatform/typescript-recaptcha-password-check-helpers

* If you want to extend this behavior to your own implementation/ languages,
* make sure to perform the following steps:
* 1. Hash the credentials (First 26 bits of the result is the
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
async function checkPasswordLeak(projectId, username, password) {
  // Instantiate the recaptcha-password-check-helpers library to perform the
  // cryptographic functions.
  // Create the request to obtain the hash prefix and encrypted credentials.
  const verification = await PasswordCheckVerification.create(
    username,
    password
  );

  const lookupHashPrefix = Buffer.from(
    verification.getLookupHashPrefix()
  ).toString('base64');
  const encryptedUserCredentialsHash = Buffer.from(
    verification.getEncryptedUserCredentialsHash()
  ).toString('base64');
  console.log('Hashes created.');

  // Pass the credentials to the createPasswordLeakAssessment() to get back
  // the matching database entry for the hash prefix.
  const credentials = await createPasswordLeakAssessment(
    projectId,
    lookupHashPrefix,
    encryptedUserCredentialsHash
  );

  // Convert to appropriate input format.
  const reencryptedUserCredentialsHash = Buffer.from(
    credentials.reencryptedUserCredentialsHash.toString(),
    'base64'
  );

  const encryptedLeakMatchPrefixes = credentials.encryptedLeakMatchPrefixes.map(
    prefix => {
      return Buffer.from(prefix.toString(), 'base64');
    }
  );

  // Verify if the encrypted credentials are present in the obtained
  // match list to check if the credential is leaked.
  const isLeaked = verification
    .verify(reencryptedUserCredentialsHash, encryptedLeakMatchPrefixes)
    .areCredentialsLeaked();

  console.log(`Is Credential leaked: ${isLeaked}`);
}

// Create a reCAPTCHA Enterprise assessment.
// Returns: PrivatePasswordLeakVerification which contains
// reencryptedUserCredentialsHash and credential breach database whose prefix
// matches the lookupHashPrefix.
async function createPasswordLeakAssessment(
  projectId,
  lookupHashPrefix,
  encryptedUserCredentialsHash
) {
  // Build the assessment request.
  const createAssessmentRequest = {
    parent: `projects/${projectId}`,
    assessment: {
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

  // Get the reCAPTCHA Enterprise score.
  console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
  // Get the assessment name (id). Use this to annotate the assessment.
  console.log(`Assessment name: ${response.name}`);

  if (!response.privatePasswordLeakVerification) {
    throw `Error in obtaining response from Private Password Leak Verification ${response}`;
  }

  return response.privatePasswordLeakVerification;
}

checkPasswordLeak(projectId, username, password).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
// [END recaptcha_enterprise_password_leak_verification]
module.exports = checkPasswordLeak
