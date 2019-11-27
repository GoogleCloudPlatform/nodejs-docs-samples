// Copyright 2018 Google LLC
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

// [START kms_encrypt]
async function encrypt(
  projectId = 'your-project-id', // Your GCP projectId
  keyRingId = 'my-key-ring', // Name of the crypto key's key ring
  cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
  plaintextFileName = './path/to/plaintext.txt',
  ciphertextFileName = './path/to/plaintext.txt.encrypted'
) {
  const fs = require('fs');
  const {promisify} = require('util');

  // Import the library and create a client
  const kms = require('@google-cloud/kms');
  const client = new kms.KeyManagementServiceClient();

  // The location of the crypto key's key ring, e.g. "global"
  const locationId = 'global';

  // Reads the file to be encrypted
  const readFile = promisify(fs.readFile);
  const plaintext = await readFile(plaintextFileName);
  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  // Encrypts the file using the specified crypto key
  const [result] = await client.encrypt({name, plaintext});
  const writeFile = promisify(fs.writeFile);
  await writeFile(ciphertextFileName, result.ciphertext);
  console.log(`Encrypted ${plaintextFileName} using ${result.name}.`);
  console.log(`Result saved to ${ciphertextFileName}.`);
}
// [END kms_encrypt]

const args = process.argv.slice(2);
encrypt(...args).catch(console.error);
