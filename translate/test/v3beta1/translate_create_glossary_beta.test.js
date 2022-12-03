// Copyright 2019 Google LLC
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
const {describe, it, after} = require('mocha');
const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const REGION_TAG = 'translate_create_glossary_beta';
const uuid = require('uuid');

describe(REGION_TAG, () => {
  const translationClient = new TranslationServiceClient();
  const glossaryId = `test-glossary-${uuid.v4()}`;

  it('should create a glossary', async () => {
    const projectId = await translationClient.getProjectId();
    const location = 'us-central1';
    const output = execSync(
      `node v3beta1/${REGION_TAG}.js ${projectId} ${location} ${glossaryId}`
    );
    assert.match(
      output,
      /gs:\/\/cloud-samples-data\/translation\/glossary.csv/
    );
  });

  after('cleanup for glossary create', async () => {
    const projectId = await translationClient.getProjectId();
    const location = 'us-central1';
    // Delete the glossary to clean up
    const name = translationClient.glossaryPath(
      projectId,
      location,
      glossaryId
    );
    const request = {
      parent: translationClient.locationPath(projectId, location),
      name: name,
    };

    // Delete glossary using a long-running operation.
    // You can wait for now, or get results later.
    const [operation] = await translationClient.deleteGlossary(request);

    // Wait for operation to complete.
    await operation.promise();
  });
});
