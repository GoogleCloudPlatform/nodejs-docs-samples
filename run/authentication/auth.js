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

const requestServiceToken = async (receivingServiceURL = 'https://SERVICE_NAME-HASH-run.app') => {
// [START run_service_to_service_auth]

// Import the Metadata API
const gcpMetadata = require('gcp-metadata')
const got = require('got');

// TODO(developer): Add the URL of your receiving service
// const receivingServiceURL = 'https://SERVICE_NAME-HASH-run.app'

  try {

    // Set up the metadata server request URL
    const metadataServerTokenPath = `service-accounts/default/identity?audience=${receivingServiceURL}`;
    
    // Fetch the token and then provide it in the request to the receiving service
    const token = await gcpMetadata.instance(metadataServerTokenPath);
    const serviceRequestOptions = { 
      headers: {
        'Authorization': 'bearer ' + token
      }
    };
    console.log('TOKEN??????? ', token);
    const serviceResponse = await got(receivingServiceURL, serviceRequestOptions);
    return serviceResponse;

  } catch (error) { 
    console.log('Metadata server could not respond to query ', error);
    return error;
  }

// [END run_service_to_service_auth]

};
requestServiceToken(...process.argv.slice(2));

module.exports = requestServiceToken;