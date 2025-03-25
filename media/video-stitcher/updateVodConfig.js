/**
 * Copyright 2024 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function main(projectId, location, vodConfigId, sourceUri) {
  // [START videostitcher_update_vod_config]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // vodConfigId = 'my-vod-config-id';
  // sourceUri = 'https://storage.googleapis.com/my-bucket/main.mpd';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function updateVodConfig() {
    // Construct request
    const request = {
      vodConfig: {
        name: stitcherClient.vodConfigPath(projectId, location, vodConfigId),
        sourceUri: sourceUri,
      },
      updateMask: {
        paths: ['sourceUri'],
      },
    };

    const [operation] = await stitcherClient.updateVodConfig(request);
    const [response] = await operation.promise();
    console.log(`Updated VOD config: ${response.name}`);
    console.log(`Updated sourceUri: ${response.sourceUri}`);
  }

  updateVodConfig().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  // [END videostitcher_update_vod_config]
}

// node updateVodConfig.js <projectId> <location> <vodConfigId> <sourceUri>
main(...process.argv.slice(2));
