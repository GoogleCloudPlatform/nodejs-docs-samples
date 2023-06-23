/*
 * Copyright 2023 Google LLC
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

const {assert} = require('chai');
const {describe, it} = require('mocha');
const sinon = require('sinon');

const LOCATION = 'us-central1';
const project = process.env.CAIP_PROJECT_ID;

const {listTunedModels} = require('../list-tuned-models');

describe('List tuned models', async () => {
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

  it('should list all tuned LLM models', async () => {
    await listTunedModels(project, LOCATION);
    assert.include(console.log.firstCall.args, 'List Tuned Models response');
  });
});
