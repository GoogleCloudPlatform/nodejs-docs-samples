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

function main(projectId, location, slateId, slateUri) {
  // [START videostitcher_create_slate]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // slateId = 'my-slate';
  // slateUri = 'https://my-slate-uri/test.mp4';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function createSlate() {
    // Construct request
    const request = {
      parent: stitcherClient.locationPath(projectId, location),
      slate: {
        uri: slateUri,
      },
      slateId: slateId,
    };
    const [slate] = await stitcherClient.createSlate(request);
    console.log(`Slate: ${slate.name}`);
  }

  createSlate();
  // [END videostitcher_create_slate]
}

// node createSlate.js <projectId> <location> <slateId> <slateUri>
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
