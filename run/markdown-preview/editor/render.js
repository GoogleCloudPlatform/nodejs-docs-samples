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

// [START cloudrun_secure_request]
// [START run_secure_request]
const {GoogleAuth} = require('google-auth-library');
const got = require('got');
const auth = new GoogleAuth();

let client, serviceUrl;

// renderRequest creates a new HTTP request with IAM ID Token credential.
// This token is automatically handled by private Cloud Run (fully managed) and Cloud Functions.
const renderRequest = async markdown => {
  if (!process.env.EDITOR_UPSTREAM_RENDER_URL)
    throw Error('EDITOR_UPSTREAM_RENDER_URL needs to be set.');
  serviceUrl = process.env.EDITOR_UPSTREAM_RENDER_URL;

  // Build the request to the Renderer receiving service.
  const serviceRequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: markdown,
    timeout: 3000,
  };

  try {
    // Create a Google Auth client with the Renderer service url as the target audience.
    if (!client) client = await auth.getIdTokenClient(serviceUrl);
    // Fetch the client request headers and add them to the service request headers.
    // The client request headers include an ID token that authenticates the request.
    const clientHeaders = await client.getRequestHeaders();
    serviceRequestOptions.headers['Authorization'] =
      clientHeaders['Authorization'];
  } catch (err) {
    throw Error('could not create an identity token: ', err);
  }

  try {
    // serviceResponse converts the Markdown plaintext to HTML.
    const serviceResponse = await got(serviceUrl, serviceRequestOptions);
    return serviceResponse.body;
  } catch (err) {
    throw Error('request to rendering service failed: ', err);
  }
};

// [END run_secure_request]
// [END cloudrun_secure_request]

module.exports = renderRequest;
