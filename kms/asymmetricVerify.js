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

// [START kms_asymmetric_verify]
async function asymmetricVerify(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
  cryptoKeyVersionId = '1', // Version of the crypto key to use
  message = 'my message to verify', // Message data to verify
  signatureBuffer = '...' // Buffer containing signature to decrypt
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

  // Create the verifier. The algorithm must match the algorithm of the key.
  const crypto = require('crypto');
  const verify = crypto.createVerify('SHA384');
  verify.write(message);
  verify.end();

  // Verify the signature using the public key
  const verified = verify.verify(publicKey.pem, signatureBuffer);

  // Example of printing result
  console.log(`Signature verified: ${verified}`);

  // Return boolean result
  return verified;
}
// [END kms_asymmetric_verify]

const args = process.argv.slice(2);

// Base64-decode the signature argument. The tests invoke these files via the
// shell, which doesn't support transferring a binary stream. As such, they
// encode the data first, so we need to decode it here before passing it to the
// function.
args[5] = Buffer.from(args[5], 'base64');

asymmetricVerify(...args).catch(console.error);
