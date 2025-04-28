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
const {after, describe, it} = require('mocha');

const uuid = require('uuid').v4;
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const displayName = `temp_create_data_labeling_job_test_${uuid()}`;
const datasetId = '8268327440875520000';
const instructionUri =
  'gs://ucaip-sample-resources/images/datalabeling_instructions.pdf';
const inputsSchemaUri =
  'gs://google-cloud-aiplatform/schema/datalabelingjob/inputs/image_classification.yaml';
const annotationSpec = 'daisy';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

let dataLabelingJobId;

describe('AI platform create data labeling job', () => {
  it('should create a new data labeling job', async () => {
    const stdout = execSync(
      `node ./create-data-labeling-job.js ${displayName} ${datasetId} \
                                            ${instructionUri} \
                                            ${inputsSchemaUri} \
                                            ${annotationSpec} \
                                            ${project} ${location}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Create data labeling job response/);
    dataLabelingJobId = stdout
      .split('/locations/us-central1/dataLabelingJobs/')[1]
      .split('\n')[0];
  });
  after('should cancel the data labeling job and delete it', async () => {
    execSync(
      `node ./cancel-data-labeling-job.js ${dataLabelingJobId} ${project} \
                                            ${location}`,
      {
        cwd,
      }
    );
    execSync(
      `node ./delete-data-labeling-job.js ${dataLabelingJobId} ${project} \
                                            ${location}`,
      {
        cwd,
      }
    );
  });
});
