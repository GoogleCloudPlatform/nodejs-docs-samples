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

function main(projectId, location, slateId) {
  // [START videostitcher_delete_slate]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // projectId = 'my-project-id';
  // location = 'us-central1';
  // slateId = 'my-slate';

  // Imports the Video Stitcher library
  const {VideoStitcherServiceClient} =
    require('@google-cloud/video-stitcher').v1;
  // Instantiates a client
  const stitcherClient = new VideoStitcherServiceClient();

  async function deleteSlate() {
    // Construct request
    const request = {
      name: stitcherClient.slatePath(projectId, location, slateId),
    };
    const [operation] = await stitcherClient.deleteSlate(request);
    await operation.promise();
    console.log('Deleted slate');
  }

  deleteSlate().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  // [END videostitcher_delete_slate]
}

// node deleteSlate.js <projectId> <location> <slateId>
main(...process.argv.slice(2));
