// Copyright 2023 Google LLC
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
const sinon = require('sinon');

const {createSavedQuery} = require('../createSavedQuery.js');
const {deleteSavedQuery} = require('../deleteSavedQuery.js');
const {getSavedQuery} = require('../getSavedQuery.js');
const {listSavedQueries} = require('../listSavedQueries.js');
const {updateSavedQuery} = require('../updateSavedQuery.js');

const queryId = 'new-query-id';

const compute = require('@google-cloud/compute');
const instancesClient = new compute.InstancesClient();
const {ProjectsClient} = require('@google-cloud/resource-manager').v3;
const projectClient = new ProjectsClient();

describe('saved query sample tests', () => {
  let savedQueryFullName;

  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };
  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  beforeEach(stubConsole);
  afterEach(restoreConsole);

  before(async () => {
    const projectId = await instancesClient.getProjectId();
    const projectRequest = {
      name: `projects/${projectId}`,
    };
    const [projectResponse] = await projectClient.getProject(projectRequest);
    const projectNumericalId = projectResponse.name;
    savedQueryFullName = `${projectNumericalId}/savedQueries/${queryId}`;
  });

  it('should create saved query successfully', async () => {
    const description = 'description';
    await createSavedQuery(queryId, description);
    assert.include(console.log.firstCall.args, savedQueryFullName);
  });

  it('should list saved queries successfully', async () => {
    await listSavedQueries();
    assert.include(
      console.log.lastCall.args,
      'Listed saved queries successfully.'
    );
  });

  it('should get saved query successfully', async () => {
    await getSavedQuery(savedQueryFullName);
    assert.include(console.log.firstCall.args, savedQueryFullName);
  });

  it('should update saved query successfully', async () => {
    const newDescription = 'newDescription';
    await updateSavedQuery(savedQueryFullName, newDescription);
    assert.include(console.log.firstCall.args, savedQueryFullName);
    assert.include(console.log.secondCall.args, newDescription);
  });

  it('should delete saved query successfully', async () => {
    await deleteSavedQuery(savedQueryFullName);
    assert.deepEqual(console.log.firstCall.args, [
      'Deleted saved query:',
      savedQueryFullName,
    ]);
  });
});
