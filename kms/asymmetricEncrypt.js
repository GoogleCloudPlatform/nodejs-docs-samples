// Copyright 2019 Google LLC
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

// [START kms_asymmetric_encrypt]
async function asymmetricEncrypt(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
  cryptoKeyVersionId = '1', // Version of the crypto key to use
  plaintext = 'my data to encrypt' // Plaintext data to encrypt
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key's key ring, e.g. "global"
  const locationId = 'global';

  // Construct the crypto key version ID
  const name = client.cryptoKeyVersionPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId,
    cryptoKeyVersionId
  );

  // Get public key from Cloud KMS
  const [publicKey] = await client.getPublicKey({name: name});

  // Import and setup crypto
  const crypto = require('crypto');
  const plaintextBuffer = Buffer.from(plaintext);

  // Encrypt plaintext locally using the public key. This example uses a key
  // that was configured with sha256 hash with OAEP padding. Update these values
  // to match the Cloud KMS key.
  //
  // NOTE: In Node < 12, this function does not properly consume the OAEP
  // padding and thus produces invalid ciphertext. If you are using Node to do
  // public key encryption, please use version 12+.
  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: publicKey.pem,
      oaepHash: 'sha256',
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    plaintextBuffer
  );

  // Example of how to display ciphertext. Because the ciphertext is in a binary
  // format, you need to encode the output before printing it to a console or
  // displaying it on a screen.
  const encoded = encryptedBuffer.toString('base64');
  console.log(`Encrypted ciphertext: ${encoded}`);

  // Return the ciphertext buffer
  return encryptedBuffer;
}
// [END kms_asymmetric_encrypt]

const args = process.argv.slice(2);
asymmetricEncrypt(...args).catch(console.error);
