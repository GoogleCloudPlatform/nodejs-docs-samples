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

async function main(project, location = 'us-central1') {
  // [START aiplatform_sdk_classify_news_items]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
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
  const model = 'text-bison@001';

  // Instantiates a client
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

  async function callPredict() {
    // Configure the parent resource
    const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;

    const instance = {
      content: `What is the topic for a given news headline?
    - business
    - entertainment
    - health
    - sports
    - technology
    
    Text: Pixel 7 Pro Expert Hands On Review, the Most Helpful Google Phones.
    The answer is: technology
    
    Text: Quit smoking?
    The answer is: health
    
    Text: Best soccer game of the season?
    The answer is: sports
    
    Text: This stock continues to soar.
    The answer is: business
    
    Text: What movie should I watch this week?
    The answer is: entertainment
    
    Text: Airlines expect to make $10 billion this year despite economic slowdown
    The answer is:
    `,
    };
    const instanceValue = helpers.toValue(instance);
    const instances = [instanceValue];

    const parameter = {
      temperature: 0.2,
      maxOutputTokens: 5,
      topP: 0,
      topK: 1,
    };
    const parameters = helpers.toValue(parameter);

    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);
    console.log('Get text classification response');
    const predictions = response.predictions;
    console.log('\tPredictions :');
    for (const prediction of predictions) {
      console.log(`\t\tPrediction : ${JSON.stringify(prediction)}`);
    }
  }

  callPredict();
  // [END aiplatform_sdk_classify_news_items]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
