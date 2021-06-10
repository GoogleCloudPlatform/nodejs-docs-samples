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
const {describe, it, before, after} = require('mocha');
const {TranslationServiceClient} = require('@google-cloud/translate');
const {Storage} = require('@google-cloud/storage');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const GLOSSARY_ID = 'DO_NET_DELETE_TEST_GLOSSARY_ES';
const REGION_TAG = 'translate_batch_translate_text_with_glossary';

async function clearBucket(projectId, storage, bucketUuid) {
  const options = {
    prefix: `translation-${bucketUuid}/BATCH_TRANSLATE_WITH_GLOS_OUTPUT/`,
    delimeter: '/',
  };

  const bucket = await storage.bucket(projectId);
  const [files] = await bucket.getFiles(options);
  const length = files.length;
  if (length > 0) {
    await Promise.all(files.map(file => file.delete()));
  }
}

describe(REGION_TAG, () => {
  const translationClient = new TranslationServiceClient();
  const location = 'us-central1';
  const bucketUuid = uuid.v4();
  const bucketName = `translation-${bucketUuid}/BATCH_TRANSLATE_WITH_GLOS_OUTPUT/`;
  const storage = new Storage();

  before(async () => {
    const projectId = await translationClient.getProjectId();

    //Create bucket if needed
    await storage
      .createBucket(projectId, {
        location: 'US',
        storageClass: 'COLDLINE',
      })
      .catch(error => {
        if (error.code !== 409) {
          //if it's not a duplicate bucket error, let the user know
          console.error(error);
        }
      });
  });

  it('should batch translate the input text with a glossary', async function () {
    this.retries(3);
    const projectId = await translationClient.getProjectId();
    // make sure the bucket is empty.
    await clearBucket(projectId, storage, bucketUuid);
    const inputUri = 'gs://cloud-samples-data/translation/text.txt';

    const outputUri = `gs://${projectId}/${bucketName}`;
    const output = execSync(
      `node v3/${REGION_TAG}.js ${projectId} ${location} ${inputUri} ${outputUri} ${GLOSSARY_ID}`
    );
    assert.match(output, /Total Characters: 13/);
    assert.match(output, /Translated Characters: 13/);
  });

  // Delete the folder from GCS for cleanup
  after(async () => {
    const projectId = await translationClient.getProjectId();
    const options = {
      prefix: `translation-${bucketUuid}`,
    };

    const bucket = await storage.bucket(projectId);
    const [files] = await bucket.getFiles(options);
    const length = files.length;
    if (length > 0) {
      await Promise.all(files.map(file => file.delete()));
    }
  });
});
