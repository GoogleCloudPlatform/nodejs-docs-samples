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

/* eslint-disable */

'use strict';

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');
const uuid = require('uuid')
const sinon = require('sinon');

const {tuneModel} = require('../tuning');

const projectId = process.env.CAIP_PROJECT_ID;
let timestampId = `${new Date().toISOString().replace(/(:|\.)/g, '-').toLowerCase()}`
let pipelineJobId = `my-tuning-pipeline-${timestampId}`
let modelDisplayName = `my-tuned-model-${timestampId}`
let gcsOutputDirectory = 'gs://video-erschmid/tune-model';

describe('Tune a model', () => {
  // Test takes longer than default 2 sec
  //this.timeout(0);

  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };

  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  //before(async () => {
    // create a bucket
  //});
  
  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('should prompt-tune an existing model', async () => {
    // Act
    await tuneModel(projectId, pipelineJobId, modelDisplayName, gcsOutputDirectory);

    // Assert
    assert.include(console.log.firstCall.args, 'Tuning pipeline job:');
  });

  //after(async ()=>{
    // destroy bucket
  //});
});