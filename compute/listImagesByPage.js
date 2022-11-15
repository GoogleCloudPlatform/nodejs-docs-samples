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
 * Prints a list of all non-deprecated image names available in a given project, divided into pages as returned by the Compute Engine API.
 *
 * @param {string} projectId - ID or number of the project you want to list images from
 * @param {number} pageSize - size of the pages you want the API to return on each call.
 */
function main(projectId, pageSize = 10) {
  // [START compute_images_list_page]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const pageSize = 10;

  const compute = require('@google-cloud/compute');

  async function listImagesByPage() {
    const imagesClient = new compute.ImagesClient();

    // Listing only non-deprecated images to reduce the size of the reply.
    const listRequest = {
      project: projectId,
      maxResults: pageSize,
      filter: 'deprecated.state != DEPRECATED',
    };

    const options = {
      autoPaginate: false,
    };

    let pageNum = 1;

    // Set autoPaginate option to `false` to have more granular control of
    // iteration over paginated results from the API. Each time you want to access the
    // next page, the library retrieves that page from the API.
    const listCallback = (err, resources, nextPageRequest, response) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`Page ${pageNum}:`);
      pageNum += 1;

      for (let i = 0; i < resources.length; i++) {
        console.log(resources[i].name);
      }

      if (response.nextPageToken) {
        imagesClient.list(nextPageRequest, options, listCallback);
      }
    };

    imagesClient.list(listRequest, options, listCallback);
  }

  listImagesByPage();
  // [END compute_images_list_page]
}

main(...process.argv.slice(2));
