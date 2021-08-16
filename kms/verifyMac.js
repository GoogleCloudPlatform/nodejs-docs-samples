// Copyright 2021 Google LLC
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
  data = Buffer.from('...'),
  signature = Buffer.from('...')
) {
  // [START kms_verify_mac]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'your-project-id';
  // const locationId = 'us-east1';
  // const keyRingId = 'my-key-ring';
  // const keyId = 'my-key';
  // const versionId = '123';
  // const data = Buffer.from('...');
  // const signature = Buffer.from('...');

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

  async function verifyMac() {
    // Verify the data with Cloud KMS
    const [verifyResponse] = await client.macVerify({
      name: versionName,
      data: data,
      mac: signature,
    });

    console.log(`Verified: ${verifyResponse.success}`);
    return verifyResponse;
  }

  return verifyMac();
  // [END kms_verify_mac]
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
