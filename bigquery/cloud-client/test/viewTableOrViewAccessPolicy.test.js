// Copyright 2025 Google LLC
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

const assert = require('assert');
const {
  getProjectId,
  getDataset,
  getTable,
  getView,
  setupBeforeAll,
  teardownAfterAll,
} = require('./config.js');
const viewTableOrViewAccessPolicy = require('../viewTableOrViewAccessPolicy.js');

describe('viewTableOrViewAccessPolicy', () => {
  before(async () => {
    await setupBeforeAll();
  });

  after(async () => {
    await teardownAfterAll();
  });

  it('should view table access policies', async () => {
    const projectId = await getProjectId();
    const dataset = await getDataset();
    const table = await getTable();

    const policy = await viewTableOrViewAccessPolicy(
      projectId,
      dataset.id,
      table.id
    );

    // Verificar que la política existe
    assert.ok(policy, 'Policy should be defined');

    // Verificar que bindings existe y es un array
    assert.ok(Array.isArray(policy.bindings), 'Bindings should be an array');

    // En una política nueva, bindings debería estar vacío
    assert.strictEqual(
      policy.bindings.length,
      0,
      'Bindings list should be empty'
    );

    // Verificar que etag existe, pero no validar su valor exacto
    assert.ok(policy.etag, 'Etag should be defined');
  });

  it('should view view access policies', async () => {
    const projectId = await getProjectId();
    const dataset = await getDataset();
    const view = await getView();

    const policy = await viewTableOrViewAccessPolicy(
      projectId,
      dataset.id,
      view.id
    );

    // Verificar que la política existe
    assert.ok(policy, 'Policy should be defined');

    // Verificar que bindings existe y es un array
    assert.ok(Array.isArray(policy.bindings), 'Bindings should be an array');

    // En una política nueva, bindings debería estar vacío
    assert.strictEqual(
      policy.bindings.length,
      0,
      'Bindings list should be empty'
    );

    // Verificar que etag existe, pero no validar su valor exacto
    assert.ok(policy.etag, 'Etag should be defined');
  });
});
