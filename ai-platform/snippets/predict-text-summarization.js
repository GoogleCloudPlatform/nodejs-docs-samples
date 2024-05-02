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
  // [START aiplatform_sdk_summarization]
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
      content: `Provide a summary with about two sentences for the following article:
    The efficient-market hypothesis (EMH) is a hypothesis in financial \
    economics that states that asset prices reflect all available \
    information. A direct implication is that it is impossible to \
    "beat the market" consistently on a risk-adjusted basis since market \
    prices should only react to new information. Because the EMH is \
    formulated in terms of risk adjustment, it only makes testable \
    predictions when coupled with a particular model of risk. As a \
    result, research in financial economics since at least the 1990s has \
    focused on market anomalies, that is, deviations from specific \
    models of risk. The idea that financial market returns are difficult \
    to predict goes back to Bachelier, Mandelbrot, and Samuelson, but \
    is closely associated with Eugene Fama, in part due to his \
    influential 1970 review of the theoretical and empirical research. \
    The EMH provides the basic logic for modern risk-based theories of \
    asset prices, and frameworks such as consumption-based asset pricing \
    and intermediary asset pricing can be thought of as the combination \
    of a model of risk with the EMH. Many decades of empirical research \
    on return predictability has found mixed evidence. Research in the \
    1950s and 1960s often found a lack of predictability (e.g. Ball and \
    Brown 1968; Fama, Fisher, Jensen, and Roll 1969), yet the \
    1980s-2000s saw an explosion of discovered return predictors (e.g. \
    Rosenberg, Reid, and Lanstein 1985; Campbell and Shiller 1988; \
    Jegadeesh and Titman 1993). Since the 2010s, studies have often \
    found that return predictability has become more elusive, as \
    predictability fails to work out-of-sample (Goyal and Welch 2008), \
    or has been weakened by advances in trading technology and investor \
    learning (Chordia, Subrahmanyam, and Tong 2014; McLean and Pontiff \
    2016; Martineau 2021).
    Summary: 
    `,
    };
    const instanceValue = helpers.toValue(instance);
    const instances = [instanceValue];

    const parameter = {
      temperature: 0.2,
      maxOutputTokens: 256,
      topP: 0.95,
      topK: 40,
    };
    const parameters = helpers.toValue(parameter);

    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);
    console.log('Get text summarization response');
    const predictions = response.predictions;
    console.log('\tPredictions :');
    for (const prediction of predictions) {
      console.log(`\t\tPrediction : ${JSON.stringify(prediction)}`);
    }
  }

  callPredict();
  // [END aiplatform_sdk_summarization]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
