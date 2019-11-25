// Copyright 2019 Google LLC
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

const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const cwd = path.join(__dirname, '..');

before(tools.checkCredentials);

describe('lookupEntry lookup', () => {
  it('should lookup a dataset entry', async () => {
    const projectId = 'bigquery-public-data';
    const datasetId = 'new_york_taxi_trips';
    const output = await tools.runAsync(
      `node lookupEntry.js ${projectId} ${datasetId}`,
      cwd
    );
    const expectedLinkedResource = `//bigquery.googleapis.com/projects/${projectId}/datasets/${datasetId}`;
    assert.ok(output.includes(expectedLinkedResource));
  });
});
