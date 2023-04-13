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
const uuid = require('uuid');
const cwd = path.join(__dirname, '..');
const {exec} = require('child_process');

// Use unique id to avoid conflicts between concurrent test runs
const entryGroupId = `fileset_entry_group_${uuid.v4().substr(0, 8)}`;
const location = 'us-central1';

const {DataCatalogClient} = require('@google-cloud/datacatalog').v1beta1;
const datacatalog = new DataCatalogClient();

let projectId;
before(async () => {
  const client = new DataCatalogClient();
  projectId = await client.getProjectId();
});

describe('createEntryGroup', () => {
  it('should create a entry group', done => {
    const expectedName = `projects/${projectId}/locations/${location}/entryGroups/${entryGroupId}`;
    exec(
      `node createEntryGroup.js ${projectId} ${entryGroupId}`,
      {cwd},
      (err, stdout) => {
        assert.ok(stdout.includes(expectedName));
        done();
      }
    );
  });

  after(async () => {
    const entryGroupPath = datacatalog.entryGroupPath(
      projectId,
      location,
      entryGroupId
    );
    await datacatalog.deleteEntryGroup({name: entryGroupPath});
  });
});
