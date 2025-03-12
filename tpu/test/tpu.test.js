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

// TODO: remove this comment, used to trigger tests only

const assert = require('node:assert/strict');
const {beforeEach, afterEach, describe, it} = require('mocha');
const sinon = require('sinon');
const createVM = require('../createVM.js');
const deleteVM = require('../deleteVM.js');
const getVM = require('../getVM.js');
const getVMList = require('../getVMList.js');
const startVM = require('../startVM.js');
const stopVM = require('../stopVM.js');

describe('Compute tpu', async () => {
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

  it('should create a new tpu node', async () => {
    tpuClientMock.createNode = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            name: nodeName,
          },
        ]),
      },
    ]);

    const response = await createVM(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.createNode,
      sinon.match({
        parent: `projects/${projectId}/locations/${zone}`,
        node: {
          name: nodeName,
          zone,
        },
        nodeId: nodeName,
      })
    );
    assert(response.name.includes(nodeName));
  });

  it('should return tpu node', async () => {
    tpuClientMock.getNode = sinon.stub().resolves([
      {
        name: nodeName,
      },
    ]);

    const response = await getVM(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.getNode,
      sinon.match({
        name: `projects/${projectId}/locations/${zone}/nodes/${nodeName}`,
      })
    );
    assert(response.name.includes(nodeName));
  });

  it('should return list of tpu nodes', async () => {
    const nodes = [
      {
        name: nodeName,
      },
      {
        name: 'node-name-2',
      },
    ];

    tpuClientMock.listNodes = sinon.stub().resolves([nodes]);
    const response = await getVMList(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.listNodes,
      sinon.match({
        parent: `projects/${projectId}/locations/${zone}`,
      })
    );
    assert.deepEqual(response, nodes);
  });

  it('should stop tpu node', async () => {
    const message = `Node: ${nodeName} stopped.`;
    tpuClientMock.stopNode = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            message,
          },
        ]),
      },
    ]);
    const response = await stopVM(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.stopNode,
      sinon.match({
        name: `projects/${projectId}/locations/${zone}/nodes/${nodeName}`,
      })
    );
    assert(response.message.includes(message));
  });

  it('should start tpu node', async () => {
    const message = `Node: ${nodeName} started.`;
    tpuClientMock.startNode = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            message,
          },
        ]),
      },
    ]);
    const response = await startVM(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.startNode,
      sinon.match({
        name: `projects/${projectId}/locations/${zone}/nodes/${nodeName}`,
      })
    );
    assert(response.message.includes(message));
  });

  it('should delete tpu node', async () => {
    const message = `Node: ${nodeName} deleted.`;
    tpuClientMock.deleteNode = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            message,
          },
        ]),
      },
    ]);
    const response = await deleteVM(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.deleteNode,
      sinon.match({
        name: `projects/${projectId}/locations/${zone}/nodes/${nodeName}`,
      })
    );
    assert(response.message.includes(message));
  });
});
