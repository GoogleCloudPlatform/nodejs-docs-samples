// Copyright 2020 Google LLC
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

'use strict';

function main(projectId, location, gcsUri) {
  // [START vision_product_search_import_product_images]
  // Imports the Google Cloud client library
  // [START vision_product_search_tutorial_import]
  const vision = require('@google-cloud/vision');
  // [END vision_product_search_tutorial_import]
  // Creates a client
  const client = new vision.ProductSearchClient();

  async function importProductSets() {
    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const projectId = 'Your Google Cloud project Id';
    // const location = 'A compute region name';
    // const gcsUri = 'Google Cloud Storage URI. Target files must be in Product Search CSV format';

    // A resource that represents Google Cloud Platform location.
    const projectLocation = client.locationPath(projectId, location);

    // Set the input configuration along with Google Cloud Storage URI
    const inputConfig = {
      gcsSource: {
        csvFileUri: gcsUri,
      },
    };

    // Import the product sets from the input URI.
    const [response, operation] = await client.importProductSets({
      parent: projectLocation,
      inputConfig: inputConfig,
    });

    console.log('Processing operation name: ', operation.name);

    // synchronous check of operation status
    const [result] = await response.promise();
    console.log('Processing done.');
    console.log('Results of the processing:');

    for (const i in result.statuses) {
      console.log(
        'Status of processing ',
        i,
        'of the csv:',
        result.statuses[i]
      );

      // Check the status of reference image
      if (result.statuses[i].code === 0) {
        console.log(result.referenceImages[i]);
      } else {
        console.log('No reference image.');
      }
    }
  }
  importProductSets();
  // [END vision_product_search_import_product_images]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
