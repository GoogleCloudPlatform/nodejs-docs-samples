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
const forceDeleteQueuedResource = require('../queuedResources/forceDeleteQueuedResource.js');

describe('TPU queued resource force deletion', async () => {
  const queuedResourceName = 'queued-resource-1';
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

  it('should force queued resource deletion', async () => {
    const message = `Queued resource ${queuedResourceName} deletion forced.`;
    tpuClientMock.deleteQueuedResource = sinon.stub().resolves([
      {
        promise: sinon.stub().resolves([
          {
            message,
          },
        ]),
      },
    ]);

    const response = await forceDeleteQueuedResource(tpuClientMock);

    sinon.assert.calledWith(
      tpuClientMock.deleteQueuedResource,
      sinon.match({
        name: `projects/${projectId}/locations/${zone}/queuedResources/${queuedResourceName}`,
        force: true,
      })
    );
    assert(response.message.includes(message));
  });
});
