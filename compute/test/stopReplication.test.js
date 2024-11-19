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

const {beforeEach, afterEach, describe, it} = require('mocha');
const assert = require('node:assert/strict');
const sinon = require('sinon');
const stopReplication = require('../disks/consistencyGroups/stopReplication.js');

describe('Consistency group', async () => {
  const consistencyGroupName = 'consistency-group-1';
  let disksClientMock;
  let zoneOperationsClientMock;

  beforeEach(() => {
    disksClientMock = {
      getProjectId: sinon.stub().resolves('project_id'),
      stopGroupAsyncReplication: sinon.stub().resolves([
        {
          name: consistencyGroupName,
          latestResponse: {
            status: 'DONE',
            name: 'operation-1234567890',
            zone: {
              value: 'us-central1-a',
            },
          },
        },
      ]),
    };
    zoneOperationsClientMock = {
      wait: sinon.stub().resolves([
        {
          latestResponse: {
            status: 'DONE',
          },
        },
      ]),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should stop replication for disks', async () => {
    const response = await stopReplication(
      disksClientMock,
      zoneOperationsClientMock
    );

    assert.equal(
      response,
      `Replication stopped for consistency group: ${consistencyGroupName}.`
    );
  });
});
