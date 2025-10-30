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

import path from 'node:path';
import {assert} from 'chai';
import {after, describe, it} from 'mocha';
import {v4 as uuid} from 'uuid';
import cp from 'node:child_process';
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const displayName = `temp_create_data_labeling_job_image_test_${uuid()}`;
const datasetId = '1905673553261363200';
const instructionUri =
  'gs://ucaip-sample-resources/images/datalabeling_instructions.pdf';
const annotationSpec = 'roses';
const project = process.env.CAIP_PROJECT_ID;
const location = process.env.LOCATION;

let dataLabelingJobId;

describe('AI platform create data labeling job image', () => {
  it('should create a new data labeling job image', async () => {
    const stdout = execSync(
      `node ./create-data-labeling-job-image.js ${displayName} ${datasetId} \
                                                  ${instructionUri} \
                                                  ${annotationSpec} \
                                                  ${project} ${location}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Create data labeling job image response/);
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
