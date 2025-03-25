/**
 * Copyright 2022 Google LLC
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

function main(projectId, location, vodConfigId) {
  // [START videostitcher_create_vod_session]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // vodConfigId = 'my-vod-config-id';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function createVodSession() {
    // Construct request
    const request = {
      parent: stitcherClient.locationPath(projectId, location),
      vodSession: {
        vodConfig: stitcherClient.vodConfigPath(
          projectId,
          location,
          vodConfigId
        ),
        adTracking: 'SERVER',
      },
    };
    const [session] = await stitcherClient.createVodSession(request);
    console.log(`VOD session: ${session.name}`);
  }

  createVodSession().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  // [END videostitcher_create_vod_session]
}

// node createVodSession.js <projectId> <location> <vodConfigId>
main(...process.argv.slice(2));
