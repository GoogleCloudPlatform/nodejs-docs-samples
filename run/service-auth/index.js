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

// [START auth_validate_and_decode_bearer_token_on_express]
// [START cloudrun_service_to_service_receive]
'use strict';

const express = require('express');
const gcpMetadata = require('gcp-metadata');

const {OAuth2Client} = require('google-auth-library');
const {ServicesClient} = require('@google-cloud/run').v2;
const {StatusCodes} = require('http-status-codes');

const app = express();
const oAuth2Client = new OAuth2Client();
const runServicesClient = new ServicesClient();

// Get project and instance parameters to retrieve the Service URI
async function getServiceURI() {
  const projectId = await gcpMetadata.project('project-id');

  // Returns 'projects/PROJECT-NUMBER/regions/REGION'
  const projectRegion = await gcpMetadata.instance('region').split('/');
  const region = projectRegion[3];

  const serviceName = process.env.K_SERVICE;

  const fullServiceName = `projects/${projectId}/locations/${region}/services/${serviceName}`;

  const response = await runServicesClient.getService({
    name: fullServiceName,
  });
  const serviceURI = response.url;

  console.log(response);
  console.log(serviceURI);

  return serviceURI;
}

// Parse and verify the token. Returns the email in the token.
async function parseAuthHeader(request) {
  const authHeader = request.headers.authorization;
  if (authHeader) {
    // Split the auth type and token value from the Authorization header.
    const [type, idToken] = authHeader.split(' ');

    if (type.toLowerCase() === 'bearer') {
      // More info on verifyIdToken:
      // https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest#verifying-id-tokens
      try {
        const audience = await getServiceURI();
        console.log(`Required audience: ${audience}`);

        // https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest/google-auth-library/oauth2client#google_auth_library_OAuth2Client_verifyIdToken_member_1_
        const loginTicket = await oAuth2Client.verifyIdToken({
          idToken,
          audience,
        });
        const tokenPayload = loginTicket.getPayload();

        return tokenPayload.email;
      } catch (err) {
        console.log(`Invalid token: ${err.message}\n`);
        return;
      }
    } else {
      console.log(`Unhandled header format(${type}).\n`);
      return;
    }
  }
}

app.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const email = await parseAuthHeader(req);

    if (email) {
      return res.status(StatusCodes.OK).send(`Hello, ${email}.\n`);
    }
  }

  // Indicate that the request must be authenticated
  // and that Bearer auth is the permitted authentication scheme.
  res.set('WWW-Authenticate', 'Bearer');

  return res
    .status(StatusCodes.UNAUTHORIZED)
    .send('Unauthorized request. Please supply a valid bearer token.\n');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// [END cloudrun_service_to_service_receive]
// [END auth_validate_and_decode_bearer_token_on_express]

module.exports = app;
