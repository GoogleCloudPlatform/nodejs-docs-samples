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
    const hash = crypto.createHash('sha256');
    hash.update(message);
    const digest = hash.digest();

    // Optional but recommended: Compute digest's CRC32C.
    // Ensure fast-crc32c has been installed, `npm i fast-crc32c`.
    const crc32c = require('fast-crc32c');
    const digestCrc32c = crc32c.calculate(digest);

    // Sign the message with Cloud KMS
    const [signResponse] = await client.asymmetricSign({
      name: versionName,
      digest: {
        sha256: digest,
      },
      digestCrc32c: {
        value: digestCrc32c,
      },
    });

    // Optional, but recommended: perform integrity verification on signResponse.
    // For more details on ensuring E2E in-transit integrity to and from Cloud KMS visit:
    // https://cloud.google.com/kms/docs/data-integrity-guidelines
    if (signResponse.name !== versionName) {
      throw new Error('AsymmetricSign: request corrupted in-transit');
    }
    if (!signResponse.verifiedDigestCrc32c) {
      throw new Error('AsymmetricSign: request corrupted in-transit');
    }
    if (
      crc32c.calculate(signResponse.signature) !==
      Number(signResponse.signatureCrc32c.value)
    ) {
      throw new Error('AsymmetricSign: response corrupted in-transit');
    }

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
