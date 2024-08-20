/**
 * Copyright 2023 Google LLC
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

function main(projectId, location, liveConfigId, sourceUri, adTagUri, slateId) {
  // [START videostitcher_create_live_config]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // liveConfigId = 'my-live-config-id';
  // sourceUri = 'https://storage.googleapis.com/my-bucket/main.mpd';
  // See Single Inline Linear
  // (https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags)
  // adTagUri = 'https://pubads.g.doubleclick.net/gampad/ads...';
  // slateId = 'my-slate';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function createLiveConfig() {
    // Construct request
    const request = {
      parent: stitcherClient.locationPath(projectId, location),
      liveConfig: {
        sourceUri: sourceUri,
        adTagUri: adTagUri,
        adTracking: 'SERVER',
        stitchingPolicy: 'CUT_CURRENT',
        defaultSlate: stitcherClient.slatePath(projectId, location, slateId),
      },
      liveConfigId: liveConfigId,
    };
    const [operation] = await stitcherClient.createLiveConfig(request);
    const [response] = await operation.promise();
    console.log(`response.name: ${response.name}`);
  }

  createLiveConfig().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  // [END videostitcher_create_live_config]
}

// node createLiveConfig.js <projectId> <location> <liveConfigId> <sourceUri> <adTagUri> <slateId>
main(...process.argv.slice(2));
