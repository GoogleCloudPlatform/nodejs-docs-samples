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

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  modelId = 'YOUR_MODEL_ID',
  filePath = 'path_to_local_file.jpg'
) {
  // [START automl_vision_object_detection_predict]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const modelId = 'YOUR_MODEL_ID';
  // const filePath = 'path_to_local_file.jpg';

  // Imports the Google Cloud AutoML library
  const {PredictionServiceClient} = require('@google-cloud/automl').v1;
  const fs = require('fs');

  // Instantiates a client
  const client = new PredictionServiceClient();

  // Read the file content for translation.
  const content = fs.readFileSync(filePath);

  async function predict() {
    // Construct request
    // params is additional domain-specific parameters.
    // score_threshold is used to filter the result
    const request = {
      name: client.modelPath(projectId, location, modelId),
      payload: {
        image: {
          imageBytes: content,
        },
      },
      params: {
        score_threshold: '0.8',
      },
    };

    const [response] = await client.predict(request);

    for (const annotationPayload of response.payload) {
      console.log(`Predicted class name: ${annotationPayload.displayName}`);
      console.log(
        `Predicted class score: ${annotationPayload.imageObjectDetection.score}`
      );
      console.log('Normalized vertices:');
      for (const vertex of annotationPayload.imageObjectDetection.boundingBox
        .normalizedVertices) {
        console.log(`\tX: ${vertex.x}, Y: ${vertex.y}`);
      }
    }
  }

  predict();
  // [END automl_vision_object_detection_predict]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
