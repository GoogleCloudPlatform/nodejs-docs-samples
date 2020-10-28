// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START functions_secret_rotate]
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const crypto = require('crypto');

// Instantiates a secret manager client.
const client = new SecretManagerServiceClient();

// The secret to rotate.
const secret_name = process.env.SECRET_NAME;

// Process a rotate notification to add a new SecretVersion to an existing
// Secret.
exports.rotate = async (event, context) => {
    // Print the message data
    console.log(`Received: ${event}`);
    console.log(`Context: ${context}`);

    // If the same topic is use for multiple secret rotators then we must check
    // that the message is for the same secret that this function should rotate.
    let request = Buffer.from(event.data, 'base64').toString()
    console.log(`Requested rotation: ${request}`);
    if (request != secret_name) {
        console.error(`Ignoring. Expected rotation for: ${secret_name}`);
    }

    console.log(`Generating new secret version`);

    const [version] = await client.addSecretVersion({
        parent: secret_name,
        payload: {
            // Add random data as the secret value.
            data: Buffer.from(crypto.randomBytes(32).toString('hex'), 'utf-8'),
        },
    });

    console.log(`Added secret version ${version.name}`);
};
// [END functions_secret_rotate]
