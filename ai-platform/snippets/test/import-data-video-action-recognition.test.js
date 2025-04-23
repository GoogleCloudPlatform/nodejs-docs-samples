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

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');

const uuid = require('uuid').v4;
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const aiplatform = require('@google-cloud/aiplatform');
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};

const datasetServiceClient = new aiplatform.v1.DatasetServiceClient(
  clientOptions
);

let datasetId = '';
const datasetDisplayName = `temp_import_data_node_var_${uuid()}`;
const gcsSourceUri = 'gs://automl-video-demo-data/ucaip-var/swimrun.jsonl';
const project = process.env.CAIP_PROJECT_ID;
const location = 'us-central1';

describe('AI platform import data video action recognition', () => {
  before('should create the new dataset', async () => {
    const parent = `projects/${project}/locations/${location}`;
    const [operation] = await datasetServiceClient.createDataset({
      parent,
      dataset: {
        displayName: datasetDisplayName,
        metadataSchemaUri:
          'gs://google-cloud-aiplatform/schema/dataset/metadata/video_1.0.0.yaml',
      },
    });
    const [response] = await operation.promise();
    const datasetName = response.name;
    datasetId = datasetName.split('datasets/')[1];
  });

  it('should import video action recognition data to dataset', async () => {
    const stdout = execSync(
      `node ./import-data-video-action-recognition.js ${datasetId} ${gcsSourceUri} ${project} ${location}`
    );
    assert.match(stdout, /Import data video action recognition response/);
  });

  after('should cancel the import job and delete the dataset', async () => {
    const datasetName = datasetServiceClient.datasetPath(
      project,
      location,
      datasetId
    );
    const [operation] = await datasetServiceClient.deleteDataset({
      name: datasetName,
    });
    await operation.promise();
  });
});
