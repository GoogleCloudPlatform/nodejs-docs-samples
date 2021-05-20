// Copyright 2021 Google LLC
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

/* eslint-disable */

'use strict';

const { v4: uuidv4 } = require('uuid');
const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');
const speech = require('@google-cloud/speech').v1p1beta1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const storageUri = 'gs://cloud-samples-tests/speech/brooklyn.flac';
const text = 'how old is the Brooklyn Bridge';
const adaptationClient = new speech.AdaptationClient();

const projectId = process.env.GCLOUD_PROJECT;
const location = 'us-west1'
const customClassId = uuidv4().replace(/-/g, '').substring(0, 15);
const phraseSetId = uuidv4().replace(/-/g, '').substring(0, 15);
const classParent = `projects/${projectId}/locations/${location}/customClasses/${customClassId}`;
const phraseParent = `projects/${projectId}/locations/${location}/phraseSets/${customClassId}`;

describe('modelAdaptation', () => {
    // TODO: investigate why this test fails when us-west1 used as location.
    // when set to global, it fails with 404.
    it.skip('should run modelAdaptation', async () => {
      const stdout = execSync(`node modelAdaptation.js ${projectId} ${location} ${storageUri} ${customClassId} ${phraseSetId}`)
      assert.match(stdout, /Transcription:/ );
    });
    after(async () => {
      // Release used resources
      // TODO: investigate why this test fails when us-west1 used as location.
      // when set to global, it fails with 404.
      // await cleanUp(classParent, phraseParent);
    })
});

async function cleanUp(classParent, phraseParent) {
    await adaptationClient.deleteCustomClass({ name: classParent });
    await adaptationClient.deletePhraseSet({ name: phraseParent });
}
