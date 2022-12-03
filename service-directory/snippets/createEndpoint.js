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
//

'use strict';

async function main(
  projectId = 'my-project',
  locationId = 'us-east1',
  namespaceId = 'my-namespace',
  serviceId = 'my-service',
  endpointId = 'my-endpoint'
) {
  // [START servicedirectory_create_endpoint]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const namespaceId = 'my-namespace';
  // const serviceId = 'my-service';
  // const endpointId = 'my-endpoint';

  // Imports the Google Cloud client library
  const {
    RegistrationServiceClient,
  } = require('@google-cloud/service-directory');

  // Creates a client
  const registrationServiceClient = new RegistrationServiceClient();

  // Build the service name
  const serviceName = registrationServiceClient.servicePath(
    projectId,
    locationId,
    namespaceId,
    serviceId
  );

  async function createEndpoint() {
    const [endpoint] = await registrationServiceClient.createEndpoint({
      parent: serviceName,
      endpointId: endpointId,
      endpoint: {address: '10.0.0.1', port: 8080},
    });

    console.log(`Created endpoint: ${endpoint.name}`);
    return endpoint;
  }

  return createEndpoint();
  // [END servicedirectory_create_endpoint]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
