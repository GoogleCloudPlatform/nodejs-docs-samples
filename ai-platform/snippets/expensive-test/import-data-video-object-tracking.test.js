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
const {describe, it} = require('mocha');

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

const datasetId = '1138566280794603520';
const gcsSourceUri =
  'gs://ucaip-sample-resources/youtube_8m_videos_animal_full.jsonl';
const project = process.env.CAIP_PROJECT_ID;
const location = process.env.LOCATION;

describe('AI platform import data video object tracking', () => {
  it('should import video object tracking data to dataset', async () => {
    const stdout = execSync(
      `node ./import-data-video-object-tracking.js ${datasetId} \
                                                     ${gcsSourceUri} \
                                                     ${project} \
                                                     ${location}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Import data video object tracking response/);
  });
});
