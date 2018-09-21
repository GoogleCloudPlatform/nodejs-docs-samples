/**
 * Copyright 2017, Google, Inc.
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

const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = 'node resource.js';
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

test.serial('Test creating / listing / deleting a context.', async t => {
  let output = await tools.runAsync(
    `${cmd} create-context -s ${sessionId} -c ${contextName} -l 3`
  );
  t.true(output.includes(sessionId));
  t.true(output.includes(contextName));

  output = await tools.runAsync(`${cmd} list-contexts -s ${sessionId}`);
  t.true(output.includes(sessionId));
  t.true(output.includes(contextName));
  t.true(output.includes('3'));

  output = await tools.runAsync(
    `${cmd} delete-context -s ${sessionId} -c ${contextName}`
  );
  t.true(output.includes(sessionId));
  t.true(output.includes(contextName));

  output = await tools.runAsync(`${cmd} list-contexts -s ${sessionId}`);
  t.false(output.includes(sessionId));
  t.false(output.includes(contextName));
});

test.serial(
  'Test creating / listing / deleting a entity type and entity.',
  async t => {
    // Create the Entity Type
    let output = await tools.runAsync(
      `${cmd} create-entity-type -d ${displayName} -k KIND_MAP`
    );
    t.true(output.includes('entityTypes'));

    const entityTypeId = output.split(' ')[1].split('/')[4];

    // List the Entity Type
    output = await tools.runAsync(`${cmd} list-entity-types`);
    t.true(output.includes(displayName));
    t.true(output.includes(entityTypeId));

    // Create an Entity for the Entity Type
    output = await tools.runAsync(
      `${cmd} create-entity -e ${entityTypeId} -v ${entityName} -s ${synonym1} -s ${synonym2}`
    );

    // List the Entity
    output = await tools.runAsync(`${cmd} list-entities -e ${entityTypeId}`);
    t.true(output.includes(entityName));
    t.true(output.includes(synonym1));
    t.true(output.includes(synonym2));

    // Delete the Entity
    output = await tools.runAsync(
      `${cmd} delete-entity -e ${entityTypeId} -v ${entityName}`
    );
    t.true(output.includes(entityName));

    // Verify the Entity is Deleted
    output = await tools.runAsync(`${cmd} list-entities -e ${entityTypeId}`);
    t.false(output.includes(entityName));
    t.false(output.includes(synonym1));
    t.false(output.includes(synonym2));

    // Delete the Entity Type
    output = await tools.runAsync(
      `${cmd} delete-entity-type -e ${entityTypeId}`
    );
    t.true(output.includes(entityTypeId));

    // Verify the Entity Type is Deleted
    output = await tools.runAsync(`${cmd} list-entity-types`);
    t.false(output.includes(displayName));
    t.false(output.includes(entityTypeId));
  }
);

test.serial('Test creating / listing / deleting a intent.', async t => {
  let output = await tools.runAsync(
    `${cmd} create-intent -d ${displayName} -t ${phrase1} -t ${phrase2} -m ${message1} -m ${message2}`
  );
  t.true(output.includes('intents'));
  const intentId = output.split(' ')[1].split('/')[4];

  output = await tools.runAsync(`${cmd} list-intents`);
  t.true(output.includes(intentId));
  t.true(output.includes(displayName));

  output = await tools.runAsync(`${cmd} delete-intent -i ${intentId}`);
  t.true(output.includes(intentId));

  output = await tools.runAsync(`${cmd} list-intents`);
  t.false(output.includes(intentId));
  t.false(output.includes(displayName));
});

test.serial(
  'Test creating / listing / deleting a session entity type',
  async t => {
    // Create the Entity Type
    let output = await tools.runAsync(
      `${cmd} create-entity-type -d ${displayName} -k KIND_MAP`
    );
    t.true(output.includes('entityTypes'));

    const entityTypeId = output.split(' ')[1].split('/')[4];

    // List the Entity Type
    output = await tools.runAsync(`${cmd} list-entity-types`);
    t.true(output.includes(displayName));
    t.true(output.includes(entityTypeId));

    // Create a Session Entity Type
    output = await tools.runAsync(
      `${cmd} create-session-entity-type -s ${sessionId} -e ${synonym1} -e ${synonym2} -d ${displayName} -o ENTITY_OVERRIDE_MODE_OVERRIDE`
    );
    t.true(output.includes(sessionId));
    t.true(output.includes(displayName));
    t.true(output.includes(synonym1));
    t.true(output.includes(synonym2));

    // List the Session Entity Type
    output = await tools.runAsync(
      `${cmd} list-session-entity-types -s ${sessionId}`
    );
    t.true(output.includes(sessionId));
    t.true(output.includes(displayName));
    t.true(output.includes('2'));

    // Delete the Session Entity Type
    output = await tools.runAsync(
      `${cmd} delete-session-entity-type -s ${sessionId} -d ${displayName}`
    );
    t.true(output.includes(displayName));

    // Verify the Session Entity Type is Deleted
    output = await tools.runAsync(
      `${cmd} list-session-entity-types -s ${sessionId}`
    );
    t.false(output.includes(sessionId));
    t.false(output.includes(displayName));
    t.false(output.includes('2'));

    // Delete the Entity Type
    output = await tools.runAsync(
      `${cmd} delete-entity-type -e ${entityTypeId}`
    );
    t.true(output.includes(entityTypeId));

    // Verify the Entity Type is Deleted
    output = await tools.runAsync(`${cmd} list-entity-types`);
    t.false(output.includes(displayName));
    t.false(output.includes(entityTypeId));
  }
);
