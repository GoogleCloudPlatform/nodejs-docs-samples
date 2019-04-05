/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {assert} = require('chai');
const execa = require('execa');

/** Tests for AutoML Natural Language Entity Extraction "Prediction API" sample.
 */

const cmdPredict = 'node automlNaturalLanguageEntityPrediction.js';

// TODO(developer): Before running the test cases,
// set the environment variables PROJECT_ID, REGION_NAME and
// change the value of modelId
//const projectId = process.env.PROJECT_ID;
//const computeRegion = process.env.REGION_NAME;
const modelId = 'TEN5215784095006588928';
const filePath = './resource/entityInput.txt';

const exec = async cmd => (await execa.shell(cmd)).stdout;

describe.skip(`Language Entity PredictionAPI`, () => {
  it(`should run prediction from preexisting model`, async () => {
    // Run prediction on 'entityInput.txt' in resource folder
    const output = await exec(
      `${cmdPredict} predict "${modelId}" "${filePath}"`
    );
    assert.match(output, /Predicted text extract entity type:/);
  });
});
