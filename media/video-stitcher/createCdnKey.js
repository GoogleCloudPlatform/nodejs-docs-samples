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

function main(
  projectId,
  location,
  cdnKeyId,
  hostname,
  gCdnKeyname,
  gCdnPrivateKey,
  akamaiTokenKey = ''
) {
  // [START video_stitcher_create_cdn_key]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // cdnKeyId = 'my-cdn-key';
  // hostname = 'cdn.example.com';
  // gCdnKeyname = 'gcdn-key';
  // gCdnPrivateKey = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nLg==';
  // akamaiTokenKey = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nLg==';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function createCdnKey() {
    // Construct request
    const request = {
      parent: stitcherClient.locationPath(projectId, location),
      cdnKey: {
        hostname: hostname,
      },
      cdnKeyId: cdnKeyId,
    };

    if (akamaiTokenKey !== '') {
      request.cdnKey.akamaiCdnKey = {
        tokenKey: akamaiTokenKey,
      };
    } else {
      request.cdnKey.googleCdnKey = {
        keyName: gCdnKeyname,
        privateKey: gCdnPrivateKey,
      };
    }

    const [cdnKey] = await stitcherClient.createCdnKey(request);
    console.log(`CDN key: ${cdnKey.name}`);
  }

  createCdnKey();
  // [END video_stitcher_create_cdn_key]
}

// node createCdnKey.js <projectId> <location> <cdnKeyId> <hostname> <gCdnKeyname> <gCdnPrivateKey> <akamaiTokenKey>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
