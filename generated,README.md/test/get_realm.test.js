// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const {RealmsServiceClient} = require('@google-cloud/game-servers');

const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const LOCATION = 'us-central1';

describe('Game Servers Get Realms Test', () => {
  const client = new RealmsServiceClient();
  let realmId;

  before(async () => {
    const projectId = await client.getProjectId();
    realmId = `test-${uuid.v4()}`;

    await client.createRealm({
      parent: `projects/${projectId}/locations/${LOCATION}`,
      realmId: realmId,
      realm: {
        timeZone: 'US/Pacific',
        description: 'Test Game Realm',
      },
    });
  });

  it('should get a realm', async () => {
    const projectId = await client.getProjectId();

    const get_output = execSync(
      `node get_realm.js ${projectId} ${LOCATION} ${realmId}`
    );
    assert.match(get_output, /Realm description:/);
  });

  after(async () => {
    const projectId = await client.getProjectId();
    const request = {
      name: `projects/${projectId}/locations/${LOCATION}/realms/${realmId}`,
    };
    const [operation] = await client.deleteRealm(request);
    await operation.promise();
  });
});
