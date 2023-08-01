// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');
const DLP = require('@google-cloud/dlp');
const {Storage} = require('@google-cloud/storage');

const dataProject = 'bigquery-public-data';
const dataSetId = 'samples';
const tableId = 'github_nested';
const fieldId = 'url';

const storage = new Storage();
const testFile = 'resources/test.txt';
const bucketName = `test-dlp-metadata-bucket-${uuid.v4()}`;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const client = new DLP.DlpServiceClient();
describe('metadata', () => {
  let projectId, storedInfoTypeId;
  const infoTypeCloudStorageFileSet = `gs://${bucketName}/test.txt`;

  before(async () => {
    projectId = await client.getProjectId();
    // Create a Cloud Storage bucket to be used for testing.
    await storage.createBucket(bucketName);
    await storage.bucket(bucketName).upload(testFile);
    console.log(`Bucket ${bucketName} created.`);
  });

  after(async () => {
    try {
      const bucket = storage.bucket(bucketName);
      await bucket.deleteFiles({force: true});
      await bucket.delete();
      console.log(`Bucket ${bucketName} deleted.`);
    } catch (err) {
      // ignore error
    }
  });

  // Delete stored infotypes created in the snippets.
  afterEach(async () => {
    if (!storedInfoTypeId) {
      return;
    }
    const request = {
      name: storedInfoTypeId,
    };
    try {
      await client.deleteStoredInfoType(request);
      storedInfoTypeId = '';
    } catch (err) {
      throw `Error in deleting store infoType: ${err.message || err}`;
    }
  });

  it('should list info types', () => {
    const output = execSync(`node metadata.js ${projectId} infoTypes`);
    assert.match(output, /US_DRIVERS_LICENSE_NUMBER/);
  });

  it('should filter listed info types', () => {
    const output = execSync(
      `node metadata.js ${projectId} infoTypes "supported_by=RISK_ANALYSIS"`
    );
    assert.notMatch(output, /US_DRIVERS_LICENSE_NUMBER/);
  });

  // dlp_create_stored_infotype
  it('should create a stored infotype', () => {
    const infoTypeId = `stored-infoType-${uuid.v4()}`;
    const infoTypeOutputPath = `gs://${bucketName}`;
    const output = execSync(
      `node createStoredInfoType.js ${projectId} ${infoTypeId} ${infoTypeOutputPath} ${dataProject} ${dataSetId} ${tableId} ${fieldId}`
    );
    assert.match(output, /InfoType stored successfully:/);
    storedInfoTypeId = output.split(':')[1].trim();
  });

  it('should handle stored infotype creation errors', () => {
    let output;
    const infoTypeId = `stored-infoType-${uuid.v4()}`;
    const infoTypeOutputPath = 'INFOTYPE_OUTPUT_PATH';
    try {
      output = execSync(
        `node createStoredInfoType.js BAD_PROJECT_ID ${infoTypeId} ${infoTypeOutputPath} ${dataProject} ${dataSetId} ${tableId} ${fieldId}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_update_stored_infotype
  it('should update a stored infotype', async () => {
    let output;
    const infoTypeId = `stored-infoType-${uuid.v4()}`;
    const infoTypeOutputPath = `gs://${bucketName}`;
    try {
      // First create a temporary stored infoType
      const [response] = await client.createStoredInfoType({
        parent: `projects/${projectId}/locations/global`,
        config: {
          displayName: 'GitHub usernames',
          description: 'Dictionary of GitHub usernames used in commits',
          largeCustomDictionary: {
            outputPath: {
              path: infoTypeOutputPath,
            },
            bigQueryField: {
              table: {
                datasetId: dataSetId,
                projectId: dataProject,
                tableId: tableId,
              },
              field: {
                name: fieldId,
              },
            },
          },
        },
        storedInfoTypeId: infoTypeId,
      });
      storedInfoTypeId = response.name;
      // Execute the update script
      output = execSync(
        `node updateStoredInfoType.js ${projectId} ${infoTypeId} ${infoTypeOutputPath} ${infoTypeCloudStorageFileSet}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /InfoType updated successfully:/);
  });

  it('should handle stored infotype update errors', async () => {
    let output;
    const infoTypeId = `stored-infoType-${uuid.v4()}`;
    const infoTypeOutputPath = 'INFOTYPE_OUTPUT_PATH';
    try {
      // First create a temporary stored infoType
      const [response] = await client.createStoredInfoType({
        parent: `projects/${projectId}/locations/global`,
        config: {
          displayName: 'GitHub usernames',
          description: 'Dictionary of GitHub usernames used in commits',
          largeCustomDictionary: {
            outputPath: {
              path: infoTypeOutputPath,
            },
            bigQueryField: {
              table: {
                datasetId: dataSetId,
                projectId: dataProject,
                tableId: tableId,
              },
              field: {
                name: fieldId,
              },
            },
          },
        },
        storedInfoTypeId: infoTypeId,
      });
      storedInfoTypeId = response.name;
      // Execute the update script
      output = execSync(
        `node updateStoredInfoType.js BAD_PROJECT_ID ${infoTypeId} ${infoTypeOutputPath} ${infoTypeCloudStorageFileSet}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });
});
