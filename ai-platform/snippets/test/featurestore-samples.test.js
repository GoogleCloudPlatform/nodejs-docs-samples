/*
 * Copyright 2022 Google LLC
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

import {assert} from 'chai';
import {after, before, describe, it} from 'mocha';
import {v4 as uuid} from 'uuid';
import cp from 'node:child_process';
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const project = process.env.CAIP_PROJECT_ID;
const featurestoreId1 = `featurestore_sample_${uuid()
  .replace(/-/g, '_')
  .slice(10, 20)}`;
const featurestoreId2 = `featurestore_sample_${uuid()
  .replace(/-/g, '_')
  .slice(10, 20)}`;

const fixedNodeCount = 1;
const updatedFixedNodeCount = 3;
const minNodeCount = 1;
const maxNodeCount = 3;
const updatedMinNodeCount = 2;
const updatedMaxNodeCount = 4;
const location = 'us-central1';
const apiEndpoint = 'us-central1-aiplatform.googleapis.com';

describe('AI platform featurestore api samples test', async function () {
  this.retries(2);
  before('should create a featurestore with fixed nodes', async () => {
    execSync(
      `node ./create-featurestore-fixed-nodes-sample.js ${project} ${featurestoreId1} ${fixedNodeCount} ${location} ${apiEndpoint}`
    );
  });
  before('should create a featurestore with autoscaling', async () => {
    execSync(
      `node ./create-featurestore-sample.js ${project} ${featurestoreId2} ${minNodeCount} ${maxNodeCount} ${location} ${apiEndpoint}`
    );
  });
  it('should get the featurestore', async () => {
    const stdout = execSync(
      `node ./get-featurestore-sample.js ${project} ${featurestoreId1} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Get featurestore response/);
  });
  it('should list the featurestores', async () => {
    const stdout = execSync(
      `node ./list-featurestores-sample.js ${project} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /List featurestores response/);
  });
  it('should list the featurestores asynchronously', async () => {
    const stdout = execSync(
      `node ./list-featurestores-async-sample.js ${project} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /List featurestores async response/);
  });
  it('should list the featurestores in streaming', async () => {
    const stdout = execSync(
      `node ./list-featurestores-stream-sample.js ${project} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /List featurestores stream response/);
  });
  it('should update featurestores fixed nodes', async () => {
    const stdout = execSync(
      `node ./update-featurestore-fixed-nodes-sample.js ${project} ${featurestoreId1} ${updatedFixedNodeCount} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Update featurestore fixed nodes response/);
  });
  it('should update featurestore autoscaling', async () => {
    const stdout = execSync(
      `node ./update-featurestore-sample.js ${project} ${featurestoreId2} ${updatedMinNodeCount} ${updatedMaxNodeCount} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Update featurestore response/);
  });
  it('should delete the created featurestore', async () => {
    const stdout = execSync(
      `node ./delete-featurestore-sample.js ${project} ${featurestoreId1} true ${location}`
    );
    assert.match(stdout, /Delete featurestore response/);
  });
  after('should delete the created featurestore 2', async () => {
    execSync(
      `node ./delete-featurestore-sample.js ${project} ${featurestoreId2} true ${location}`
    );
  });
});
