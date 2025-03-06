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

import { assert } from 'chai';
import { describe, it, before } from 'mocha';
import { execSync as _execSync } from 'child_process';
import { v4 } from 'uuid';
import DLP, { DlpServiceClient } from '@google-cloud/dlp';
import { Storage } from '@google-cloud/storage';
import proxyquire from 'proxyquire';
import { restore, stub, replace, assert as _assert } from 'sinon';

import { MOCK_DATA } from './mockdata';

const dataProject = 'bigquery-public-data';
const dataSetId = 'samples';
const tableId = 'github_nested';

const storage = new Storage();
const testFile = 'resources/test.txt';
const bucketName = `test-dlp-metadata-bucket-${v4()}`;

const execSync = cmd => _execSync(cmd, {encoding: 'utf-8'});

const client = new DlpServiceClient();
describe('metadata', () => {
  let projectId, storedInfoTypeId;

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
    restore();
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
  it('should create a stored infotype', async () => {
    const storedInfoTypeName = 'MOCK_INFOTYPE';
    const infoTypeId = 'MOCK_INFOTYPE_ID';
    const outputPath = 'MOCK_OUTPUT_PATH';
    const fieldName = 'MOCK_FIELD';
    const DATA_CONSTANTS = MOCK_DATA.CREATE_STORED_INFOTYPE(
      projectId,
      infoTypeId,
      outputPath,
      dataProject,
      dataSetId,
      tableId,
      fieldName,
      storedInfoTypeName
    );
    const mockCreateStoredInfoType = stub()
      .resolves([{name: storedInfoTypeName}]);
    replace(
      DlpServiceClient.prototype,
      'createStoredInfoType',
      mockCreateStoredInfoType
    );

    const mockConsoleLog = stub();
    replace(console, 'log', mockConsoleLog);

    const createStoredInfoType = proxyquire('../createStoredInfoType', {
      '@google-cloud/dlp': {DLP: DLP},
    });
    await createStoredInfoType(
      projectId,
      infoTypeId,
      outputPath,
      dataProject,
      dataSetId,
      tableId,
      fieldName
    );
    _assert.calledOnceWithExactly(
      mockCreateStoredInfoType,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    _assert.calledWithExactly(
      mockConsoleLog,
      `InfoType stored successfully: ${storedInfoTypeName}`
    );
  });

  it('should handle error while creating stored infotype', async () => {
    const infoTypeId = 'MOCK_INFOTYPE_ID';
    const outputPath = 'MOCK_OUTPUT_PATH';
    const fieldName = 'MOCK_FIELD';
    const mockCreateStoredInfoType = stub().rejects(new Error('Failed'));
    replace(
      DlpServiceClient.prototype,
      'createStoredInfoType',
      mockCreateStoredInfoType
    );

    const mockConsoleLog = stub();
    replace(console, 'log', mockConsoleLog);

    const createStoredInfoType = proxyquire('../createStoredInfoType', {
      '@google-cloud/dlp': {DLP: DLP},
    });
    try {
      await createStoredInfoType(
        projectId,
        infoTypeId,
        outputPath,
        dataProject,
        dataSetId,
        tableId,
        fieldName
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_update_stored_infotype
  it('should update a stored infotype', async () => {
    const storedInfoTypeName = 'MOCK_INFOTYPE';
    const infoTypeId = 'MOCK_INFOTYPE_ID';
    const outputPath = 'MOCK_OUTPUT_PATH';
    const fileSetUrl = 'MOCK_FILE_SET_URL';
    const DATA_CONSTANTS = MOCK_DATA.UPDATE_STORED_INFOTYPE(
      projectId,
      infoTypeId,
      outputPath,
      fileSetUrl
    );
    const mockUpdateStoredInfoType = stub()
      .resolves([{name: storedInfoTypeName}]);
    replace(
      DlpServiceClient.prototype,
      'updateStoredInfoType',
      mockUpdateStoredInfoType
    );

    const mockConsoleLog = stub();
    replace(console, 'log', mockConsoleLog);

    const updateStoredInfoType = proxyquire('../updateStoredInfoType', {
      '@google-cloud/dlp': {DLP: DLP},
    });
    await updateStoredInfoType(projectId, infoTypeId, outputPath, fileSetUrl);

    _assert.calledWith(
      mockUpdateStoredInfoType,
      DATA_CONSTANTS.REQUEST_UPDATE_STORED_INFOTYPE
    );
    _assert.calledWithMatch(
      mockConsoleLog,
      'InfoType updated successfully:'
    );
  });

  it('should handle error while updating stored infotype', async () => {
    const infoTypeId = 'MOCK_INFOTYPE_ID';
    const outputPath = 'MOCK_OUTPUT_PATH';
    const fileSetUrl = 'MOCK_FILE_SET_URL';
    const mockUpdateStoredInfoType = stub().rejects(new Error('Failed'));
    replace(
      DlpServiceClient.prototype,
      'updateStoredInfoType',
      mockUpdateStoredInfoType
    );

    const mockConsoleLog = stub();
    replace(console, 'log', mockConsoleLog);

    const updateStoredInfoType = proxyquire('../updateStoredInfoType', {
      '@google-cloud/dlp': {DLP: DLP},
    });
    try {
      await updateStoredInfoType(projectId, infoTypeId, outputPath, fileSetUrl);
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });
});
