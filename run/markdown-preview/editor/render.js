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

const gcpMetadata = require('gcp-metadata')
const got = require('got');

// renderRequest creates a new HTTP request with IAM ID Token credential.
// This token is automatically handled by private Cloud Run (fully managed) and Cloud Functions.
const renderRequest = async (service, markdown) => { 
  // [START run_secure_request]
  let token;

  // Build the request to the Renderer receiving service.
  const serviceRequestOptions = { 
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: markdown.data
  };

  if (service.isAuthenticated) {
    try {
    // Query the token with ?audience as the service URL.
    const metadataServerTokenPath = `service-accounts/default/identity?audience=${service.url}`;
    // Fetch the token and then add it to the request header.
    token = await gcpMetadata.instance(metadataServerTokenPath);
    serviceRequestOptions.headers['Authorization'] = 'bearer ' + token;
    } catch(err) {
      throw Error('Metadata server could not respond to request: ', err);
    }
  };
  // [END run_secure_request]

  // [START run_secure_request_do]
  try {
    // serviceRequest converts the Markdown plaintext to HTML.
    const serviceResponse = await got(service.url, serviceRequestOptions);
    return serviceResponse;
  } catch (err) { 
    throw Error('Renderer service could not respond to request ', err);
  };
  // [END run_secure_request_do]
};

module.exports = renderRequest;