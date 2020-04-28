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

// [START kms_asymmetric_decrypt]
async function asymmetricDecrypt(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
  cryptoKeyVersionId = '1', // Version of the crypto key to use
  ciphertextBuffer = '...' // Buffer containing ciphertext to decrypt
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

  // Decrypt plaintext using Cloud KMS
  //
  // NOTE: The ciphertext must be properly formatted. In Node < 12, the
  // crypto.publicEncrypt() function does not properly consume the OAEP padding
  // and thus produces invalid ciphertext. If you are using Node to do public
  // key encryption, please use version 12+.
  const [result] = await client.asymmetricDecrypt({
    name: name,
    ciphertext: ciphertextBuffer,
  });
  const plaintext = result.plaintext.toString('utf8');

  // Example of printing results
  console.log(`Decrypted plaintext: ${plaintext}`);

  return plaintext;
}
// [END kms_asymmetric_decrypt]

const args = process.argv.slice(2);

// Base64-decode the ciphertext argument. The tests invoke these files via the
// shell, which doesn't support transferring a binary stream. As such, they
// encode the data first, so we need to decode it here before passing it to the
// function.
args[4] = Buffer.from(args[4], 'base64');

asymmetricDecrypt(...args).catch(console.error);
