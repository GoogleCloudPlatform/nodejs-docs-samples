// Copyright 2025  Google LLC
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

'use strict';

const {protos} = require('@google-cloud/parametermanager');

/**
 * Creates a parameter in the specified region of the specified project using the Google Cloud Parameter Manager SDK.
 * The parameter is created with the specified format type.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is to be created.
 * @param {string} locationId - The ID of the region where parameter is to be created.
 * @param {string} parameterId - The ID of the parameter to create.
 * @param {string} formatType - The format type of the parameter (UNFORMATTED, YAML, JSON).
 */
async function main(
  projectId = 'my-project',
  locationId = 'us-central1',
  parameterId = 'my-json-parameter',
  formatType = protos.google.cloud.parametermanager.v1.ParameterFormat.JSON
) {
  // [START parametermanager_create_structured_regional_param]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const {protos} = require('@google-cloud/parametermanager');
  // const projectId = 'YOUR_PROJECT_ID';
  // const locationId = 'YOUR_LOCATION_ID';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const formatType = protos.google.cloud.parametermanager.v1.ParameterFormat.JSON;

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Adding the endpoint to call the regional parameter manager server
  const options = {
    apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`,
  };

  // Instantiates a client with regional endpoint
  const client = new ParameterManagerClient(options);

  async function createStructuredRegionalParam() {
    const parent = client.locationPath(projectId, locationId);
    const request = {
      parent: parent,
      parameterId: parameterId,
      parameter: {
        format: formatType,
      },
    };

    const [parameter] = await client.createParameter(request);
    console.log(
      `Created regional parameter ${parameter.name} with format ${parameter.format}`
    );
  }

  await createStructuredRegionalParam();
  // [END parametermanager_create_structured_regional_param]
}

// This sample demonstrates how to create a regional parameter with structured (JSON) data.
const args = process.argv.slice(2);
main(...args).catch(console.error);
