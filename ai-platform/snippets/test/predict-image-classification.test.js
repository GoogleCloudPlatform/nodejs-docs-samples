/*
 * Copyright 2020 Google LLC
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

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const filename = 'daisy.jpg';
const local_file = path.resolve(
  path.join(__dirname, `../resources/${filename}`)
);
const endpointId = process.env.PREDICT_IMAGE_CLASS_ENDPOINT_ID;
const project = process.env.CAIP_PROJECT_ID;
const location = process.env.LOCATION;

describe('AI platform predict image classification', () => {
  it('should make predictions using the image classification model', async () => {
    const stdout = execSync(
      `node ./predict-image-classification.js ${local_file} ${endpointId} ${project} ${location}`
    );
    assert.match(stdout, /Predict image classification response/);
  });
});
