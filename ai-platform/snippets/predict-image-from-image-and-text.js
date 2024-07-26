/*
 * Copyright 2023 Google LLC
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

async function main(
  project,
  location = 'us-central1',
  baseImagePath,
  textPrompt
) {
  // [START aiplatform_sdk_text_image_embedding]
  // [START generativeaionvertexai_sdk_text_image_embedding]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  // const bastImagePath = "YOUR_BASED_IMAGE_PATH"
  // const textPrompt = 'YOUR_TEXT_PROMPT';
  const aiplatform = require('@google-cloud/aiplatform');

  // Imports the Google Cloud Prediction service client
  const {PredictionServiceClient} = aiplatform.v1;

  // Import the helper module for converting arbitrary protobuf.Value objects.
  const {helpers} = aiplatform;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };
  const publisher = 'google';
  const model = 'multimodalembedding@001';

  // Instantiates a client
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

  async function predictImageFromImageAndText() {
    // Configure the parent resource
    const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;

    const fs = require('fs');
    const imageFile = fs.readFileSync(baseImagePath);

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64');

    const prompt = {
      text: textPrompt,
      image: {
        bytesBase64Encoded: encodedImage,
      },
    };
    const instanceValue = helpers.toValue(prompt);
    const instances = [instanceValue];

    const parameter = {
      sampleCount: 1,
    };
    const parameters = helpers.toValue(parameter);

    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);
    console.log('Get image embedding response');
    const predictions = response.predictions;
    console.log('\tPredictions :');
    for (const prediction of predictions) {
      console.log(`\t\tPrediction : ${JSON.stringify(prediction)}`);
    }
  }

  await predictImageFromImageAndText();
  // [END aiplatform_sdk_text_image_embedding]
  // [END generativeaionvertexai_sdk_text_image_embedding]
}

exports.predictImageFromImageAndText = main;
