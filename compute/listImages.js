// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Prints a list of all non-deprecated image names available in given project.
 *
 * @param {string} projectId - ID or number of the project you want to list images from
 */
function main(projectId) {
  // [START compute_images_list]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';

  const compute = require('@google-cloud/compute');

  async function listImages() {
    const imagesClient = new compute.ImagesClient();

    // Listing only non-deprecated images to reduce the size of the reply.
    const images = imagesClient.listAsync({
      project: projectId,
      maxResults: 3,
      filter: 'deprecated.state != DEPRECATED',
    });

    // Although the `maxResults` parameter is specified in the request, the iterable returned
    // by the `listAsync()` method hides the pagination mechanic. The library makes multiple
    // requests to the API for you, so you can simply iterate over all the images.
    for await (const image of images) {
      console.log(` - ${image.name}`);
    }
  }

  listImages();
  // [END compute_images_list]
}

main(...process.argv.slice(2));
