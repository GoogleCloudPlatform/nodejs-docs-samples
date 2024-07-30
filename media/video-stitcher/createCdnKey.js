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

function main(projectId, cdnKeyId, privateKey, isMediaCdn = true) {
  // [START videostitcher_create_cdn_key]
  const location = 'us-central1';
  const hostname = 'cdn.example.com';
  const keyName = 'cdn-key';
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // cdnKeyId = 'my-cdn-key';
  // privateKey = 'my-private-key';

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

    if (isMediaCdn === 'true') {
      request.cdnKey.mediaCdnKey = {
        keyName: keyName,
        privateKey: privateKey,
      };
    } else {
      request.cdnKey.googleCdnKey = {
        keyName: keyName,
        privateKey: privateKey,
      };
    }

    const [operation] = await stitcherClient.createCdnKey(request);
    const [response] = await operation.promise();
    console.log(`CDN key: ${response.name}`);
  }

  createCdnKey().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  // [END videostitcher_create_cdn_key]
}

// node createCdnKey.js <projectId> <cdnKeyId> <privateKey> <isMediaCdn> <location> <hostname> <keyName>
main(...process.argv.slice(2));
