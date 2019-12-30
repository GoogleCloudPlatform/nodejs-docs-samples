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

const {assert} = require('chai');
const {describe, it} = require('mocha');
const {execSync} = require('child_process');

/** Tests for AutoML Video Intelligence Classification "Prediction API" sample.
 */

const cmdPredict = 'node automlVideoIntelligencePrediction.js';

// TODO(developer): Before running the test cases,
// set the environment variables PROJECT_ID, REGION_NAME and
// change the values of modelId, inputUri and outputUriPrefix
//const projectId = process.env.PROJECT_ID;
//const computeRegion = process.env.REGION_NAME;
const modelId = 'VCN5018751611309129728';
const inputUri = 'gs://video-intelligence/input-csv/annotateVideo.csv';
const outputUriPrefix = 'gs://video-intelligence/';

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe.skip(`Video Intelligence PredictionAPI`, () => {
  it(`should run prediction from preexisting model`, async () => {
    // Run prediction on 'annotate_video.csv' from gcs inputUri
    const output = exec(
      `${cmdPredict} predict "${modelId}" "${inputUri}" "${outputUriPrefix}"`
    );
    assert.match(output, /Operation name:/);
  });
});
