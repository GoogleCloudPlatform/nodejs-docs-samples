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

// [START run_service_to_service_auth]
// Make sure to `npm install gcp-metadata` and `npm install got` or add the dependencies to your package.json
const gcpMetadata = require('gcp-metadata')
const got = require('got');

const requestServiceToken = async () => { 
  try {

    // Add the URL of your receiving service
    const receivingServiceURL = ...

    // Set up the metadata server request options
    // See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
    const metadataServerTokenPath = 'service-accounts/default/identity?audience=' + receivingServiceURL;
    const tokenRequestOptions = {
      headers: {
        'Metadata-Flavor': 'Google'
      }
    };
    
    // Fetch the token and then provide it in the request to the receiving service
    const tokenResponse = await gcpMetadata.instance(metadataServerTokenPath, tokenRequestOptions);
    const serviceRequestOptions = { 
      headers: {
        'Authorization': 'bearer ' + tokenResponse
      }
    };

    const serviceResponse = await got(receivingServiceURL, serviceRequestOptions);
    res.send(serviceResponse.body);

  } catch (error) { 
    console.log('Metadata server could not respond to query ', error);
    res.send(error);
  }
};

// [END run_service_to_service_auth]
