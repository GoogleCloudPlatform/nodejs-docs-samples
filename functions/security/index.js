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

// [START functions_bearer_token]
const fetch = require('node-fetch');

// TODO(developer): set these values
const REGION = 'us-central1';
const PROJECT_ID = 'my-project-id';
const RECEIVING_FUNCTION = 'myFunction';

// Constants for setting up metadata server request
// See https://cloud.google.com/functions/docs/securing/function-identity#identity_tokens
const functionURL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${RECEIVING_FUNCTION}`;
const metadataServerURL =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=';
const tokenUrl = metadataServerURL + functionURL;

exports.callingFunction = async (req, res) => {
  // Fetch the token
  const tokenResponse = await fetch(tokenUrl, {
    headers: {
      'Metadata-Flavor': 'Google',
    },
  });
  const token = await tokenResponse.text();

  // Provide the token in the request to the receiving function
  try {
    const functionResponse = await fetch(functionURL, {
      headers: {Authorization: `bearer ${token}`},
    });
    res.status(200).send(await functionResponse.text());
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred! See logs for more details.');
  }
};
// [END functions_bearer_token]
