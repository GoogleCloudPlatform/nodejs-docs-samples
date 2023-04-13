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
  serviceId = 'my-service'
) {
  // [START servicedirectory_delete_service]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const namespaceId = 'my-namespace';
  // const serviceId = 'my-service';

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

  async function deleteService() {
    await registrationServiceClient.deleteService({
      name: serviceName,
    });

    console.log(`Deleted service: ${serviceName}`);
  }

  deleteService();
  // [END servicedirectory_delete_service]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
