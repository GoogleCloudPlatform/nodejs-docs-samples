// Copyright 2019 Google LLC
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

function main(
  inputImageUri = 'gs://cloud-samples-data/vision/label/wakeupcat.jpg',
  outputUri = 'gs://YOUR_BUCKET_ID/path/to/save/results/'
) {
  // [START vision_async_batch_annotate_images]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const inputImageUri = 'gs://cloud-samples-data/vision/label/wakeupcat.jpg';
  // const outputUri = 'gs://YOUR_BUCKET_ID/path/to/save/results/';

  // Imports the Google Cloud client libraries
  const {ImageAnnotatorClient} = require('@google-cloud/vision').v1;

  // Instantiates a client
  const client = new ImageAnnotatorClient();

  // You can send multiple images to be annotated, this sample demonstrates how to do this with
  // one image. If you want to use multiple images, you have to create a request object for each image that you want annotated.
  async function asyncBatchAnnotateImages() {
    // Set the type of annotation you want to perform on the image
    // https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#google.cloud.vision.v1.Feature.Type
    const features = [{type: 'LABEL_DETECTION'}];

    // Build the image request object for that one image. Note: for additional images you have to create
    // additional image request objects and store them in a list to be used below.
    const imageRequest = {
      image: {
        source: {
          imageUri: inputImageUri,
        },
      },
      features: features,
    };

    // Set where to store the results for the images that will be annotated.
    const outputConfig = {
      gcsDestination: {
        uri: outputUri,
      },
      batchSize: 2, // The max number of responses to output in each JSON file
    };

    // Add each image request object to the batch request and add the output config.
    const request = {
      requests: [
        imageRequest, // add additional request objects here
      ],
      outputConfig,
    };

    // Make the asynchronous batch request.
    const [operation] = await client.asyncBatchAnnotateImages(request);

    // Wait for the operation to complete
    const [filesResponse] = await operation.promise();

    // The output is written to GCS with the provided output_uri as prefix
    const destinationUri = filesResponse.outputConfig.gcsDestination.uri;
    console.log(`Output written to GCS with prefix: ${destinationUri}`);
  }

  asyncBatchAnnotateImages();
  // [END vision_async_batch_annotate_images]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
