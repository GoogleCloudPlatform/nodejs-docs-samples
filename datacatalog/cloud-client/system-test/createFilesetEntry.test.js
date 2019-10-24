/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');
const cwd = path.join(__dirname, '..');

const projectId = process.env.GCLOUD_PROJECT;
// Use unique id to avoid conflicts between concurrent test runs
const entryGroupId = `fileset_entry_group_${uuid.v4().substr(0, 8)}`;
const entryId = `fileset_entry_id_${uuid.v4().substr(0, 8)}`;
const location = 'us-central1';

const {DataCatalogClient} = require('@google-cloud/datacatalog').v1beta1;
const datacatalog = new DataCatalogClient();

before(tools.checkCredentials);

describe('createFilesetEntry', () => {
  before(async () => {
    // Must create entryGroup before creating entry
    await tools.runAsync(
      `node createEntryGroup.js ${projectId} ${entryGroupId}`,
      cwd
    );
  });

  it('should create a fileset entry', async () => {
    const output = await tools.runAsync(
      `node createFilesetEntry.js ${projectId} ${entryGroupId} ${entryId}`,
      cwd
    );
    const expectedLinkedResource = `//datacatalog.googleapis.com/projects/${projectId}/locations/${location}/entryGroups/${entryGroupId}/entries/${entryId}`;
    assert.ok(output.includes(expectedLinkedResource));
  });

  after(async () => {
    const entryPath = datacatalog.entryPath(
      projectId,
      location,
      entryGroupId,
      entryId
    );
    await datacatalog.deleteEntry({name: entryPath});
    const entryGroupPath = datacatalog.entryGroupPath(
      projectId,
      location,
      entryGroupId
    );
    await datacatalog.deleteEntryGroup({name: entryGroupPath});
  });
});
