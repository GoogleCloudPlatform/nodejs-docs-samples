/*
 * Copyright 2024 Google LLC
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

const assert = require('node:assert/strict');
const {beforeEach, afterEach, describe, it} = require('mocha');
const sinon = require('sinon');
const createTopologyVM = require('../createTopologyVM.js');

describe('Compute tpu with topology', async () => {
  const nodeName = 'node-name-1';
  const zone = 'europe-west4-a';
  const projectId = 'project_id';
  let tpuClientMock;

  beforeEach(() => {
    tpuClientMock = {
      getProjectId: sinon.stub().resolves(projectId),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new tpu with topology', async () => {
    tpuClientMock.createNode = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            name: nodeName,
          },
        ]),
      },
    ]);

    const response = await createTopologyVM(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.createNode,
      sinon.match({
        parent: `projects/${projectId}/locations/${zone}`,
        node: {
          name: nodeName,
          acceleratorConfig: {type: 2, topology: '2x2'},
        },
        nodeId: nodeName,
      })
    );
    assert(response.name.includes(nodeName));
  });
});
