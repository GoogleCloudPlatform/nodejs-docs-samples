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

const {assert} = require('chai');
const execSync = require('child_process').execSync;
const uuid = require('uuid');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('resources', () => {
  const cmd = 'node resource.js';
  const sessionId = uuid.v1();
  const contextName = 'fake_context_name';
  const displayName = `fake_display_name_${uuid.v4().split('-')[0]}`;
  const entityName = 'fake_entity';
  const synonym1 = 'synonym_1';
  const synonym2 = 'synonym_2';
  const phrase1 = 'training_phrase_1';
  const phrase2 = 'training_phrase_2';
  const message1 = 'message_1';
  const message2 = 'message_2';
  let entityTypeId;
  let intentId;

  it('should create a context', async () => {
    const output = exec(
      `${cmd} create-context -s ${sessionId} -c ${contextName} -l 3`
    );
    assert.include(output, sessionId);
    assert.include(output, contextName);
  });

  it('should list contexts', async () => {
    const output = exec(`${cmd} list-contexts -s ${sessionId}`);
    assert.include(output, sessionId);
    assert.include(output, contextName);
    assert.include(output, '3');
  });

  it('should delete a context', async () => {
    let output = exec(
      `${cmd} delete-context -s ${sessionId} -c ${contextName}`
    );
    assert.include(output, sessionId);
    assert.include(output, contextName);

    output = exec(`${cmd} list-contexts -s ${sessionId}`);
    assert.notInclude(output, sessionId);
    assert.notInclude(output, contextName);
  });

  it('should create an entity type and entity', async () => {
    const output = exec(
      `${cmd} create-entity-type -d ${displayName} -k KIND_MAP`
    );
    assert.include(output, 'entityTypes');
    entityTypeId = output.split(' ')[1].split('/')[4];
  });

  it('should List the Entity Type', async () => {
    const output = exec(`${cmd} list-entity-types`);
    assert.include(output, displayName);
    assert.include(output, entityTypeId);
  });

  it('should Create an Entity for the Entity Type', async () => {
    exec(
      `${cmd} create-entity -e ${entityTypeId} -v ${entityName} -s ${synonym1} -s ${synonym2}`
    );
  });

  it('should List the Entity', async () => {
    const output = exec(`${cmd} list-entities -e ${entityTypeId}`);
    assert.include(output, entityName);
    assert.include(output, synonym1);
    assert.include(output, synonym2);
  });

  it('should Delete the Entity', async () => {
    let output = exec(
      `${cmd} delete-entity -e ${entityTypeId} -v ${entityName}`
    );
    assert.include(output, entityName);

    // Verify the Entity is Deleted
    output = exec(`${cmd} list-entities -e ${entityTypeId}`);
    assert.notInclude(output, entityName);
    assert.notInclude(output, synonym1);
    assert.notInclude(output, synonym2);
  });

  it('should Delete the Entity Type', async () => {
    let output = exec(`${cmd} delete-entity-type -e ${entityTypeId}`);
    assert.include(output, entityTypeId);

    // Verify the Entity Type is Deleted
    output = exec(`${cmd} list-entity-types`);
    assert.notInclude(output, displayName);
    assert.notInclude(output, entityTypeId);
  });

  it('should create an intent', async () => {
    const output = exec(
      `${cmd} create-intent -d ${displayName} -t ${phrase1} -t ${phrase2} -m ${message1} -m ${message2}`
    );
    assert.include(output, 'intents');
    intentId = output.split(' ')[1].split('/')[4];
  });

  it('should list the intents', async () => {
    const output = exec(`${cmd} list-intents`);
    assert.include(output, intentId);
    assert.include(output, displayName);
  });

  it('should delete the intent', async () => {
    let output = exec(`${cmd} delete-intent -i ${intentId}`);
    assert.include(output, intentId);
    output = exec(`${cmd} list-intents`);
    assert.notInclude(output, intentId);
    assert.notInclude(output, displayName);
  });

  it('should create a session entity type', async () => {
    const output = exec(
      `${cmd} create-entity-type -d ${displayName} -k KIND_MAP`
    );
    assert.include(output, 'entityTypes');
    entityTypeId = output.split(' ')[1].split('/')[4];
  });

  it('should List the Entity Type', async () => {
    const output = exec(`${cmd} list-entity-types`);
    assert.include(output, displayName);
    assert.include(output, entityTypeId);
  });

  it('should Create a Session Entity Type', async () => {
    const output = exec(
      `${cmd} create-session-entity-type -s ${sessionId} -e ${synonym1} -e ${synonym2} -d ${displayName} -o ENTITY_OVERRIDE_MODE_OVERRIDE`
    );
    assert.include(output, sessionId);
    assert.include(output, displayName);
    assert.include(output, synonym1);
    assert.include(output, synonym2);
  });

  it('should List the Session Entity Type', async () => {
    const output = exec(
      `${cmd} list-session-entity-types -s ${sessionId}`
    );
    assert.include(output, sessionId);
    assert.include(output, displayName);
    assert.include(output, '2');
  });

  it('should Delete the Session Entity Type', async () => {
    let output = exec(
      `${cmd} delete-session-entity-type -s ${sessionId} -d ${displayName}`
    );
    assert.include(output, displayName);

    // Verify the Session Entity Type is Deleted
    output = exec(`${cmd} list-session-entity-types -s ${sessionId}`);
    assert.notInclude(output, sessionId);
    assert.notInclude(output, displayName);
    assert.notInclude(output, '2');
  });

  it('should Delete the Entity Type', async () => {
    let output = exec(`${cmd} delete-entity-type -e ${entityTypeId}`);
    assert.include(output, entityTypeId);

    // Verify the Entity Type is Deleted
    output = exec(`${cmd} list-entity-types`);
    assert.notInclude(output, displayName);
    assert.notInclude(output, entityTypeId);
  });
});
