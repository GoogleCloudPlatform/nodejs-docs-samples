/**
 * Copyright 2023 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
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
const cp = require('child_process');

const {SearchServiceClient} = require('@google-cloud/discoveryengine').v1beta;
const client = new SearchServiceClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');
const LOCATION = 'global';
const DATA_STORE_ID = 'cloud-google-com_1684250565013';
const COLLECTION_ID = 'default_collection';
const SERVING_CONFIG_ID = 'default_config';
const SEARCH_QUERY = 'Google';

describe('Search', () => {
  let projectId;
  before(async () => {
    projectId = await client.getProjectId();
  });
  it('should run genappbuilder search (v1beta)', async () => {
    const stdout = execSync(
      `node ./search.js ${projectId} ${LOCATION} ${COLLECTION_ID} ${DATA_STORE_ID} ${SERVING_CONFIG_ID} ${SEARCH_QUERY}`,
      {
        cwd,
      }
    );
    assert.match(stdout.toString(), /google/);
  });
});
