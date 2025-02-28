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
const createQueuedResourceNetwork = require('../queuedResources/createQueuedResourceNetwork.js');

describe('TPU queued resource with specified network', async () => {
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

  it('should create queued resource', async () => {
    tpuClientMock.createQueuedResource = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            name: queuedResourceName,
          },
        ]),
      },
    ]);

    const response = await createQueuedResourceNetwork(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.createQueuedResource,
      sinon.match({
        parent: `projects/${projectId}/locations/${zone}`,
        queuedResource: {
          name: queuedResourceName,
          tpu: {
            nodeSpec: [
              sinon.match({
                parent: `projects/${projectId}/locations/${zone}`,
                node: {
                  networkConfig: {
                    network: `projects/${projectId}/global/networks/compute-tpu-network`,
                    subnetwork: `projects/${projectId}/regions/us-central1/subnetworks/compute-tpu-network`,
                    enableExternalIps: true,
                  },
                },
                nodeId: nodeName,
              }),
            ],
          },
        },
        queuedResourceId: queuedResourceName,
      })
    );
    assert(response.name.includes(queuedResourceName));
  });
});
