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

// [START recaptcha_enterprise_password_leak_verification]

import {google} from '@google-cloud/recaptcha-enterprise/build/protos/protos';
import yargs from 'yargs';
import TokenProperties = google.cloud.recaptchaenterprise.v1.TokenProperties;

class Main {
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
  async checkPasswordLeak(
    projectId: string,
    recaptchaSiteKey: string,
    token: string,
    action: string
  ) {
    // Set the username and password to be checked.
    const username = 'username';
    const password = 'password123';

    // Instantiate the recaptcha-password-check-helpers library to perform the
    // cryptographic functions.
    const passwordCheckVerifier = require('recaptcha-password-check-helpers');
    // Create the request to obtain the hash prefix and encrypted credentials.
    const verification =
      await passwordCheckVerifier.PasswordCheckVerification.create(
        username,
        password
      );

    const lookupHashPrefix = Buffer.from(
      verification.getLookupHashPrefix()
    ).toString('base64');
    const encryptedUserCredentialsHash = Buffer.from(
      verification.getEncryptedUserCredentialsHash()
    ).toString('base64');

    // Pass the credentials to the createPasswordLeakAssessment() to get back
    // the matching database entry for the hash prefix.
    const credentials = await Main.createPasswordLeakAssessment(
      projectId,
      recaptchaSiteKey,
      token,
      action,
      lookupHashPrefix,
      encryptedUserCredentialsHash
    );

    // Convert to appropriate input format.
    const reencryptedUserCredentialsHash = Buffer.from(
      credentials.reencryptedUserCredentialsHash,
      'base64'
    );
    const encryptedLeakMatchPrefixes =
      credentials.encryptedLeakMatchPrefixes.map(prefix => {
        return Buffer.from(prefix, 'base64');
      });

    // Verify if the encrypted credentials are present in the obtained
    // match list to check if the credential is leaked.
    const isLeaked = verification
      .verify(reencryptedUserCredentialsHash, encryptedLeakMatchPrefixes)
      .areCredentialsLeaked();

    console.log(`Is Credential leaked: ${isLeaked}`);
  }

  // Create a reCAPTCHA Enterprise assessment.
  // Returns:  PrivatePasswordLeakVerification which contains
  // reencryptedUserCredentialsHash and credential breach database
  // whose prefix matches the lookupHashPrefix.
  private static async createPasswordLeakAssessment(
    projectId: string,
    recaptchaSiteKey: string,
    token: string,
    action: string,
    lookupHashPrefix: string,
    encryptedUserCredentialsHash: string
  ) {
    const {recaptchaClient} = require('@google-cloud/recaptcha-enterprise').v1;

    // Build the assessment request.
    const createAssessmentRequest = {
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
    const response = await recaptchaClient.createAssessment(
      createAssessmentRequest
    );

    // Check validity and integrity of the response.
    await Main.checkTokenIntegrity(response.tokenProperties, action);

    // Get the reCAPTCHA Enterprise score.
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
    // Get the assessment name (id). Use this to annotate the assessment.
    console.log(`Assessment name: ${response.name}`);

    return response.privatePasswordLeakVerification;
  }

  // Check for token validity and action integrity.
  private static async checkTokenIntegrity(
    tokenProperties: TokenProperties,
    action: string
  ) {
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
}

const parser = yargs(process.argv.slice(2)).options({
  // GCloud Project ID.
  projectId: {type: 'string', alias: 'project_id', demandOption: true},

  // Site key obtained by registering a domain/app to use recaptcha Enterprise.
  siteKey: {type: 'string', alias: 'reCAPTCHA_site_key', demandOption: true},

  // The token obtained from the client on passing the recaptchaSiteKey.
  // To get the token, integrate the recaptchaSiteKey with frontend. See,
  // https://cloud.google.com/recaptcha-enterprise/docs/instrument-web-pages#frontend_integration_score
  token: {type: 'string', alias: 'token', demandOption: true},

  // Action name corresponding to the token.
  action: {type: 'string', alias: 'action', demandOption: true},
});
(async () => {
  const {projectId, siteKey, token, action} = await parser.argv;
  const main = new Main();
  await main.checkPasswordLeak(projectId, siteKey, token, action);
})();

// [END recaptcha_enterprise_password_leak_verification]
