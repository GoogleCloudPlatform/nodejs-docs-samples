/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main() {
  // [START generativeaionvertexai_imagen_get_short_form_image_responses]
  /**
   * TODO(developer): Update these variables before running the sample.
   */
  const projectId = process.env.CAIP_PROJECT_ID;
  const location = 'us-central1';
  const inputFile = 'resources/cat.png';
  // The question about the contents of the image.
  const prompt = 'What breed of cat is this a picture of?';

  const aiplatform = require('@google-cloud/aiplatform');

  // Imports the Google Cloud Prediction Service Client library
  const {PredictionServiceClient} = aiplatform.v1;

  // Import the helper module for converting arbitrary protobuf.Value objects
  const {helpers} = aiplatform;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  };

  // Instantiates a client
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

  async function getShortFormImageResponses() {
    const fs = require('node:fs');
    // Configure the parent resource
    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/imagetext@001`;

    const imageFile = fs.readFileSync(inputFile);
    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64');

    const instance = {
      prompt: prompt,
      image: {
        bytesBase64Encoded: encodedImage,
      },
    };
    const instanceValue = helpers.toValue(instance);
    const instances = [instanceValue];

    const parameter = {
      // Optional parameters
      sampleCount: 2,
    };
    const parameters = helpers.toValue(parameter);

    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);
    const predictions = response.predictions;
    if (predictions.length === 0) {
      console.log(
        'No responses were generated. Check the request parameters and image.'
      );
    } else {
      predictions.forEach(prediction => {
        console.log(prediction.stringValue);
      });
    }
  }
  await getShortFormImageResponses();
  // [END generativeaionvertexai_imagen_get_short_form_image_responses]
}

main().catch(err => {
  console.error(err);
  process.exitcode = 1;
});
