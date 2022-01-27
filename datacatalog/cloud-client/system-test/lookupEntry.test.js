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
const cwd = path.join(__dirname, '..');
const {exec} = require('child_process');

describe('lookupEntry lookup', () => {
  it('should lookup a dataset entry', done => {
    const projectId = 'bigquery-public-data';
    const datasetId = 'new_york_taxi_trips';
    const expectedLinkedResource = `//bigquery.googleapis.com/projects/${projectId}/datasets/${datasetId}`;
    exec(
      `node lookupEntry.js ${projectId} ${datasetId}`,
      {cwd},
      (err, stdout) => {
        assert.ok(stdout.includes(expectedLinkedResource));
        done();
      }
    );
  });
});
