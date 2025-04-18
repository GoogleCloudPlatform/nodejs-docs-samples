// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(req) {
  // [START auth_validate_and_decode_bearer_token_on_express]
  // [START cloudrun_service_to_service_receive]
  const {OAuth2Client} = require('google-auth-library');

  const client = new OAuth2Client();

  // Inner function that parses and verifies the token.
  async function receiveRequestAndParseAuthHeader(request) {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      // Split the auth type and token value from the Authorization header.
      const [type, token] = authHeader.split(' ');

      if (type.toLowerCase() === 'bearer') {
        // More info on verifyIdToken:
        // https://github.com/googleapis/google-auth-library-nodejs/blob/main/samples/verifyIdToken-iap.js
        try {
          const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
          });
          const payload = ticket.getPayload();
          console.log(`Hello, ${payload.email}!\n`);
          return;
        } catch (err) {
          console.log(`Invalid token: ${err.message}\n`);
          return;
        }
      } else {
        console.log(`Unhandled header format(${type}).\n`);
        return;
      }
    }

    console.log('Hello, anonymous user.\n');
  }

  await receiveRequestAndParseAuthHeader(req);
}
// [END cloudrun_service_to_service_receive]
// [END auth_validate_and_decode_bearer_token_on_express]

module.exports = {main};
