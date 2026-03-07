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
  // [START generativeaionvertexai_imagen_edit_image_inpainting_remove_mask]
  /**
   * TODO(developer): Update these variables before running the sample.
   */
  const projectId = process.env.CAIP_PROJECT_ID;
  const location = 'us-central1';
  const inputFile = 'resources/volleyball_game.png';
  const maskFile = 'resources/volleyball_game_inpainting_remove_mask.png';
  const prompt = 'volleyball game';

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

  async function editImageInpaintingRemoveMask() {
    const fs = require('node:fs');
    const util = require('node:util');
    // Configure the parent resource
    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006`;

    const imageFile = fs.readFileSync(inputFile);
    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64');

    const maskImageFile = fs.readFileSync(maskFile);
    // Convert the image mask data to a Buffer and base64 encode it.
    const encodedMask = Buffer.from(maskImageFile).toString('base64');

    const promptObj = {
      prompt: prompt, // The text prompt describing the entire image
      editMode: 'inpainting-remove',
      image: {
        bytesBase64Encoded: encodedImage,
      },
      mask: {
        image: {
          bytesBase64Encoded: encodedMask,
        },
      },
    };
    const instanceValue = helpers.toValue(promptObj);
    const instances = [instanceValue];

    const parameter = {
      // Optional parameters
      seed: 100,
      // Controls the strength of the prompt
      // 0-9 (low strength), 10-20 (medium strength), 21+ (high strength)
      guidanceScale: 21,
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
  await editImageInpaintingRemoveMask();
  // [END generativeaionvertexai_imagen_edit_image_inpainting_remove_mask]
}

main().catch(err => {
  console.error(err);
  process.exitcode = 1;
});
