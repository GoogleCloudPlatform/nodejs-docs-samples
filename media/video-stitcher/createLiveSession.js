/**
 * Copyright 2022, Google, Inc.
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

function main(projectId, location, sourceUri, adTagUri, slateId) {
  // [START videostitcher_create_live_session]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // sourceUri = 'https://storage.googleapis.com/my-bucket/main.mpd';
  // Single Inline Linear (https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags)
  // (https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags)
  // adTagUri = 'https://pubads.g.doubleclick.net/gampad/ads...';
  // slateId = 'my-slate';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function createLiveSession() {
    // Construct request
    const request = {
      parent: stitcherClient.locationPath(projectId, location),
      liveSession: {
        sourceUri: sourceUri,
        adTagMap: {
          default: {
            uri: adTagUri,
          },
        },
        defaultSlateId: slateId,
      },
    };

    const [session] = await stitcherClient.createLiveSession(request);
    console.log(`Live session: ${session.name}`);
    console.log(`Play URI: ${session.playUri}`);
  }

  createLiveSession();
  // [END videostitcher_create_live_session]
}

// node createLiveSession.js <projectId> <location> <sourceUri> <adTagUri> <slateId>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
