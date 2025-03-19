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
const createQueuedResource = require('../queuedResources/createQueuedResource.js');
const getQueuedResource = require('../queuedResources/getQueuedResource.js');
const getQueuedResourcesList = require('../queuedResources/getQueuedResourcesList.js');
const deleteQueuedResource = require('../queuedResources/deleteQueuedResource.js');

describe('TPU queued resource', () => {
  const queuedResourceName = 'queued-resource-1';
  const nodeName = 'node-name-1';
  const zone = 'us-central1-a';
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

  it('should create a new queued resource', async () => {
    tpuClientMock.createQueuedResource = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            name: queuedResourceName,
          },
        ]),
      },
    ]);

    const response = await createQueuedResource(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.createQueuedResource,
      sinon.match({
        parent: `projects/${projectId}/locations/${zone}`,
        queuedResource: {
          name: queuedResourceName,
        },
        queuedResourceId: queuedResourceName,
      })
    );
    assert(response.name.includes(queuedResourceName));
  });

  it('should return requested queued resource', async () => {
    tpuClientMock.getQueuedResource = sinon.stub().resolves([
      {
        name: queuedResourceName,
      },
    ]);

    const response = await getQueuedResource(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.getQueuedResource,
      sinon.match({
        name: `projects/${projectId}/locations/${zone}/queuedResources/${queuedResourceName}`,
      })
    );
    assert(response.name.includes(queuedResourceName));
  });

  it('should return list of queued resources', async () => {
    const queuedResources = [
      {
        name: queuedResourceName,
      },
      {
        name: 'queued-resource-2',
      },
    ];
    tpuClientMock.listQueuedResources = sinon
      .stub()
      .resolves([queuedResources]);

    const response = await getQueuedResourcesList(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.listQueuedResources,
      sinon.match({
        parent: `projects/${projectId}/locations/${zone}`,
      })
    );
    assert.deepEqual(response, queuedResources);
  });

  it('should delete queued resource', async () => {
    tpuClientMock.getQueuedResource = sinon.stub().resolves([
      {
        name: queuedResourceName,
        tpu: {
          nodeSpec: [
            {
              nodeId: nodeName,
            },
          ],
        },
      },
    ]);
    tpuClientMock.deleteNode = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([]),
      },
    ]);
    tpuClientMock.deleteQueuedResource = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            message: `Queued resource ${queuedResourceName} deleted.`,
          },
        ]),
      },
    ]);

    const response = await deleteQueuedResource(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.getQueuedResource,
      sinon.match({
        name: `projects/${projectId}/locations/${zone}/queuedResources/${queuedResourceName}`,
      })
    );
    sinon.assert.calledWith(
      tpuClientMock.deleteNode,
      sinon.match({
        name: `projects/${projectId}/locations/${zone}/nodes/${nodeName}`,
      })
    );
    assert(
      response.message.includes(
        `Queued resource ${queuedResourceName} deleted.`
      )
    );
  });
});
