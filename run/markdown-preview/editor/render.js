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

// [START run_secure_request]

// Import the Metadata API
const gcpMetadata = require('gcp-metadata')
const got = require('got');
const { renderService }  = require('./service.js');

// NewRequest creates a new HTTP request with IAM ID Token credential.
// This token is automatically handled by private Cloud Run (fully managed) and Cloud Functions.
const newRequest = async (service) => { 
  // Skip authentication if not using HTTPS, such as for local development.
  if (!service.isAuthenticated) return null;
  
  try {
    // Query the id_token with ?audience as the serviceURL
    const metadataServerTokenPath = 'service-accounts/default/identity?audience=' + service.URL;
    const tokenRequestOptions = {
      headers: {
        'Metadata-Flavor': 'Google'
      }
    };
    // Fetch the token and then provide it in the request to the receiving service
    const token = await gcpMetadata.instance(metadataServerTokenPath, tokenRequestOptions);
    const serviceRequestOptions = { 
      headers: {
        'Authorization': 'bearer ' + token
      }
    };
    const serviceResponse = await got(receivingServiceURL, serviceRequestOptions);
    return serviceResponse;
  } catch (error) { 
    console.log('Metadata server could not respond to query ', error);
    return error;
  }
};

// [END run_secure_request]

// [START run_secure_request_do]

// Render converts the Markdown plaintext to HTML.
const render = async (service) => {
  service.newRequest(renderService)
  ////// TODO: this needs to convert the markdown into html
  ////// go uses 'ioutil' 
}
// [END run_secure_request_do]

module.exports = {
  requestServiceToken,
  newRequest,
  render,
}