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

// [START kms_asymmetric_sign]
async function asymmetricSign(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
  cryptoKeyVersionId = '1', // Version of the crypto key to use
  message = 'my message to sign' // Message data to sign
) {
  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key's key ring, e.g. "global"
  const locationId = 'global';

  // Construct the cyrpto key version ID
  const name = client.cryptoKeyVersionPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId,
    cryptoKeyVersionId
  );

  // Create a digest of the message. The digest needs to match the digest
  // configured for the Cloud KMS key.
  const crypto = require('crypto');
  const digest = crypto.createHash('sha384');
  digest.update(message);

  // Sign the message with Cloud KMS
  const [result] = await client.asymmetricSign({
    name: name,
    digest: {
      sha384: digest.digest(),
    },
  });

  // Example of how to display signature. Because the signature is in a binary
  // format, you need to encode the output before printing it to a console or
  // displaying it on a screen.
  const encoded = result.signature.toString('base64');
  console.log(`Signature: ${encoded}`);

  // Return the signature buffer
  return result.signature;
}
// [END kms_asymmetric_sign]

const args = process.argv.slice(2);
asymmetricSign(...args).catch(console.error);
