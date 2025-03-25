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

function main(projectId, location, sessionId, stitchDetailId) {
  // [START videostitcher_get_vod_stitch_detail]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // sessionId = 'my-session-id';
  // stitchDetailId = 'my-stitch-detail-id';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function getVodStitchDetail() {
    // Construct request
    const request = {
      name: stitcherClient.vodStitchDetailPath(
        projectId,
        location,
        sessionId,
        stitchDetailId
      ),
    };
    const [stitchDetail] = await stitcherClient.getVodStitchDetail(request);
    console.log(`VOD stitch detail: ${stitchDetail.name}`);
  }

  getVodStitchDetail().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  // [END videostitcher_get_vod_stitch_detail]
}

// node getVodStitchDetail.js <projectId> <location> <sessionId> <stitchDetailId>
main(...process.argv.slice(2));
