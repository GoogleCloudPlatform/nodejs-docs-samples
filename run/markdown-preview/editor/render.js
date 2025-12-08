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
import {GoogleAuth} from 'google-auth-library';
import got from 'got';
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
    timeout: {
      request:3000,
    },
  };

  try {
    // [END cloudrun_secure_request]
    // If we're in the test environment, use the envvar instead
    if (process.env.ID_TOKEN) {
      serviceRequestOptions.headers['Authorization'] =
        'Bearer ' + process.env.ID_TOKEN;
    } else {
      // [START cloudrun_secure_request]
      // Create a Google Auth client with the Renderer service url as the target audience.
      if (!client) client = await auth.getIdTokenClient(serviceUrl);
      // Fetch the client request headers and add them to the service request headers.
      // The client request headers include an ID token that authenticates the request.
      const clientHeaders = await client.getRequestHeaders();
      serviceRequestOptions.headers['Authorization'] =
        clientHeaders['Authorization'];
      // [END cloudrun_secure_request]
    }
    // [START cloudrun_secure_request]
  } catch (err) {
    throw Error('could not create an identity token: ' + err.message);
  }

  try {
    // serviceResponse converts the Markdown plaintext to HTML.
    const serviceResponse = await got(serviceUrl, serviceRequestOptions);
    return serviceResponse.body;
  } catch (err) {
    throw Error('request to rendering service failed: ' + err.message);
  }
};

// [END cloudrun_secure_request]

export default renderRequest;
