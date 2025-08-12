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
 * Updates the floor settings of a folder in Model Armor.
 *
 * @param {string} folderId - Google Cloud folder ID for which floor settings need to be updated.
 */
async function main(folderId) {
  // [START modelarmor_update_folder_floor_settings]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const folderId = 'your-folder-id';

  // Imports the Model Armor library
  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;
  const {protos} = modelarmor;

  // Instantiates a client
  const client = new ModelArmorClient();

  async function updateFolderFloorSettings() {
    const floorSettingsName = `folders/${folderId}/locations/global/floorSetting`;

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
                protos.google.cloud.modelarmor.v1.RaiFilterType.HARASSMENT,
              confidenceLevel:
                protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel
                  .LOW_AND_ABOVE,
            },
            {
              filterType:
                protos.google.cloud.modelarmor.v1.RaiFilterType
                  .SEXUALLY_EXPLICIT,
              confidenceLevel:
                protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel
                  .LOW_AND_ABOVE,
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
  }

  return await updateFolderFloorSettings();
  // [END modelarmor_update_folder_floor_settings]
}

module.exports.main = main;

/* c8 ignore next 10 */
if (require.main === module) {
  main(...process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
