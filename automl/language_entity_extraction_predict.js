// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
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
  content = 'text to predict'
) {
  // [START automl_language_entity_extraction_predict]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const modelId = 'YOUR_MODEL_ID';
  // const content = 'text to predict'

  // Imports the Google Cloud AutoML library
  const {PredictionServiceClient} = require('@google-cloud/automl').v1;

  // Instantiates a client
  const client = new PredictionServiceClient();

  async function predict() {
    // Construct request
    const request = {
      name: client.modelPath(projectId, location, modelId),
      payload: {
        textSnippet: {
          content: content,
          mimeType: 'text/plain', // Types: 'test/plain', 'text/html'
        },
      },
    };

    const [response] = await client.predict(request);

    for (const annotationPayload of response.payload) {
      console.log(
        `Text Extract Entity Types: ${annotationPayload.displayName}`
      );
      console.log(`Text Score: ${annotationPayload.textExtraction.score}`);
      const textSegment = annotationPayload.textExtraction.textSegment;
      console.log(`Text Extract Entity Content: ${textSegment.content}`);
      console.log(`Text Start Offset: ${textSegment.startOffset}`);
      console.log(`Text End Offset: ${textSegment.endOffset}`);
    }
  }

  predict();
  // [END automl_language_entity_extraction_predict]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
