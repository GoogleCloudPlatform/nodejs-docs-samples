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
 * Updates the floor settings of a project in Model Armor.
 *
 * @param {string} projectId - Google Cloud project ID for which floor settings need to be updated.
 */
async function updateProjectFloorSettings(projectId) {
  // [START modelarmor_update_project_floor_settings]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';

  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;
  const {protos} = modelarmor;

  const client = new ModelArmorClient();

  const floorSettingsName = `projects/${projectId}/locations/global/floorSetting`;

  // Build the floor settings with your preferred filters
  // For more details on filters, please refer to the following doc:
  // https://cloud.google.com/security-command-center/docs/key-concepts-model-armor#ma-filters
  const floorSetting = {
    name: floorSettingsName,
    filterConfig: {
      raiSettings: {
        raiFilters: [
          {
            filterType:
              protos.google.cloud.modelarmor.v1.RaiFilterType.HATE_SPEECH,
            confidenceLevel:
              protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel.HIGH,
          },
        ],
      },
    },
    enableFloorSettingEnforcement: true,
  };

  const request = {
    floorSetting: floorSetting,
  };

  const [response] = await client.updateFloorSetting(request);
  return response;
  // [END modelarmor_update_project_floor_settings]
}

module.exports = updateProjectFloorSettings;
