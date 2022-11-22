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
  projectId = 'my-project',
  locationId = 'us-east1',
  keyRingId = 'my-key-ring',
  keyId = 'my-key',
  versionId = '123',
  plaintextBuffer = Buffer.from('...')
) {
  // [START kms_encrypt_asymmetric]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'my-project';
  // const locationId = 'us-east1';
  // const keyRingId = 'my-key-ring';
  // const keyId = 'my-key';
  // const versionId = '123';
  // const plaintextBuffer = Buffer.from('...');

  // Imports the Cloud KMS library
  const {KeyManagementServiceClient} = require('@google-cloud/kms');

  // Instantiates a client
  const client = new KeyManagementServiceClient();

  // Build the key version name
  const versionName = client.cryptoKeyVersionPath(
    projectId,
    locationId,
    keyRingId,
    keyId,
    versionId
  );

  async function encryptAsymmetric() {
    // Get public key from Cloud KMS
    const [publicKey] = await client.getPublicKey({
      name: versionName,
    });

    // Optional, but recommended: perform integrity verification on publicKey.
    // For more details on ensuring E2E in-transit integrity to and from Cloud KMS visit:
    // https://cloud.google.com/kms/docs/data-integrity-guidelines
    const crc32c = require('fast-crc32c');
    if (publicKey.name !== versionName) {
      throw new Error('GetPublicKey: request corrupted in-transit');
    }
    if (crc32c.calculate(publicKey.pem) !== Number(publicKey.pemCrc32c.value)) {
      throw new Error('GetPublicKey: response corrupted in-transit');
    }

    // Import and setup crypto
    const crypto = require('crypto');

    // Encrypt plaintext locally using the public key. This example uses a key
    // that was configured with sha256 hash with OAEP padding. Update these
    // values to match the Cloud KMS key.
    //
    // NOTE: In Node < 12, this function does not properly consume the OAEP
    // padding and thus produces invalid ciphertext. If you are using Node to do
    // public key encryption, please use version 12+.
    const ciphertextBuffer = crypto.publicEncrypt(
      {
        key: publicKey.pem,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      plaintextBuffer
    );

    console.log(`Ciphertext: ${ciphertextBuffer.toString('base64')}`);
    return ciphertextBuffer;
  }

  return encryptAsymmetric();
  // [END kms_encrypt_asymmetric]
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
