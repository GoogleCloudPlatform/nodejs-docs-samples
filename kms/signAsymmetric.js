// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START kms_sign_asymmetric]
async function main(
  projectId = 'your-project-id',
  locationId = 'us-east1',
  keyRingId = 'my-key-ring',
  keyId = 'my-key',
  versionId = '123',
  message = Buffer.from('...')
) {
  // [START kms_sign_asymmetric]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'your-project-id';
  // const locationId = 'us-east1';
  // const keyRingId = 'my-key-ring';
  // const keyId = 'my-key';
  // const versionId = '123';
  // const message = Buffer.from('...');

  // Imports the Cloud KMS library
  const {KeyManagementServiceClient} = require('@google-cloud/kms');

  // Instantiates a client
  const client = new KeyManagementServiceClient();

  // Build the version name
  const versionName = client.cryptoKeyVersionPath(
    projectId,
    locationId,
    keyRingId,
    keyId,
    versionId
  );

  async function signAsymmetric() {
    // Create a digest of the message. The digest needs to match the digest
    // configured for the Cloud KMS key.
    const crypto = require('crypto');
    const digest = crypto.createHash('sha256');
    digest.update(message);

    // Sign the message with Cloud KMS
    const [signResponse] = await client.asymmetricSign({
      name: versionName,
      digest: {
        sha256: digest.digest(),
      },
    });

    // Example of how to display signature. Because the signature is in a binary
    // format, you need to encode the output before printing it to a console or
    // displaying it on a screen.
    const encoded = signResponse.signature.toString('base64');
    console.log(`Signature: ${encoded}`);

    return signResponse.signature;
  }

  return signAsymmetric();
  // [END kms_sign_asymmetric]
}
module.exports.main = main;

/* c8 ignore next 4 */
if (require.main === module) {
  const args = process.argv.slice(2);
  main(...args).catch(console.error);
}
