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
 * Retrieves the floor settings for a Google Cloud project.
 *
 * @param {string} projectId - The ID of the Google Cloud project for which to retrieve
 *                            floor settings.
 */
async function getProjectFloorSettings(projectId) {
  // [START modelarmor_get_project_floor_settings]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';

  const name = `projects/${projectId}/locations/global/floorSetting`;

  // Imports the Modelarmor library
  const {ModelArmorClient} = require('@google-cloud/modelarmor').v1;

  // Instantiates a client
  const modelarmorClient = new ModelArmorClient();

  // Construct request
  const request = {
    name,
  };

  // Run request
  const [response] = await modelarmorClient.getFloorSetting(request);
  return response;
  // [END modelarmor_get_project_floor_settings]
}

module.exports = getProjectFloorSettings;
