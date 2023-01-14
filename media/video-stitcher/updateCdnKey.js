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
  keyName,
  privateKey,
  isMediaCdn = true
) {
  // [START videostitcher_update_cdn_key]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // cdnKeyId = 'my-cdn-key';
  // hostname = 'updated.cdn.example.com';
  // keyName = 'cdn-key';
  // privateKey = 'my-private-key';
  // isMediaCdn = true;

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function updateCdnKey() {
    // Construct request
    const request = {
      cdnKey: {
        name: stitcherClient.cdnKeyPath(projectId, location, cdnKeyId),
        hostname: hostname,
      },
    };

    if (isMediaCdn === 'true') {
      request.cdnKey.mediaCdnKey = {
        keyName: keyName,
        privateKey: privateKey,
      };
      request.updateMask = {
        paths: ['hostname', 'media_cdn_key'],
      };
    } else {
      request.cdnKey.googleCdnKey = {
        keyName: keyName,
        privateKey: privateKey,
      };
      request.updateMask = {
        paths: ['hostname', 'google_cdn_key'],
      };
    }

    const [cdnKey] = await stitcherClient.updateCdnKey(request);
    console.log(`Updated CDN key: ${cdnKey.name}`);
  }

  updateCdnKey();
  // [END videostitcher_update_cdn_key]
}

// node updateCdnKey.js <projectId> <location> <cdnKeyId> <hostname> <keyName> <privateKey> <isMediaCdn>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
