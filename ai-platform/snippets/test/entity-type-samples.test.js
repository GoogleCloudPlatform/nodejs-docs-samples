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
const {FeaturestoreServiceClient} = require('@google-cloud/aiplatform').v1;
import {after, before, describe, it} from 'mocha';
import {v4 as uuid} from 'uuid';
import cp from 'node:child_process';
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const project = process.env.CAIP_PROJECT_ID;
const featurestoreId = `featurestore_sample_${uuid()
  .replace(/-/g, '_')
  .slice(10, 20)}`;
const fixedNodeCount = 1;
const entityTypeId1 = `entity_type_sample_${uuid()
  .replace(/-/g, '_')
  .slice(10, 20)}`;
const entityTypeId2 = `entity_type_sample_${uuid()
  .replace(/-/g, '_')
  .slice(10, 20)}`;
const entityType1Description =
  'created during the entity type 1 sample testing';
const entityType2Description =
  'created during the entity type 2 sample testing';
const duration = 86400;
const updatedDuration = 172800;
const location = 'us-central1';
const apiEndpoint = 'us-central1-aiplatform.googleapis.com';

// Instantiates a featurestore clients
const featurestoreServiceClient = new FeaturestoreServiceClient({
  apiEndpoint: apiEndpoint,
});

const deleteFeaturestore = async () => {
  // Configure the name resource
  const name = `projects/${project}/locations/${location}/featurestores/${featurestoreId}`;

  const request = {
    name: name,
    force: true,
  };

  // Delete Featurestore request
  const [operation] = await featurestoreServiceClient.deleteFeaturestore(
    request,
    {timeout: 60000}
  );
  await operation.promise();
};

describe('AI platform entity type api samples test', async function () {
  this.retries(2);
  before('should create the featurestore', async () => {
    execSync(
      `node ./create-featurestore-fixed-nodes-sample.js ${project} ${featurestoreId} ${fixedNodeCount} ${location} ${apiEndpoint}`
    );
  });
  it('should create the entity type', async () => {
    const stdout = execSync(
      `node ./create-entity-type-sample.js ${project} ${featurestoreId} ${entityTypeId1} "${entityType1Description}" ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Create entity type response/);
  });
  it('should create the entity type with monitoring', async () => {
    const stdout = execSync(
      `node ./create-entity-type-monitoring-sample.js ${project} ${featurestoreId} ${entityTypeId2} "${entityType2Description}" ${duration} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Create entity type monitoring response/);
  });
  it('should get the created entity type', async () => {
    const stdout = execSync(
      `node ./get-entity-type-sample.js ${project} ${featurestoreId} ${entityTypeId1} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Get entity type response/);
  });
  it('should list the entity types', async () => {
    const stdout = execSync(
      `node ./list-entity-types-sample.js ${project} ${featurestoreId} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /List entity types response/);
  });
  it('should list the entity types asynchronously', async () => {
    const stdout = execSync(
      `node ./list-entity-types-async-sample.js ${project} ${featurestoreId} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /List entity types async response/);
  });
  it('should list the entity types in streaming', async () => {
    const stdout = execSync(
      `node ./list-entity-types-stream-sample.js ${project} ${featurestoreId} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /List entity types stream response/);
  });
  it('should update the entity type', async () => {
    const stdout = execSync(
      `node ./update-entity-type-sample.js ${project} ${featurestoreId} ${entityTypeId1} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Update entity type response/);
  });
  it('should update the entity type monitoring', async () => {
    const stdout = execSync(
      `node ./update-entity-type-monitoring-sample.js ${project} ${featurestoreId} ${entityTypeId2} ${updatedDuration} ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Update entity type monitoring response/);
  });
  it('should delete the created entity type', async () => {
    const stdout = execSync(
      `node ./delete-entity-type-sample.js ${project} ${featurestoreId} ${entityTypeId1} true ${location} ${apiEndpoint}`
    );
    assert.match(stdout, /Delete entity type response/);
  });
  after('should delete the created featurestore', async () => {
    await deleteFeaturestore();
  });
});
