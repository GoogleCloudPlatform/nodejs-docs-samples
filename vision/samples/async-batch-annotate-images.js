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

async function main(inputImageUri, outputUri) {
  // [START vision_async_batch_annotate_images_beta]

  // Imports the Google Cloud client libraries
  const {ImageAnnotatorClient} = require('@google-cloud/vision').v1p4beta1;

  // Creates a client
  const client = new ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // GCS path where the image resides
  // const inputImageUri = 'gs://my-bucket/my_image.jpg';
  // GCS path where to store the output json
  // const outputUri = 'gs://mybucket/out/'

  const features = [
    {type: 'DOCUMENT_LABEL_DETECTION'},
    {type: 'DOCUMENT_TEXT_DETECTION'},
    {type: 'DOCUMENT_IMAGE_DETECTION'},
  ];

  const outputConfig = {
    gcsDestination: {
      uri: outputUri,
    },
  };

  const request = {
    requests: [
      {
        image: {
          source: {
            imageUri: inputImageUri,
          },
        },
        features: features,
      },
    ],
    outputConfig,
  };

  const [operation] = await client.asyncBatchAnnotateImages(request);
  const [filesResponse] = await operation.promise();

  const destinationUri = filesResponse.outputConfig.gcsDestination.uri;
  console.log(`Json saved to: ${destinationUri}`);
  // [END vision_async_batch_annotate_images_beta]
}

main(...process.argv.slice(2)).catch(console.error);
