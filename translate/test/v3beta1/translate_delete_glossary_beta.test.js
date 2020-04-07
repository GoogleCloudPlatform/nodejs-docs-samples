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
const {describe, it, before} = require('mocha');
const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const REGION_TAG = 'translate_delete_glossary_beta';
const uuid = require('uuid');

describe(REGION_TAG, () => {
  const translationClient = new TranslationServiceClient();
  const location = 'us-central1';
  const glossaryId = `test_glossary_${uuid.v4()}`;

  before(async () => {
    // Add a glossary to be deleted
    // const translationClient = new TranslationServiceClient();
    const projectId = await translationClient.getProjectId();
    const glossary = {
      languageCodesSet: {
        languageCodes: ['en', 'es'],
      },
      inputConfig: {
        gcsSource: {
          inputUri: 'gs://cloud-samples-data/translation/glossary.csv',
        },
      },
      name: translationClient.glossaryPath(projectId, location, glossaryId),
    };

    // Construct request
    const request = {
      parent: translationClient.locationPath(projectId, location),
      glossary: glossary,
    };

    // Create glossary using a long-running operation.
    // You can wait for now, or get results later.
    const [operation] = await translationClient.createGlossary(request);

    // Wait for operation to complete.
    await operation.promise();
  });

  it('should delete a glossary', async () => {
    const projectId = await translationClient.getProjectId();

    const output = execSync(
      `node v3beta1/${REGION_TAG}.js ${projectId} ${location} ${glossaryId}`
    );
    assert.include(output, glossaryId);
  });
});
