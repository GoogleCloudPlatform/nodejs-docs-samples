// Copyright 2020 Google LLC
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
const {describe, after, before, it} = require('mocha');
const execSync = require('child_process').execSync;
const uuid = require('uuid');
const dialogflow = require('@google-cloud/dialogflow');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('delete session entity types', () => {
  const client = new dialogflow.EntityTypesClient();
  const sessionClient = new dialogflow.SessionEntityTypesClient();
  const cmd = 'node resource.js';
  const sessionId = uuid.v1();
  const displayName = `fake_display_name_${uuid.v4().split('-')[0]}`;
  let entityTypeId;

  before('create a session entity type', async () => {
    // First create an entity type
    const projectId = await client.getProjectId();
    const createEntityTypeRequest = {
      parent: client.projectAgentPath(projectId),
      entityType: {
        displayName: displayName,
        kind: 'KIND_MAP',
      },
    };

    const responses = await client.createEntityType(createEntityTypeRequest);
    entityTypeId = responses[0].name.split('/')[4];

    // Create the session entity type
    const sessionEntityTypeRequest = {
      parent: sessionClient.projectAgentSessionPath(projectId, sessionId),
      sessionEntityType: {
        name: sessionClient.projectAgentSessionEntityTypePath(
          projectId,
          sessionId,
          displayName
        ),
        entityOverrideMode: 'ENTITY_OVERRIDE_MODE_OVERRIDE',
        entities: [
          {
            value: 'synonym1',
            synonyms: ['synonym2'],
          },
        ],
      },
    };
    await sessionClient.createSessionEntityType(sessionEntityTypeRequest);
  });

  it('should Delete the Session Entity Type', async () => {
    const output = exec(
      `${cmd} delete-session-entity-type -s ${sessionId} -d ${displayName}`
    );
    assert.include(output, displayName);
  });

  after('delete the created entity type', async () => {
    const projectId = await client.getProjectId();
    const request = {
      name: client.projectAgentEntityTypePath(projectId, entityTypeId),
    };
    await client.deleteEntityType(request);
  });
});
