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
  // [START aiplatform_sdk_sentiment_analysis]
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
      content: `I had to compare two versions of Hamlet for my Shakespeare class and \
    unfortunately I picked this version. Everything from the acting (the actors \
    deliver most of their lines directly to the camera) to the camera shots (all \
    medium or close up shots...no scenery shots and very little back ground in the \
    shots) were absolutely terrible. I watched this over my spring break and it is \
    very safe to say that I feel that I was gypped out of 114 minutes of my \
    vacation. Not recommended by any stretch of the imagination.
    Classify the sentiment of the message: negative
    
    Something surprised me about this movie - it was actually original. It was not \
    the same old recycled crap that comes out of Hollywood every month. I saw this \
    movie on video because I did not even know about it before I saw it at my \
    local video store. If you see this movie available - rent it - you will not \
    regret it.
    Classify the sentiment of the message: positive
    
    My family has watched Arthur Bach stumble and stammer since the movie first \
    came out. We have most lines memorized. I watched it two weeks ago and still \
    get tickled at the simple humor and view-at-life. \
    This movie makes me just enjoy watching movies. My favorite scene \
    is when Arthur is visiting his fiancée's house. His conversation with the \
    butler and Susan's father is side-spitting. The line from the butler, \
    "Would you care to wait in the Library" followed by Arthur's reply, \
    "Yes I would, the bathroom is out of the question", is my NEWMAIL \
    notification on my computer.
    Classify the sentiment of the message: positive
    
    
    Tweet: The Pixel 7 Pro, is too big to fit in my jeans pocket, so I bought \
    new jeans.
    Classify the sentiment of the message: 
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
    console.log('Get text sentiment response');
    const predictions = response.predictions;
    console.log('\tPredictions :');
    for (const prediction of predictions) {
      console.log(`\t\tPrediction : ${JSON.stringify(prediction)}`);
    }
  }

  callPredict();
  // [END aiplatform_sdk_sentiment_analysis]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
