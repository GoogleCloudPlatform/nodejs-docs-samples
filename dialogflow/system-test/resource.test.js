/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node resource.js';
const cwd = path.join(__dirname, '..');
const sessionId = require('uuid/v1')();
const contextName = 'fake_context_name';
const displayName = 'fake_display_name';
const entityName = 'fake_entity';
const synonym1 = 'synonym_1';
const synonym2 = 'synonym_2';
const phrase1 = 'training_phrase_1';
const phrase2 = 'training_phrase_2';
const message1 = 'message_1';
const message2 = 'message_2';

it('Test creating / listing / deleting a context.', async () => {
  let output = await tools.runAsync(
    `${cmd} create-context -s ${sessionId} -c ${contextName} -l 3`,
    cwd
  );
  assert.strictEqual(output.includes(sessionId), true);
  assert.strictEqual(output.includes(contextName), true);

  output = await tools.runAsync(`${cmd} list-contexts -s ${sessionId}`, cwd);
  assert.strictEqual(output.includes(sessionId), true);
  assert.strictEqual(output.includes(contextName), true);
  assert.strictEqual(output.includes('3'), true);

  output = await tools.runAsync(
    `${cmd} delete-context -s ${sessionId} -c ${contextName}`,
    cwd
  );
  assert.strictEqual(output.includes(sessionId), true);
  assert.strictEqual(output.includes(contextName), true);

  output = await tools.runAsync(`${cmd} list-contexts -s ${sessionId}`, cwd);
  assert.strictEqual(output.includes(sessionId), false);
  assert.strictEqual(output.includes(contextName), false);
});

it('Test creating / listing / deleting a entity type and entity.', async () => {
  // Create the Entity Type
  let output = await tools.runAsync(
    `${cmd} create-entity-type -d ${displayName} -k KIND_MAP`,
    cwd
  );
  assert.strictEqual(output.includes('entityTypes'), true);

  const entityTypeId = output.split(' ')[1].split('/')[4];

  // List the Entity Type
  output = await tools.runAsync(`${cmd} list-entity-types`, cwd);
  assert.strictEqual(output.includes(displayName), true);
  assert.strictEqual(output.includes(entityTypeId), true);

  // Create an Entity for the Entity Type
  output = await tools.runAsync(
    `${cmd} create-entity -e ${entityTypeId} -v ${entityName} -s ${synonym1} -s ${synonym2}`,
    cwd
  );

  // List the Entity
  output = await tools.runAsync(`${cmd} list-entities -e ${entityTypeId}`, cwd);
  assert.strictEqual(output.includes(entityName), true);
  assert.strictEqual(output.includes(synonym1), true);
  assert.strictEqual(output.includes(synonym2), true);

  // Delete the Entity
  output = await tools.runAsync(
    `${cmd} delete-entity -e ${entityTypeId} -v ${entityName}`,
    cwd
  );
  assert.strictEqual(output.includes(entityName), true);

  // Verify the Entity is Deleted
  output = await tools.runAsync(`${cmd} list-entities -e ${entityTypeId}`, cwd);
  assert.strictEqual(output.includes(entityName), false);
  assert.strictEqual(output.includes(synonym1), false);
  assert.strictEqual(output.includes(synonym2), false);

  // Delete the Entity Type
  output = await tools.runAsync(
    `${cmd} delete-entity-type -e ${entityTypeId}`,
    cwd
  );
  assert.strictEqual(output.includes(entityTypeId), true);

  // Verify the Entity Type is Deleted
  output = await tools.runAsync(`${cmd} list-entity-types`, cwd);
  assert.strictEqual(output.includes(displayName), false);
  assert.strictEqual(output.includes(entityTypeId), false);
});

it('Test creating / listing / deleting a intent.', async () => {
  let output = await tools.runAsync(
    `${cmd} create-intent -d ${displayName} -t ${phrase1} -t ${phrase2} -m ${message1} -m ${message2}`,
    cwd
  );
  assert.strictEqual(output.includes('intents'), true);
  const intentId = output.split(' ')[1].split('/')[4];

  output = await tools.runAsync(`${cmd} list-intents`, cwd);
  assert.strictEqual(output.includes(intentId), true);
  assert.strictEqual(output.includes(displayName), true);

  output = await tools.runAsync(`${cmd} delete-intent -i ${intentId}`, cwd);
  assert.strictEqual(output.includes(intentId), true);

  output = await tools.runAsync(`${cmd} list-intents`, cwd);
  assert.strictEqual(output.includes(intentId), false);
  assert.strictEqual(output.includes(displayName), false);
});

it('Test creating / listing / deleting a session entity type', async () => {
  // Create the Entity Type
  let output = await tools.runAsync(
    `${cmd} create-entity-type -d ${displayName} -k KIND_MAP`,
    cwd
  );
  assert.strictEqual(output.includes('entityTypes'), true);

  const entityTypeId = output.split(' ')[1].split('/')[4];

  // List the Entity Type
  output = await tools.runAsync(`${cmd} list-entity-types`, cwd);
  assert.strictEqual(output.includes(displayName), true);
  assert.strictEqual(output.includes(entityTypeId), true);

  // Create a Session Entity Type
  output = await tools.runAsync(
    `${cmd} create-session-entity-type -s ${sessionId} -e ${synonym1} -e ${synonym2} -d ${displayName} -o ENTITY_OVERRIDE_MODE_OVERRIDE`,
    cwd
  );
  assert.strictEqual(output.includes(sessionId), true);
  assert.strictEqual(output.includes(displayName), true);
  assert.strictEqual(output.includes(synonym1), true);
  assert.strictEqual(output.includes(synonym2), true);

  // List the Session Entity Type
  output = await tools.runAsync(
    `${cmd} list-session-entity-types -s ${sessionId}`,
    cwd
  );
  assert.strictEqual(output.includes(sessionId), true);
  assert.strictEqual(output.includes(displayName), true);
  assert.strictEqual(output.includes('2'), true);

  // Delete the Session Entity Type
  output = await tools.runAsync(
    `${cmd} delete-session-entity-type -s ${sessionId} -d ${displayName}`,
    cwd
  );
  assert.strictEqual(output.includes(displayName), true);

  // Verify the Session Entity Type is Deleted
  output = await tools.runAsync(
    `${cmd} list-session-entity-types -s ${sessionId}`,
    cwd
  );
  assert.strictEqual(output.includes(sessionId), false);
  assert.strictEqual(output.includes(displayName), false);
  assert.strictEqual(output.includes('2'), false);

  // Delete the Entity Type
  output = await tools.runAsync(
    `${cmd} delete-entity-type -e ${entityTypeId}`,
    cwd
  );
  assert.strictEqual(output.includes(entityTypeId), true);

  // Verify the Entity Type is Deleted
  output = await tools.runAsync(`${cmd} list-entity-types`, cwd);
  assert.strictEqual(output.includes(displayName), false);
  assert.strictEqual(output.includes(entityTypeId), false);
});
