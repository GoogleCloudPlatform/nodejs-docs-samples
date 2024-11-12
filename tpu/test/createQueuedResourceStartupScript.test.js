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
const createQueuedResourceStartupScript = require('../queuedResources/createQueuedResourceStartupScript.js');

describe('TPU queued resource with start-up script', async () => {
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

    const response = await createQueuedResourceStartupScript(tpuClientMock);

    sinon.match({
      parent: `projects/${projectId}/locations/${zone}`,
      queuedResource: {
        name: queuedResourceName,
        tpu: {
          nodeSpec: [
            {
              parent: `projects/${projectId}/locations/${zone}`,
              node: {
                metadata: {
                  'startup-script':
                    '#!/bin/bash\n          echo "Hello World" > /var/log/hello.log\n          sudo pip3 install --upgrade numpy >> /var/log/hello.log 2>&1',
                },
              },
              nodeId: nodeName,
            },
          ],
        },
      },
      queuedResourceId: queuedResourceName,
    });
    assert(response.name.includes(queuedResourceName));
  });
});
