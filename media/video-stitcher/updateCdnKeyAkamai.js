/**
 * Copyright 2023, Google, Inc.
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

function main(projectId, cdnKeyId, hostname, akamaiTokenKey) {
  // [START videostitcher_update_cdn_key_akamai]
  const location = 'us-central1';
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // cdnKeyId = 'my-cdn-key';
  // akamaiTokenKey = 'my-token-key';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function updateCdnKeyAkamai() {
    // Construct request
    const request = {
      cdnKey: {
        name: stitcherClient.cdnKeyPath(projectId, location, cdnKeyId),
        hostname: hostname,
        akamaiCdnKey: {
          tokenKey: akamaiTokenKey,
        },
      },
      updateMask: {
        paths: ['hostname', 'akamai_cdn_key'],
      },
    };

    const [cdnKey] = await stitcherClient.updateCdnKey(request);
    console.log(`Updated CDN key: ${cdnKey.name}`);
    console.log(`Updated hostname: ${cdnKey.hostname}`);
  }

  updateCdnKeyAkamai();
  // [END videostitcher_update_cdn_key_akamai]
}

// node updateCdnKeyAkamai.js <projectId> <cdnKeyId> <akamaiTokenKey> <location> <hostname>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
