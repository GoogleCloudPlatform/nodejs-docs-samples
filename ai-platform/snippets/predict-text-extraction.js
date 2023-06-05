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
  // [START aiplatform_sdk_extraction]
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
      content: `Background: There is evidence that there have been significant changes \
    in Amazon rainforest vegetation over the last 21,000 years through the Last \
    Glacial Maximum (LGM) and subsequent deglaciation. Analyses of sediment \
    deposits from Amazon basin paleo lakes and from the Amazon Fan indicate that \
    rainfall in the basin during the LGM was lower than for the present, and this \
    was almost certainly associated with reduced moist tropical vegetation cover \
    in the basin. There is debate, however, over how extensive this reduction \
    was. Some scientists argue that the rainforest was reduced to small, isolated \
    refugia separated by open forest and grassland; other scientists argue that \
    the rainforest remained largely intact but extended less far to the north, \
    south, and east than is seen today. This debate has proved difficult to \
    resolve because the practical limitations of working in the rainforest mean \
    that data sampling is biased away from the center of the Amazon basin, and \
    both explanations are reasonably well supported by the available data.
    
    Q: What does LGM stands for?
    A: Last Glacial Maximum.
    
    Q: What did the analysis from the sediment deposits indicate?
    A: Rainfall in the basin during the LGM was lower than for the present.
    
    Q: What are some of scientists arguments?
    A: The rainforest was reduced to small, isolated refugia separated by open forest and grassland.
    
    Q: There have been major changes in Amazon rainforest vegetation over the last how many years?
    A: 21,000.
    
    Q: What caused changes in the Amazon rainforest vegetation?
    A: The Last Glacial Maximum (LGM) and subsequent deglaciation
    
    Q: What has been analyzed to compare Amazon rainfall in the past and present?
    A: Sediment deposits.
    
    Q: What has the lower rainfall in the Amazon during the LGM been attributed to?
    A:
    `,
    };
    const instanceValue = helpers.toValue(instance);
    const instances = [instanceValue];

    const parameter = {
      temperature: 0.2,
      maxOutputTokens: 256,
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
    console.log('Get text extraction response');
    const predictions = response.predictions;
    console.log('\tPredictions :');
    for (const prediction of predictions) {
      console.log(`\t\tPrediction : ${JSON.stringify(prediction)}`);
    }
  }

  callPredict();
  // [END aiplatform_sdk_extraction]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
