// Copyright 2025 Google LLC
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

/**
 * Creates a new version of an existing parameter in the global location
 * of the specified project using the Google Cloud Parameter Manager SDK.
 * The payload is specified as a JSON string and includes a reference to a secret.
 *
 * @param {string} projectId - The Google Cloud project ID where the parameter is located.
 * @param {string} parameterId - The ID of the parameter for which the version is to be created.
 * @param {string} parameterVersionId - The ID of the parameter version to be created.
 * @param {string} secretId - The ID of the secret to be referenced.
 */
async function main(
  projectId = 'my-project',
  parameterId = 'my-parameter',
  parameterVersionId = 'v1',
  secretId = 'projects/my-project/secrets/application-secret/version/latest'
) {
  // [START parametermanager_create_param_version_with_secret]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const parameterId = 'YOUR_PARAMETER_ID';
  // const parameterVersionId = 'YOUR_PARAMETER_VERSION_ID';
  // const secretId = 'YOUR_SECRET_ID'; // For example projects/my-project/secrets/application-secret/version/latest

  // Imports the Parameter Manager library
  const {ParameterManagerClient} = require('@google-cloud/parametermanager');

  // Instantiates a client
  const client = new ParameterManagerClient();

  async function createParamVersionWithSecret() {
    // Construct the parent resource name
    const parent = client.parameterPath(projectId, 'global', parameterId);

    // Construct the JSON data with secret references
    const jsonData = {
      db_user: 'test_user',
      db_password: `__REF__(//secretmanager.googleapis.com/${secretId})`,
    };

    // Construct the parameter version
    const parameterVersion = {
      payload: {
        data: Buffer.from(JSON.stringify(jsonData), 'utf8'),
      },
    };

    // Construct the request
    const request = {
      parent: parent,
      parameterVersionId: parameterVersionId,
      parameterVersion: parameterVersion,
    };

    // Create the parameter version
    const [response] = await client.createParameterVersion(request);
    console.log(
      `Created parameter version with secret references: ${response.name}`
    );
  }

  await createParamVersionWithSecret();
  // [END parametermanager_create_param_version_with_secret]
}

// Parse command line arguments
const args = process.argv.slice(2);
main(...args).catch(console.error);
