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

async function main(
  projectId = 'your-project-id',
  locationId = 'us-east1',
  keyRingId = 'my-key-ring',
  keyId = 'my-key',
  versionId = '1',
  message = 'my message to verify',
  signatureBuffer = Buffer.from('...')
) {
  // [START kms_verify_asymmetric_signature_rsa]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'your-project-id';
  // const locationId = 'us-east1';
  // const keyRingId = 'my-key-ring';
  // const keyId = 'my-key';
  // const versionId = '1';
  // const message = 'my message to verify';
  // const signatureBuffer = Buffer.from('...');

  // Imports the Cloud KMS library
  const {KeyManagementServiceClient} = require('@google-cloud/kms');

  // Instantiates a client
  const client = new KeyManagementServiceClient();

  // Build the key name
  const versionName = client.cryptoKeyVersionPath(
    projectId,
    locationId,
    keyRingId,
    keyId,
    versionId
  );

  async function verifyAsymmetricSignatureRsa() {
    // Get public key
    const [publicKey] = await client.getPublicKey({
      name: versionName,
    });

    // Create the verifier. The algorithm must match the algorithm of the key.
    const crypto = require('crypto');
    const verify = crypto.createVerify('sha256');
    verify.update(message);
    verify.end();

    // Build the key object
    const key = {
      key: publicKey.pem,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    };

    // Verify the signature using the public key
    const verified = verify.verify(key, signatureBuffer);
    return verified;
  }

  return verifyAsymmetricSignatureRsa();
  // [END kms_verify_asymmetric_signature_rsa]
}
module.exports.main = main;

/* c8 ignore next 10 */
if (require.main === module) {
  main(...process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
