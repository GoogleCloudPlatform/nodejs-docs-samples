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
  // [START generativeaionvertexai_imagen_generate_image]
  /**
   * TODO(developer): Update these variables before running the sample.
   */
  const projectId = process.env.CAIP_PROJECT_ID;
  const location = 'us-central1';
  const prompt = 'a dog reading a newspaper';

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

  async function generateImage() {
    const fs = require('node:fs');
    const util = require('node:util');
    // Configure the parent resource
    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;

    const promptText = {
      prompt: prompt, // The text prompt describing what you want to see
    };
    const instanceValue = helpers.toValue(promptText);
    const instances = [instanceValue];

    const parameter = {
      sampleCount: 1,
      // You can't use a seed value and watermark at the same time.
      // seed: 100,
      // addWatermark: false,
      aspectRatio: '1:1',
      safetyFilterLevel: 'block_some',
      personGeneration: 'allow_adult',
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
        'No image was generated. Check the request parameters and prompt.'
      );
    } else {
      let i = 1;
      for (const prediction of predictions) {
        const buff = Buffer.from(
          prediction.structValue.fields.bytesBase64Encoded.stringValue,
          'base64'
        );
        // Write image content to the output file
        const writeFile = util.promisify(fs.writeFile);
        const filename = `output${i}.png`;
        await writeFile(filename, buff);
        console.log(`Saved image ${filename}`);
        i++;
      }
    }
  }
  await generateImage();
  // [END generativeaionvertexai_imagen_generate_image]
}

main().catch(err => {
  console.error(err);
  process.exitcode = 1;
});
